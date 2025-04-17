import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, logger
from sqlalchemy.orm import Session
from typing import List, Optional
from app.restaurants.schemas import RestaurantCreate, RestaurantImageCreate, RestaurantCreateIn, RestaurantImageSchema, RestaurantImageUpdate, RestaurantResponse, RestaurantUpdate
from app.restaurants.dao import RestaurantDAO
from app.database import get_db
from app.restaurants.models import Restaurant
from app.s3_utils import upload_image_to_s3
from app.users.auth import get_current_user
from app.users.models import Users
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Body
from app.payments.stripe_utils import create_checkout_session, create_payment_intent, confirm_payment_intent
from app.config import settings
import stripe

# Initialize Stripe with your API key

router = APIRouter()


router = APIRouter(
    prefix="/rest",
    tags=["Restaurants"]
)

# Static restaurants data
STATIC_RESTAURANTS = [
    {
        "id": 1,
        "name": "Elevation Grand Hall",
        "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
        "location": "Downtown, New York",
        "category": "Fine Dining",
        "capacity": 120,
        "rating": 4.8,
        "average_price": 90,
        "owner_id": 1  # Default owner (admin ID)
    },
    {
        "id": 2,
        "name": "Azure Rooftop Lounge",
        "image": "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop",
        "location": "Marina, San Francisco",
        "category": "Rooftop",
        "capacity": 80,
        "rating": 4.7,
        "average_price": 90,
        "owner_id": 1
    },
    {
        "id": 3,
        "name": "The Golden Pavilion",
        "image": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
        "location": "Beverly Hills, Los Angeles",
        "category": "Luxury",
        "capacity": 150,
        "rating": 4.9,
        "average_price": 90,
        "owner_id": 1
    },
    {
        "id": 4,
        "name": "Sapphire Garden",
        "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
        "location": "Midtown, Chicago",
        "category": "Modern",
        "capacity": 100,
        "rating": 4.6,
        "average_price": 90,
        "owner_id": 1
    },
    {
        "id": 5,
        "name": "The Velvet Room",
        "image": "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=2070&auto=format&fit=crop",
        "location": "French Quarter, New Orleans",
        "category": "Classic",
        "capacity": 90,
        "rating": 4.5,
        "average_price": 90,
        "owner_id": 1
    },
    {
        "id": 6,
        "name": "Ocean Terrace",
        "image": "https://images.unsplash.com/photo-1537639622086-67761bed4118?q=80&w=1955&auto=format&fit=crop",
        "location": "South Beach, Miami",
        "category": "Seafood",
        "capacity": 110,
        "rating": 4.7,
        "average_price": 90,
        "owner_id": 1
    },
]
STATIC_RESTAURANT_IDS = {r["id"] for r in STATIC_RESTAURANTS}

@router.post("/restaurants/{restaurant_id}/upload-image/", response_model=List[RestaurantImageSchema])
async def upload_image(
    restaurant_id: int,
    files: List[UploadFile] = File(...),
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Uploads multiple images to MinIO, saves them to the database, and returns their IDs and URLs."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can upload images")
    
    # Fetch restaurant without loading reviews
    restaurant = await RestaurantDAO.get_restaurant_by_id(db, restaurant_id, load_reviews=False)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add images to this restaurant")
    
    uploaded_images = []
    for file in files:
        image_url = await upload_image_to_s3(file)
        image_data = RestaurantImageCreate(url=image_url)
        image = await RestaurantDAO.create_image(db, restaurant_id, current_user.id, image_data)
        uploaded_images.append(image)
    
    return uploaded_images


# @router.post("/restaurants/", response_model=RestaurantResponse)
# async def create_restaurant(
#     restaurant_data: RestaurantCreate = Body(...),
#     files: List[UploadFile] = File(default=[]),  # Added optional multiple file upload
#     current_user: Users = Depends(get_current_user),
#     db: AsyncSession = Depends(get_db)
# ):
#     if not current_user:
#         raise HTTPException(status_code=401, detail="Authentication required")
    
#     if current_user.role != "admin":
#         raise HTTPException(status_code=403, detail="Only admins can create restaurants")
    
#     if not db:
#         raise HTTPException(status_code=500, detail="Database connection failed")
    
#     try:
        
#         if not current_user.id:
#             raise HTTPException(status_code=500, detail="Current user has no valid ID")
        
#         # Upload images if provided and get URLs
#         image_urls = []
#         if files:
#             image_urls = [await upload_image_to_s3(file) for file in files]
        
