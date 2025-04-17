from app.users.dao import UsersDAO
from app.users.auth import get_password_hash
from app.database import get_db
from app.config import settings
import logging

logger = logging.getLogger(__name__)

async def init_superuser():
    """Initialize a superuser based on .env credentials if one doesn't exist."""
    async for db in get_db():
        try:
            existing_superuser = await UsersDAO.find_one_or_none(role="superuser")
            if existing_superuser:
                logger.info("Superuser already exists. Skipping creation.")
                return

            if not all([settings.SUPERUSER_PHONE, settings.SUPERUSER_PASSWORD, settings.SUPERUSER_ROLE]):
                logger.error("Superuser credentials not fully provided in .env")
                return

            hashed_password = await get_password_hash(settings.SUPERUSER_PASSWORD)
            await UsersDAO.add(
                phone=settings.SUPERUSER_PHONE,
                hashed_password=hashed_password,
                role=settings.SUPERUSER_ROLE
            )
            logger.info(f"Superuser created with phone: {settings.SUPERUSER_PHONE}")

        except Exception as e:
            logger.error(f"Error initializing superuser: {str(e)}")
            await db.rollback()
        finally:
            await db.close()