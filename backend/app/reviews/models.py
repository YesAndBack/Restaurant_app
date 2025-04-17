from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base
from sqlalchemy.orm import relationship

class Reviews(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    comment = Column(String, nullable=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    
    restaurant = relationship("Restaurant", back_populates="reviews")