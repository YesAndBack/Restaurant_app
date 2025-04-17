from fastapi import APIRouter, Depends, Response, status, HTTPException
from app.users.auth import authenticate_user, create_access_token, get_password_hash, verify_password
from app.users.dao import UsersDAO
from app.users.dependencies import get_current_admin_user, get_current_user
from app.users.models import Users
from app.exceptions import UserAlreadyExistException, IncorrectPhoneOrPasswordException
from app.users.utils import validate_registration_role
from app.users.schemas import SUserLogin, SUserRegister

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post("/register")
async def register_user(user_data: SUserRegister, role: str):
    if not await validate_registration_role(role):
        raise HTTPException(status_code=400, detail="Invalid registration role")

    existing_user = await UsersDAO.find_one_or_none(phone=user_data.phone)
    if existing_user:
        raise UserAlreadyExistException
    
    hashed_password = await get_password_hash(user_data.password)
    await UsersDAO.add(phone=user_data.phone, hashed_password=hashed_password, role=role)
    return {"message": f"User registered successfully with role: {role}"}

@router.post("/login")
async def login_user(response: Response, user_data: SUserLogin):
    user = await authenticate_user(user_data.phone, user_data.password)  
    if not user:
        raise IncorrectPhoneOrPasswordException
    access_token = await create_access_token({"sub": str(user.id), "role": user.role}) 
    response.set_cookie(
        key="booking_access_token",
        value=access_token,
        httponly=True,
        secure=False,  
        samesite="lax"
    )  # httponly=True
    return {"access_token": access_token, "role": user.role} 

@router.post("/logout")
async def logout_user(response: Response):
    response.delete_cookie("booking_access_token")
    return {"message": "Logged out"}  

@router.get("/me")
async def read_user_me(current_user: Users = Depends(get_current_user)):
    return {"id": current_user.id, "phone": current_user.phone, "role": current_user.role}

@router.get("/all")
async def read_user_all(current_user: Users = Depends(get_current_admin_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    users = await UsersDAO.find_all()
    return [user.__dict__ for user in users]

@router.put("/update/{user_id}")
async def update_user(current_user: Users = Depends(get_current_user)):
    return {"username": current_user.username}  