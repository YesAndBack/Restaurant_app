import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import model_validator

class Settings(BaseSettings):
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASS: str
    DB_NAME: str
    DATABASE_URL: Optional[str] = None

    SECRET_KEY : str
    ALGORITHM: str
    
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_s3_bucket_name: str
    aws_s3_endpoint_url: str

    @model_validator(mode="after")
    def assemble_database_url(cls, values):
        values.DATABASE_URL = f"postgresql+asyncpg://{values.DB_USER}:{values.DB_PASS}@{values.DB_HOST}:{values.DB_PORT}/{values.DB_NAME}"
        return values

    class Config:
        env_file = ".env"
        
    SUPERUSER_PHONE: str = os.getenv("SUPERUSER_PHONE")
    SUPERUSER_PASSWORD: str = os.getenv("SUPERUSER_PASSWORD")
    SUPERUSER_ROLE: str = os.getenv("SUPERUSER_ROLE", "superuser")
    
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_PUBLIC_KEY: str = os.getenv("STRIPE_PUBLIC_KEY")
    ADMIN_FEE_USD: int = int(os.getenv("ADMIN_FEE_USD", "1000"))  # 10 USD in cents

settings = Settings()

print(settings.DATABASE_URL)
print(f"Loaded STRIPE_SECRET_KEY: {settings.STRIPE_SECRET_KEY}")