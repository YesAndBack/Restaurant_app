from fastapi import HTTPException
import enum

class AllowedRegistrationRoles(str, enum.Enum):
    user = "user"
    admin = "admin"    

async def validate_registration_role(role: str) -> bool:
    try:
        AllowedRegistrationRoles(role)
        return True
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid registration role. Allowed roles: user, admin"
        )
class AllowedRegistrationRoles(str, enum.Enum):
    user = "user"
    admin = "admin"    
