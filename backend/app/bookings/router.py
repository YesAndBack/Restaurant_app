from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.bookings.schemas import BookingCreate, BookingResponse
from app.bookings.dao import BookingDAO
from app.database import get_db
from app.users.auth import get_current_user
from app.users.models import Users
from datetime import date
from typing import Dict, List, Optional
import logging

from app.restaurants.models import Restaurant
from app.bookings.models import Bookings

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)
 
@router.post("/", response_model=BookingResponse)
async def book_restaurant(
    booking_data: BookingCreate,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Book a restaurant for a specific day (pending admin confirmation)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        booking = await BookingDAO.create_booking(db, current_user.id, booking_data)
        return booking
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating booking: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating booking: {str(e)}")

@router.put("/{booking_id}/confirm", response_model=BookingResponse)
async def confirm_booking(
    booking_id: int,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Confirm a booking (restaurant owner or admin of that restaurant only)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Fetch the booking to check the restaurant
    booking = await db.get(Bookings, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Fetch the restaurant to check ownership
    restaurant = await db.get(Restaurant, booking.restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Check if user is the restaurant owner or an admin who owns this restaurant
    is_owner = restaurant.owner_id == current_user.id
    is_admin_and_owner = current_user.role == "admin" and restaurant.owner_id == current_user.id
    if not (is_owner or is_admin_and_owner):
        raise HTTPException(status_code=403, detail="Only the restaurant owner can confirm this booking")

    try:
        confirmed_booking = await BookingDAO.confirm_booking(db, booking_id, current_user.id)
        return confirmed_booking
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error confirming booking: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error confirming booking: {str(e)}")

@router.put("/{booking_id}/reject", response_model=BookingResponse)
async def reject_booking(
    booking_id: int,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Reject a booking (restaurant owner or admin of that restaurant only)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Fetch the booking to check the restaurant
    booking = await db.get(Bookings, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Fetch the restaurant to check ownership
    restaurant = await db.get(Restaurant, booking.restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Check if user is the restaurant owner or an admin who owns this restaurant
    is_owner = restaurant.owner_id == current_user.id
    is_admin_and_owner = current_user.role == "admin" and restaurant.owner_id == current_user.id
    if not (is_owner or is_admin_and_owner):
        raise HTTPException(status_code=403, detail="Only the restaurant owner can reject this booking")

    try:
        rejected_booking = await BookingDAO.reject_booking(db, booking_id, current_user.id)
        return rejected_booking
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error rejecting booking: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error rejecting booking: {str(e)}")
    
@router.get("/restaurant/{restaurant_id}", response_model=List[BookingResponse])
async def get_bookings_by_restaurant(
    restaurant_id: int,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all bookings for a specific restaurant"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Optional: Restrict to admins or restaurant owners
    if current_user.role != "admin":
        restaurant = await db.get(Restaurant, restaurant_id)
        if not restaurant or restaurant.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view bookings for this restaurant")

    try:
        bookings = await BookingDAO.get_bookings_by_restaurant(db, restaurant_id)
        return bookings
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error retrieving bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving bookings: {str(e)}")
    
@router.get("/restaurant/", response_model=List[BookingResponse])
async def get_bookings_by_restaurant(
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all bookings for a specific restaurant"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Optional: Restrict to admins or restaurant owners
    if current_user.role != "admin":
        restaurant = await db.get(Restaurant)
        if not restaurant or restaurant.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view bookings for this restaurant")

    try:
        bookings = await BookingDAO.get_bookings_by_user_id(db, current_user.id)
        return bookings
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error retrieving bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving bookings: {str(e)}")

@router.get("/reserved/{booking_date}", response_model=List[int])
async def get_reserved_restaurants(
    booking_date: date,
    db: AsyncSession = Depends(get_db)
):
    """Get restaurants already reserved (confirmed) for a specific day"""
    try:
        reserved_ids = await BookingDAO.get_reserved_restaurants(db, booking_date)
        return reserved_ids
    except Exception as e:
        logger.error(f"Error retrieving reserved restaurants: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving reserved restaurants: {str(e)}")

@router.get("/booked-dates/{restaurant_id}", response_model=List[date])
async def get_booked_dates(
    restaurant_id: int,
    start_date: Optional[date] = Query(None, description="Start date for filtering"),
    end_date: Optional[date] = Query(None, description="End date for filtering"),
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all booked dates (pending and confirmed) for a specific restaurant"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        booked_dates = await BookingDAO.get_booked_dates(db, restaurant_id, start_date, end_date)
        return booked_dates
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error retrieving booked dates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving booked dates: {str(e)}")
# @router.get("/reserved/{booking_date}", response_model=List[int])
# async def get_reserved_restaurants(
#     booking_date: date,
#     db: AsyncSession = Depends(get_db)
# ):
#     """Get restaurants already reserved (confirmed) for a specific day"""
#     try:
#         reserved_ids = await BookingDAO.get_reserved_restaurants(db, booking_date)
#         return reserved_ids
#     except Exception as e:
#         logger.error(f"Error retrieving reserved restaurants: {str(e)}")
#         raise HTTPException(status_code=500, detail=f"Error retrieving reserved restaurants: {str(e)}")