#         # Combine any existing image_urls from restaurant_data with uploaded files
#         if restaurant_data.image_urls:
#             image_urls.extend(restaurant_data.image_urls)
        
#         # Create restaurant with all image URLs
#         created_restaurant = await RestaurantDAO.create_restaurant(
#             db, 
#             restaurant_data, 
#             current_user.id, 
#             image_urls if image_urls else None
#         )
        
#         return created_restaurant
    
#     except Exception as e:
#         logger.error(f"Unexpected restaurant creation error: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail={
#                 "status": "error",
#                 "message": "Unexpected error during restaurant creation",
#                 "error_details": str(e)
#             }
#         )
@router.post("/restaurants/", response_model=RestaurantResponse)
async def create_restaurant(
    name: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    address: str = Form(...),
    category: str = Form(...),
    capacity: int = Form(...),
    rating: float = Form(...),
    price_range: str = Form(...),
    features: str = Form(default=""),
    cuisines: str = Form(default=""),
    contact_phone: str = Form(...),
    contact_email: str = Form(...),
    image_urls: str = Form(default=""),
    payment_intent_id: str = Form(...),  # Новый обязательный параметр
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create restaurants")

    # Проверка платежа
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        if intent["status"] != "succeeded":
            raise HTTPException(status_code=402, detail="Payment required or not completed")
        if intent["amount"] != settings.ADMIN_FEE_USD or intent["currency"] != "usd":
            raise HTTPException(status_code=400, detail="Invalid payment amount or currency")
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Payment verification error: {str(e)}")

    # Преобразование данных
    features_list = features.split(",") if features else []
    cuisines_list = cuisines.split(",") if cuisines else []
    image_urls_list = image_urls.split(",") if image_urls else []

    restaurant_data = RestaurantCreate(
        name=name,
        description=description,
        location=location,
        address=address,
        category=category,
        capacity=capacity,
        rating=rating,
        price_range=price_range,
        features=features_list,
        cuisines=cuisines_list,
        contact_phone=contact_phone,
        contact_email=contact_email,
        image_urls=image_urls_list
    )

    created_restaurant = await RestaurantDAO.create_restaurant(
        db,
        restaurant_data,
        current_user.id,
        image_urls_list if image_urls_list else None
    )
    
    return created_restaurant

# @router.post("/restaurants/", response_model=RestaurantResponse)
# async def create_restaurant(
#     restaurant_data: RestaurantCreate,
#     image_urls: List[str] = Form([]),
#     # current_user: Users = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     # """Admins can add their own restaurants"""
#     # if current_user.role != "admin":
#     #     print(f"User role is {current_user.role}, expected 'admin'")
#     #     raise HTTPException(status_code=403, detail="Only admins can create restaurants")

    
#     return RestaurantDAO.create_restaurant(db, restaurant_data, image_urls)
# #  current_user.id,


@router.post("/restaurants/create-payment-intent/")
async def create_restaurant_payment_intent(current_user: Users = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create restaurants")
    
    intent = await create_payment_intent(amount=settings.ADMIN_FEE_USD, currency="usd")
    return {
        "client_secret": intent["client_secret"],
        "amount": settings.ADMIN_FEE_USD,
        "currency": "usd"
    }
    
@router.post("/restaurants/create-checkout-session/")
async def create_restaurant_checkout_session(
    name: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    category: str = Form(...),
    capacity: int = Form(...),
    contact_phone: str = Form(...),
    contact_email: str = Form(...),
    average_price: int = Form(...),
    image_urls: str = Form(default=""),
    opening_hours: str = Form(default=""),
    current_user: Users = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create restaurants")

    # Create a dictionary with all restaurant data
    restaurant_data = {
        "name": name,
        "description": description,
        "location": location,
        "category": category,
        "capacity": capacity,
        "contact_phone": contact_phone,
        "contact_email": contact_email,
        "average_price": average_price,
        "image_urls": image_urls,
        "opening_hours": opening_hours,
        "user_id": current_user.id,
    }
    
    # Encode all data to be passed in the URL
    import urllib.parse
    
    # Create a base URL with common parameters
    success_url_base = "http://localhost:8080/success?session_id={CHECKOUT_SESSION_ID}"
    
    # Add all restaurant data as query parameters
    for key, value in restaurant_data.items():
        encoded_value = urllib.parse.quote(str(value))
        success_url_base += f"&{key}={encoded_value}"
    
    # Create Stripe checkout session
    session = await create_checkout_session(
        amount=settings.ADMIN_FEE_USD, 
        currency="usd", 
        success_url=success_url_base,
        cancel_url="http://localhost:8080/cancel"
    )
    
    return {"checkout_url": session.url, "session_id": session.id}



@router.post("/restaurants/create-after-payment/")
async def create_restaurant_after_payment(restaurant: RestaurantCreateIn, 
    db: AsyncSession = Depends(get_db)
    ):
    # Verify the payment was successful
    try:
        session = stripe.checkout.Session.retrieve(restaurant.session_id)
        if session.payment_status != "paid":
            raise HTTPException(status_code=400, detail="Payment not completed")
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Payment verification error: {str(e)}")
    
    # Create the restaurant in the database
    try:
        # Prepare restaurant data
        db_restaurant = {
            "name": restaurant.name,
            "description": restaurant.description,
            "location": restaurant.location,
            "category": restaurant.category,
            "address": "null",
            "rating": 0,
            "cuisines": "null",
            "features": "null",
            "capacity": restaurant.capacity,
            "contact_phone": restaurant.contact_phone,
            "contact_email": restaurant.contact_email,
            "price_range": str(restaurant.average_price),
            # "image_urls": restaurant.image_urls,
            # "opening_hours": restaurant.opening_hours,
            "owner_id": restaurant.user_id,
            # "payment_confirmed": True,
            # "payment_session_id": restaurant.session_id
        }
        
        # Create restaurant in database (example with SQLAlchemy ORM)
        new_restaurant = Restaurant(**db_restaurant)
        db.add(new_restaurant)
        await db.commit()
        await db.refresh(new_restaurant)
        
        return {"status": "success", "message": "Restaurant created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create restaurant: {str(e)}")
    

@router.get("/restaurants/", response_model=List[RestaurantResponse])
async def get_restaurants(db: AsyncSession = Depends(get_db)):
    """Users can see all restaurants"""
    return await RestaurantDAO.get_all_restaurants(db)

@router.get("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(restaurant_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve a single restaurant by ID"""
    restaurant = await RestaurantDAO.get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@router.delete("/restaurants/{restaurant_id}")
async def delete_restaurant(restaurant_id: int, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Admins can delete their own restaurants"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete restaurants")

    success = await RestaurantDAO.delete_restaurant(db, restaurant_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Restaurant not found or not owned by user")
    
    return {"message": "Restaurant deleted successfully"}

@router.put("/restaurants/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: int,
    restaurant_data: RestaurantUpdate = Body(...),  # JSON request body with optional image_urls
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Admins can update their own restaurants using a JSON request body with optional image URLs."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update restaurants")

    # Update the restaurant with provided data and image URLs (if any)
    updated_restaurant = await RestaurantDAO.update_restaurant(
        db,
        restaurant_id,
        current_user.id,
        restaurant_data  # RestaurantUpdate now includes optional image_urls
    )
    
    if not updated_restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found or not owned by user")
    
    return updated_restaurant


@router.get("/restaurants/{restaurant_id}/images/", response_model=List[RestaurantImageSchema])
async def get_all_restaurant_images(
    restaurant_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all images for a specific restaurant."""
    # Check if the restaurant exists
    restaurant = await RestaurantDAO.get_restaurant_by_id(db, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    images = await RestaurantDAO.get_all_images_for_restaurant(db, restaurant_id)
    return images

@router.get("/images/{image_id}", response_model=RestaurantImageSchema)
async def get_restaurant_image(
    image_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a single image by ID."""
    image = await RestaurantDAO.get_image(db, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@router.put("/images/{image_id}", response_model=RestaurantImageSchema)
async def update_restaurant_image(
    image_id: int,
    file: UploadFile = File(...),
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Admins can update a single image's URL."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can manage restaurant images")
    
    updated_image = await RestaurantDAO.update_image(db, image_id, current_user.id, image_data)
    if not updated_image:
        raise HTTPException(status_code=404, detail="Image not found or not authorized")
    return updated_image

@router.delete("/images/{image_id}")
async def delete_restaurant_image(
    image_id: int,
    current_user: Users = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Admins can delete a single image from their restaurant."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can manage restaurant images")
    
    success = await RestaurantDAO.delete_image(db, image_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Image not found or not authorized")
    return {"message": "Image deleted successfully"}