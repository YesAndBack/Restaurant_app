from typing import List, Optional
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.bookings.models import Bookings
from app.bookings.schemas import BookingCreate, BookingResponse
from app.restaurants.models import Restaurant
from app.users.models import Users
from datetime import timedelta, date
import logging

logger = logging.getLogger(__name__)

class BookingDAO:
    @staticmethod
    async def create_booking(
        db: AsyncSession,
        user_id: int,
        booking_data: BookingCreate
    ) -> BookingResponse:
        """Create a new booking for a restaurant with pending status"""
        restaurant = await db.get(Restaurant, booking_data.restaurant_id)
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        # Check if the restaurant is already booked and confirmed for this date
        existing_booking = await db.execute(
            select(Bookings).filter(
                Bookings.restaurant_id == booking_data.restaurant_id,
                Bookings.booking_date == booking_data.booking_date,
                Bookings.status == "confirmed"
            )
        )
        if existing_booking.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Restaurant already booked for this date")

        booking = Bookings(
            user_id=user_id,
            restaurant_id=booking_data.restaurant_id,
            booking_date=booking_data.booking_date,
            booking_username = booking_data.booking_username,
            email = booking_data.email,
            phone_number = booking_data.phone_number,
            event_type = booking_data.event_type,
            number_of_guests = booking_data.number_of_guests,
            additional_information = booking_data.additional_information,
            status="pending"
        )
        db.add(booking)
        await db.commit()
        await db.refresh(booking)

        return BookingResponse(
            id=booking.id,
            user_id=booking.user_id,
            restaurant_id=booking.restaurant_id,
            booking_date=booking.booking_date,
            status=booking.status,
            booking_username=booking.booking_username,
            email=booking.email,
            phone_number=booking.phone_number,
            event_type=booking.event_type,
            number_of_guests=booking.number_of_guests,
            additional_information=booking.additional_information
        )
    
    @staticmethod
    async def get_bookings_by_restaurant(
        db: AsyncSession,
        restaurant_id: int
    ) -> List[BookingResponse]:
        """Get all bookings for a specific restaurant"""
        # Verify the restaurant exists
        restaurant = await db.get(Restaurant, restaurant_id)
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        # Fetch all bookings for the restaurant
        result = await db.execute(
            select(Bookings).filter(Bookings.restaurant_id == restaurant_id)
        )
        bookings = result.scalars().all()

        # Always return a list, even if empty
        return [
            BookingResponse(
                id=booking.id,
                user_id=booking.user_id,
                booking_username = booking.booking_username,
                email = booking.email,
                phone_number = booking.phone_number,
                event_type = booking.event_type,
                number_of_guests = booking.number_of_guests,
                additional_information = booking.additional_information,
                restaurant_id=booking.restaurant_id,
                booking_date=booking.booking_date,
                status=booking.status
            ) for booking in bookings
        ] if bookings else []
    
    @staticmethod
    async def get_bookings_by_user_id(
        db: AsyncSession,
        user_id: int
    ) -> List[BookingResponse]:
        """Get all bookings for a specific restaurant"""

        # Fetch all bookings for the restaurant
        result = await db.execute(
            select(Bookings)
            .join(Restaurant, Bookings.restaurant_id == Restaurant.id)
            .filter(Restaurant.owner_id == user_id)
        )

        bookings = result.scalars().all()

        # Always return a list, even if empty
        return [
            BookingResponse(
                id=booking.id,
                user_id=booking.user_id,
                booking_username = booking.booking_username,
                email = booking.email,
                phone_number = booking.phone_number,
                event_type = booking.event_type,
                number_of_guests = booking.number_of_guests,
                additional_information = booking.additional_information,
                restaurant_id=booking.restaurant_id,
                booking_date=booking.booking_date,
                status=booking.status
            ) for booking in bookings
        ] if bookings else []


    @staticmethod
    async def confirm_booking(
        db: AsyncSession,
        booking_id: int,
        admin_id: int
    ) -> BookingResponse:
        """Confirm a booking (admin only)"""
        booking = await db.get(Bookings, booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        # Check if already confirmed for this date by another booking
        existing_confirmed = await db.execute(
            select(Bookings).filter(
                Bookings.restaurant_id == booking.restaurant_id,
                Bookings.booking_date == booking.booking_date,
                Bookings.status == "confirmed",
                Bookings.id != booking_id
            )
        )
        if existing_confirmed.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Restaurant already confirmed for this date")

        booking.status = "confirmed"
        await db.commit()
        await db.refresh(booking)

        return BookingResponse(
            id=booking.id,
            user_id=booking.user_id,
            restaurant_id=booking.restaurant_id,
            booking_date=booking.booking_date,
            status=booking.status,
            booking_username=booking.booking_username,
            email=booking.email,
            phone_number=booking.phone_number,
            event_type=booking.event_type,
            number_of_guests=booking.number_of_guests,
            additional_information=booking.additional_information
        )

    @staticmethod
    async def reject_booking(
        db: AsyncSession,
        booking_id: int,
        admin_id: int
    ) -> BookingResponse:
        """Reject a booking (admin only)"""
        booking = await db.get(Bookings, booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        booking.status = "rejected"
        await db.commit()
        await db.refresh(booking)

        return BookingResponse(
            id=booking.id,
            user_id=booking.user_id,
            restaurant_id=booking.restaurant_id,
            booking_date=booking.booking_date,
            status=booking.status,
            booking_username=booking.booking_username,
            email=booking.email,
            phone_number=booking.phone_number,
            event_type=booking.event_type,
            number_of_guests=booking.number_of_guests,
            additional_information=booking.additional_information
        )

    @staticmethod
    async def get_free_days(
        db: AsyncSession,
        restaurant_id: int,
        start_date: date,
        end_date: date
    ) -> list[date]:
        """Get available days for a restaurant within a date range (only considers confirmed bookings)"""
        restaurant = await db.get(Restaurant, restaurant_id)
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        booked_dates = await db.execute(
            select(Bookings.booking_date).filter(
                Bookings.restaurant_id == restaurant_id,
                Bookings.booking_date.between(start_date, end_date),
                Bookings.status == "confirmed"
            )
        )
        booked_dates = {row.booking_date for row in booked_dates}

        all_dates = [start_date + timedelta(days=x) for x in range((end_date - start_date).days + 1)]
        free_dates = [d for d in all_dates if d not in booked_dates]

        return free_dates

    @staticmethod
    async def get_reserved_restaurants(
        db: AsyncSession,
        booking_date: date
    ) -> list[int]:
        """Get IDs of restaurants already reserved (confirmed) on a specific date"""
        booked = await db.execute(
            select(Bookings.restaurant_id).filter(
                Bookings.booking_date == booking_date,
                Bookings.status == "confirmed"
            )
        )
        return [row.restaurant_id for row in booked]
    
    @staticmethod
    async def get_booked_dates(
        db: AsyncSession,
        restaurant_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> List[date]:
        """Get all booked dates for a restaurant where bookings are pending or confirmed"""
        restaurant = await db.get(Restaurant, restaurant_id)
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        query = select(Bookings.booking_date).filter(
            Bookings.restaurant_id == restaurant_id,
            Bookings.status.in_(["pending", "confirmed"])
        )

        # Apply date range filtering if provided
        if start_date and end_date:
            query = query.filter(Bookings.booking_date.between(start_date, end_date))
        elif start_date:
            query = query.filter(Bookings.booking_date >= start_date)
        elif end_date:
            query = query.filter(Bookings.booking_date <= end_date)

        result = await db.execute(query)
        booked_dates = {row.booking_date for row in result}

        return sorted(list(booked_dates))