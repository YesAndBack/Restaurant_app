from contextlib import asynccontextmanager
from datetime import date
from typing import Optional
from fastapi import Depends, FastAPI, Query, Request
from pydantic import BaseModel
from sqlalchemy import Engine
from app.bookings.router import router as router_bookings
from app.users.router import router as router_users
from app.restaurants.router import router as router_restaurants 
from fastapi.middleware.cors import CORSMiddleware
from app.reviews.router import router as router_reviews 
import time
from sqlalchemy.ext.asyncio import AsyncSession
from app.restaurants.dao import RestaurantDAO
from app.restaurants.schemas import RestaurantCreate
from app.users.init_superuser import init_superuser


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize superuser
    await init_superuser()
    yield

app = FastAPI(lifespan=lifespan)
print(f"init_superuser: {init_superuser}")
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:8080"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"] 
)

app.include_router(router_reviews)
app.include_router(router_users)
app.include_router(router_bookings)
app.include_router(router_restaurants)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.get("/")
def read_root():
    return {"message": "Hello, World! Backend is connected."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    
async def seed_static_restaurants():
    async with AsyncSession(Engine) as db:
        for static_restaurant in router_bookings.STATIC_RESTAURANTS:
            existing = await RestaurantDAO.get_restaurant_by_id(db, static_restaurant["id"])
            if not existing:
                restaurant_data = RestaurantCreate(
                    name=static_restaurant["name"],
                    description="",  # Not provided, default to empty
                    location=static_restaurant["location"],
                    address="",  # Not provided, default to empty
                    category=static_restaurant["category"],
                    capacity=static_restaurant["capacity"],
                    rating=static_restaurant["rating"],
                    average_price=static_restaurant["average_price"],
                    features=[],
                    cuisines=[],
                    contact_phone="",
                    contact_email=None,
                    image_urls=[static_restaurant["image"]]
                )
                await RestaurantDAO.create_restaurant(
                    db, restaurant_data, static_restaurant["owner_id"], [static_restaurant["image"]]
                )
        await db.commit()    