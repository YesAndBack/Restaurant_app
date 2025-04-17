
from pydantic import BaseModel

class SUserRegister(BaseModel):
    phone : str
    password :str 
   
   
class SUserLogin(BaseModel):
    phone : str
    password :str 
      
class SUser(BaseModel):
    username: str
    phone: str
    password: str
   
    class Config:
        from_attributes = True
        
