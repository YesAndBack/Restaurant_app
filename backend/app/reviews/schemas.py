from pydantic import BaseModel, Field
from typing import Optional

class ReviewCreate(BaseModel):
    username: str = Field(..., min_length=1, description="The username of the reviewer")
    rating: int = Field(..., ge=1, le=5, description="Star rating between 1 and 5")
    comment: Optional[str] = None  # Optional comment field

class ReviewResponse(BaseModel):
    id: int
    username: str
    rating: int
    comment: Optional[str] = None
    restaurant_id: int

    class Config:
        from_attributes = True