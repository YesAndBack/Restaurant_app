from fastapi import HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.restaurants.models import Restaurant
import logging
from app.reviews.models import Reviews
from app.reviews.schemas import ReviewCreate, ReviewResponse

logger = logging.getLogger(__name__)

class ReviewDAO:
    @staticmethod
    async def create_review(
        db: AsyncSession,
        restaurant_id: int,
        review_data: ReviewCreate
    ) -> ReviewResponse:
        """Create a new review for a restaurant"""
        # Check if restaurant exists
        restaurant = await db.get(Restaurant, restaurant_id)
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        review = Reviews(
            username=review_data.username,
            rating=review_data.rating,
            comment=review_data.comment,
            restaurant_id=restaurant_id
        )
        db.add(review)
        await db.commit()
        await db.refresh(review)

        return ReviewResponse(
            id=review.id,
            username=review.username,
            rating=review.rating,
            comment=review.comment,
            restaurant_id=review.restaurant_id
        )

    @staticmethod
    async def get_reviews_for_restaurant(
        db: AsyncSession,
        restaurant_id: int
    ) -> list[ReviewResponse]:
        """Retrieve all reviews for a specific restaurant"""
        try:
            stmt = select(Reviews).filter(Reviews.restaurant_id == restaurant_id)
            result = await db.execute(stmt)
            reviews = result.scalars().all()

            return [
                ReviewResponse(
                    id=review.id,
                    username=review.username,
                    rating=review.rating,
                    comment=review.comment,
                    restaurant_id=review.restaurant_id
                )
                for review in reviews
            ]
        except Exception as e:
            logger.error(f"Error retrieving reviews for restaurant {restaurant_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "message": f"Failed to retrieve reviews: {str(e)}",
                    "type": str(type(e))
                }
            )