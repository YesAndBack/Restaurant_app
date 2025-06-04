from pydantic import BaseModel, EmailStr
from typing import List, Optional

from app.reviews.schemas import ReviewResponse
from app.bookings.schemas import BookingListOut

class RestaurantImageSchema(BaseModel):
    id: int
    url: str

    class Config:
        from_attributes = True
        
class RestaurantImageCreate(BaseModel):
    url: str  # URL of the image (e.g., from S3)

class RestaurantImageUpdate(BaseModel):
    url: Optional[str] = None  # Optional field to update the image URL
        


class RestaurantBase(BaseModel):
    name: str
    description: str
    location: str
    address: str
    category: str
    capacity: int
    rating: float
    price_range: str
    features: List[str]
    cuisines: List[str]
    contact_phone: str
    contact_email: EmailStr


class RestaurantCreate(RestaurantBase):
    image_urls: Optional[List[str]] = None



class RestaurantResponse(RestaurantBase):
    id: int
    owner_id: int
    images: List[RestaurantImageSchema]
    reviews: Optional[List[ReviewResponse]]
    bookings: Optional[List[BookingListOut]] = []
    # bookings: List[BookingResponse] 

    class Config:
        from_attributes = True

class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    capacity: Optional[int] = None
    rating: Optional[float] = None
    price_range: Optional[str] = None
    features: Optional[List[str]] = None
    cuisines: Optional[List[str]] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    image_urls: Optional[List[str]] = None


class RestaurantCreateIn(BaseModel):
    session_id: str
    name: str
    description: str
    location: str
    category: str
    capacity: int
    contact_phone: str
    contact_email: str
    average_price: int
    image_urls: Optional[str] = ""  # строка с запятыми
    opening_hours: str = ""
    features:List[str]
    cuisines:List[str]
    user_id: int = None


