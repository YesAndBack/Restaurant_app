from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends, Header
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.config import settings
from app.users.dao import UsersDAO
from app.users.schemas import SUserLogin
import enum
from fastapi import security
from fastapi.openapi.models import SecuritySchemeType
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security_scheme = HTTPBearer()

from app.users.utils import AllowedRegistrationRoles

class ModelName(str, enum.Enum):
    user = "user"
    admin = "admin"
    superuser = "superuser"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 70

async def get_role(required_role: ModelName) -> str:
    if required_role in ModelName:
        return required_role.value
    raise HTTPException(status_code=400, detail="Invalid role")

async def validate_registration_role(role: str) -> bool:
    try:
        AllowedRegistrationRoles(role)
        return True
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid registration role. Allowed roles: user, admin"
        )

async def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

async def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if "sub" not in to_encode:
        raise ValueError("Token must include 'sub'")
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def create_refresh_token(data: dict):
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {**data, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def authenticate_user(phone: str, password: str):
    user = await UsersDAO.find_one_or_none(phone=phone)
    if not user or not await verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect phone or password")
    return user

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id_int = int(user_id)
        user = await UsersDAO.find_by_id(user_id_int)  
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user ID format")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")