from datetime import datetime
import jwt
from jwt.exceptions import PyJWTError

from fastapi import Depends, Request, HTTPException, status

from app.config import settings
from app.users.dao import UsersDAO
from app.users.models import Users
from app.exceptions import TokenExpiredException, TokenAbsentException, IncorrectTokenException, UserIsNotPresentException

def get_token(request:Request):
    token = request.cookies.get("booking_access_token")
    if not token:
        raise TokenAbsentException
    return token
    
    
    
async def get_current_user(token: str = Depends(get_token)):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, settings.ALGORITHM
        )
    except PyJWTError:
        raise IncorrectTokenException
    expire: str = payload.get("exp")
    if (not expire) or (int(expire) < datetime.now().timestamp()):
        raise TokenExpiredException
    user_id: str = payload.get("sub")
    if not user_id:
        raise UserIsNotPresentException
    user = await UsersDAO.find_by_id(int(user_id))
    if not user:
        raise UserIsNotPresentException
    return user


async def get_current_admin_user(current_user: Users = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user