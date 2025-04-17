from pydantic import BaseModel
from datetime import date
from typing import Optional
from enum import Enum

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"

class BookingCreate(BaseModel):
    restaurant_id: int
    booking_date: date
    booking_username: str
    email: str
    phone_number: str  # Contact number
    event_type: str
    number_of_guests: int  # Number of guests for the booking
    additional_information: Optional[str] = None  # Optional field for any additional information

class BookingResponse(BaseModel):
    id: int
    booking_username: str
    email: str
    phone_number: str  # Contact number
    event_type: str
    number_of_guests: int  # Number of guests for the booking
    additional_information: Optional[str] = None
    user_id: int
    restaurant_id: int
    booking_date: date
    status: str

    class Config:
        from_attributes = True