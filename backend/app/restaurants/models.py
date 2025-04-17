from sqlalchemy import Column, Integer, String, ForeignKey, Text, Float, TIMESTAMP, text
from sqlalchemy.orm import relationship
from app.database import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    location = Column(String)
    address = Column(String)
    category = Column(String)
    capacity = Column(Integer)
    rating = Column(Float)
    price_range = Column(String)
    features = Column(Text)  # Stored as comma-separated values
    cuisines = Column(Text)  # Stored as comma-separated values
    contact_phone = Column(String)
    contact_email = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"), onupdate=text("now()"))

    owner = relationship("Users", back_populates="restaurants")
    images = relationship(
        "RestaurantImage", 
        back_populates="restaurant", 
        cascade="all, delete-orphan",
        foreign_keys="[RestaurantImage.restaurant_id]"
    )
    reviews = relationship("Reviews", back_populates="restaurant")
    bookings = relationship("Bookings", back_populates="restaurant")


class RestaurantImage(Base):
    __tablename__ = "restaurant_images"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"))

    restaurant = relationship(
        "Restaurant", 
        back_populates="images",
        # Explicitly specify the foreign keys to resolve ambiguity
        foreign_keys="[RestaurantImage.restaurant_id]"
    )
