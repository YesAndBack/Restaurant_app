from sqlalchemy.orm import Session, selectinload
from fastapi import HTTPException
from app.restaurants.models import Restaurant, RestaurantImage  # Fixed import
from app.restaurants.schemas import RestaurantCreate, RestaurantImageCreate, RestaurantImageUpdate, RestaurantResponse, RestaurantImageSchema, RestaurantUpdate  # Fixed import
from typing import List, Optional
import json
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.reviews.schemas import ReviewResponse
from app.bookings.schemas import BookingListOut

logger = logging.getLogger(__name__)



class RestaurantDAO:
    @staticmethod
    async def create_restaurant(
        db: AsyncSession, 
        restaurant_data: RestaurantCreate, 
        owner_id: int, 
        image_urls: Optional[List[str]] = None
    ) -> RestaurantResponse:
        """Create a new restaurant with multiple images"""
        if not db:
            raise ValueError("Database session is required")
        
        try:
            # Create restaurant model
            restaurant = Restaurant(
                name=restaurant_data.name,
                description=restaurant_data.description,
                location=restaurant_data.location,
                address=restaurant_data.address,
                category=restaurant_data.category,
                capacity=restaurant_data.capacity,
                rating=restaurant_data.rating,
                price_range=restaurant_data.price_range,
                features=",".join(restaurant_data.features) if restaurant_data.features else "",
                cuisines=",".join(restaurant_data.cuisines) if restaurant_data.cuisines else "",
                contact_phone=restaurant_data.contact_phone,
                contact_email=restaurant_data.contact_email,
                owner_id=owner_id
            )
            
            # Add restaurant to session
            db.add(restaurant)
            
            # Commit restaurant
            await db.commit()
            
            # Refresh to get ID and other server-side generated values
            await db.refresh(restaurant)
            
            # Handle images
            if image_urls:
                # Create image models
                images = [
                    RestaurantImage(url=url, restaurant_id=restaurant.id) 
                    for url in image_urls if url
                ]
                
                # Add images to session
                db.add_all(images)
                
                # Commit images
                await db.commit()
            
            # Construct and return response
            return RestaurantResponse(
                id=restaurant.id,
                owner_id=owner_id,
                name=restaurant.name,
                description=restaurant.description,
                location=restaurant.location,
                address=restaurant.address,
                category=restaurant.category,
                capacity=restaurant.capacity,
                rating=restaurant.rating,
                price_range=restaurant.price_range,
                features=restaurant.features.split(",") if restaurant.features else [],
                cuisines=restaurant.cuisines.split(",") if restaurant.cuisines else [],
                contact_phone=restaurant.contact_phone,
                contact_email=restaurant.contact_email,
                images=[
                    RestaurantImageSchema(id=img.id, url=img.url) 
                    for img in images
                ] if 'images' in locals() else [],
                reviews=[]
            )
        
        except Exception as e:
            # Rollback in case of error
            await db.rollback()
            
            # Log the error
            logger.error(f"Error creating restaurant: {str(e)}")
            
            # Raise HTTP exception with detailed error
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to create restaurant: {str(e)}",
                    "type": str(type(e))
                }
            )

     # Convert to RestaurantResponse
    @staticmethod
    async def get_all_restaurants(db: AsyncSession) -> List[RestaurantResponse]:
        try:
            query = select(Restaurant).options(
                selectinload(Restaurant.images),
                selectinload(Restaurant.reviews),
                selectinload(Restaurant.bookings)
            )
            result = await db.execute(query)
            restaurants = result.scalars().all()
            return [
                RestaurantResponse(
                    id=restaurant.id,
                    owner_id=restaurant.owner_id,
                    name=restaurant.name,
                    description=restaurant.description,
                    location=restaurant.location,
                    address=restaurant.address,
                    category=restaurant.category,
                    capacity=restaurant.capacity,
                    rating=restaurant.rating,
                    price_range=restaurant.price_range,
                    features=restaurant.features.split(",") if restaurant.features else [],
                    cuisines=restaurant.cuisines.split(",") if restaurant.cuisines else [],
                    contact_phone=restaurant.contact_phone,
                    contact_email=restaurant.contact_email,
                    images=[
                        RestaurantImageSchema(id=img.id, url=img.url) 
                        for img in restaurant.images
                    ],
                    reviews=[
                        ReviewResponse(
                            id=review.id,
                            username=review.username,
                            rating=review.rating,
                            comment=review.comment,
                            restaurant_id=review.restaurant_id
                        )
                        for review in restaurant.reviews
                    ],
                    bookings=[
                        BookingListOut(
                            id=booking.id,
                            booking_date=booking.booking_date
                        )
                        for booking in restaurant.bookings
                    ]
                )
                for restaurant in restaurants
            ]
            
        except Exception as e:
            logger.error(f"Error retrieving restaurants: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to retrieve restaurants: {str(e)}",
                    "type": str(type(e))
                }
            )

    @staticmethod
    async def get_restaurant_by_id(
        db: AsyncSession,
        restaurant_id: int,
        load_reviews: bool = False
    ) -> Optional[RestaurantResponse]:
        """Get a single restaurant by ID with optional eager loading of reviews."""
        options = [selectinload(Restaurant.images), selectinload(Restaurant.bookings)]
        if load_reviews:
            options.append(selectinload(Restaurant.reviews))

        stmt = select(Restaurant).filter(Restaurant.id == restaurant_id).options(*options)
        result = await db.execute(stmt)
        restaurant = result.scalar_one_or_none()

        if not restaurant:
            return None

        return RestaurantResponse(
            id=restaurant.id,
            owner_id=restaurant.owner_id,
            name=restaurant.name,
            description=restaurant.description,
            location=restaurant.location,
            address=restaurant.address,
            category=restaurant.category,
            capacity=restaurant.capacity,
            rating=restaurant.rating,
            price_range=restaurant.price_range,
            features=restaurant.features.split(",") if restaurant.features else [],
            cuisines=restaurant.cuisines.split(",") if restaurant.cuisines else [],
            contact_phone=restaurant.contact_phone,
            contact_email=restaurant.contact_email,
            images=[
                RestaurantImageSchema(id=img.id, url=img.url)
                for img in restaurant.images
            ],
            bookings=[
                BookingListOut(
                    id=booking.id,
                    booking_date=booking.booking_date
                )
                for booking in restaurant.bookings
            ],
            reviews=[
                ReviewResponse(
                    id=review.id,
                    username=review.username,
                    rating=review.rating,
                    comment=review.comment,
                    restaurant_id=review.restaurant_id
                )
                for review in restaurant.reviews
            ] if load_reviews else []
        )

    @staticmethod
    async def delete_restaurant(db: AsyncSession, restaurant_id: int, owner_id: int) -> bool:
        """Delete a restaurant if the owner matches"""
        stmt = select(Restaurant).filter(Restaurant.id == restaurant_id, Restaurant.owner_id == owner_id)
        result = await db.execute(stmt)
        restaurant = result.scalar_one_or_none()
        if restaurant:
            await db.delete(restaurant)
            await db.commit()
            return True
        return False

    @staticmethod
    async def update_restaurant(
        db: AsyncSession,
        restaurant_id: int,
        owner_id: int,
        restaurant_data: RestaurantUpdate
    ) -> Optional[RestaurantResponse]:
        """Update an existing restaurant."""
        try:
            stmt = (
                select(Restaurant)
                .filter(Restaurant.id == restaurant_id, Restaurant.owner_id == owner_id)
                .options(
                    selectinload(Restaurant.images),
                    selectinload(Restaurant.reviews))  # Add this line to load reviews
            )
            result = await db.execute(stmt)
            restaurant = result.scalar_one_or_none()

            if not restaurant:
                return None

            # Update restaurant fields (unchanged)
            if restaurant_data.name is not None:
                restaurant.name = restaurant_data.name
            if restaurant_data.description is not None:
                restaurant.description = restaurant_data.description
            if restaurant_data.location is not None:
                restaurant.location = restaurant_data.location
            if  restaurant_data.address is not None:
                restaurant.address = restaurant_data.address
            if restaurant_data.category is not None:
                restaurant.category = restaurant_data.category
            if restaurant_data.capacity is not None:
                restaurant.capacity = restaurant_data.capacity
            if restaurant_data.rating is not None:
                restaurant.rating = restaurant_data.rating
            if restaurant_data.price_range is not None:
                restaurant.price_range = restaurant_data.price_range
            if restaurant_data.features is not None:
                restaurant.features = ",".join(restaurant_data.features) if restaurant_data.features else ""
            if restaurant_data.cuisines is not None:
                restaurant.cuisines = ",".join(restaurant_data.cuisines) if restaurant_data.cuisines else ""
            if restaurant_data.contact_phone is not None:
                restaurant.contact_phone = restaurant_data.contact_phone
            if restaurant_data.contact_email is not None:
                restaurant.contact_email = restaurant_data.contact_email
            # ... other fields ...

            # Handle image URLs (unchanged)
            if restaurant_data.image_urls is not None:
                for img in restaurant.images:
                    await db.delete(img)
                if restaurant_data.image_urls:
                    new_images = [
                        RestaurantImage(url=url, restaurant_id=restaurant.id)
                        for url in restaurant_data.image_urls if url
                    ]
                    db.add_all(new_images)

            await db.commit()
            await db.refresh(restaurant)

            return RestaurantResponse(
                id=restaurant.id,
                owner_id=restaurant.owner_id,
                name=restaurant.name,
                description=restaurant.description,
                location=restaurant.location,
                address=restaurant.address,
                category=restaurant.category,
                capacity=restaurant.capacity,
                rating=restaurant.rating,
                price_range=restaurant.price_range,
                features=restaurant.features.split(",") if restaurant.features else [],
                cuisines=restaurant.cuisines.split(",") if restaurant.cuisines else [],
                contact_phone=restaurant.contact_phone,
                contact_email=restaurant.contact_email,
                images=[
                    RestaurantImageSchema(id=img.id, url=img.url)
                    for img in restaurant.images
                ],
                reviews=[]  # Add empty reviews list # No reviews field; defaults to []
            )

        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating restaurant: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def get_all_images_for_restaurant(db: AsyncSession, restaurant_id: int) -> List[RestaurantImageSchema]:
        """Retrieve all images for a specific restaurant."""
        try:
            stmt = select(RestaurantImage).filter(RestaurantImage.restaurant_id == restaurant_id)
            result = await db.execute(stmt)
            images = result.scalars().all()

            return [
                RestaurantImageSchema(id=image.id, url=image.url)
                for image in images
            ]
        except Exception as e:
            logger.error(f"Error retrieving images for restaurant {restaurant_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to retrieve images: {str(e)}",
                    "type": str(type(e))
                }
            )
    # Image CRUD Operations
    @staticmethod
    async def create_image(
        db: AsyncSession,
        restaurant_id: int,
        owner_id: int,
        image_data: RestaurantImageCreate
    ) -> RestaurantImageSchema:
        """Create a new image for a restaurant"""
        restaurant = await db.get(Restaurant, restaurant_id)
        if not restaurant or restaurant.owner_id != owner_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        image = RestaurantImage(
            url=image_data.url,
            restaurant_id=restaurant_id
        )
        db.add(image)
        await db.commit()
        await db.refresh(image)
        return RestaurantImageSchema(id=image.id, url=image.url)

    @staticmethod
    async def get_image(db: AsyncSession, image_id: int) -> Optional[RestaurantImageSchema]:
        """Get a specific image"""
        image = await db.get(RestaurantImage, image_id)
        if image:
            return RestaurantImageSchema(id=image.id, url=image.url)
        return None

    @staticmethod
    async def update_image(
        db: AsyncSession,
        image_id: int,
        owner_id: int,
        image_data: RestaurantImageUpdate
    ) -> Optional[RestaurantImageSchema]:
        """Update an existing image"""
        stmt = select(RestaurantImage).filter(RestaurantImage.id == image_id)
        result = await db.execute(stmt)
        image = result.scalar_one_or_none()
        
        if not image:
            return None
        
        restaurant = await db.get(Restaurant, image.restaurant_id)
        if restaurant.owner_id != owner_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        if image_data.url is not None:
            image.url = image_data.url
        
        await db.commit()
        await db.refresh(image)
        return RestaurantImageSchema(id=image.id, url=image.url)

    @staticmethod
    async def delete_image(db: AsyncSession, image_id: int, owner_id: int) -> bool:
        """Delete an image"""
        image = await db.get(RestaurantImage, image_id)
        if not image:
            return False
        
        restaurant = await db.get(Restaurant, image.restaurant_id)
        if restaurant.owner_id != owner_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        await db.delete(image)
        await db.commit()
        return True