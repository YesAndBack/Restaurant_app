from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.reviews.schemas import ReviewCreate, ReviewResponse
from app.reviews.dao import ReviewDAO
from app.database import get_db
import logging
from typing import List

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

@router.post("/restaurants/{restaurant_id}/reviews/", response_model=ReviewResponse)
async def create_review(
    restaurant_id: int,
    review_data: ReviewCreate = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Users can add a review with a star rating and comment"""
    try:
        review = await ReviewDAO.create_review(db, restaurant_id, review_data)
        return review
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating review: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Unexpected error during review creation",
                "error_details": str(e)
            }
        )

@router.get("/restaurants/{restaurant_id}/reviews/", response_model=List[ReviewResponse])
async def get_reviews(
    restaurant_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all reviews for a specific restaurant"""
    reviews = await ReviewDAO.get_reviews_for_restaurant(db, restaurant_id)
    return reviews