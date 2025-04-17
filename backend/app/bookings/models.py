from sqlalchemy import Column, Integer, ForeignKey, Date, Enum, String
from sqlalchemy.orm import relationship
from app.database import Base

class Bookings(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    booking_date = Column(Date, nullable=False)  # Date of the booking
    status = Column(String, default="pending")  # e.g., "confirmed", "cancelled"
    booking_username = Column(String, nullable=False, server_default="")  
    email = Column(String, nullable=False, server_default="")
    phone_number = Column(String, nullable=False, server_default="")  # Contact numbe
    event_type = Column(String, nullable=False, server_default="")
    number_of_guests = Column(Integer, nullable=False, server_default="0") # Number of guests for the booking
    additional_information = Column(String, nullable=True)  # Optional field for any additional information
    
    
    user = relationship("Users", back_populates="bookings")
   
    restaurant = relationship("Restaurant", back_populates="bookings")