from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy.orm import relationship

class Users(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    email = Column(String, unique=True, nullable= True)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False, default="user")
    
    restaurants = relationship("Restaurant", back_populates="owner")
    bookings = relationship("Bookings", back_populates="user")
