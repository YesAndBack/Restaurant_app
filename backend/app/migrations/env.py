from logging.config import fileConfig 
import os 
from posixpath import abspath, dirname 
import asyncio 
import sys 
 
from sqlalchemy import engine_from_config 
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine 
 
from sqlalchemy import pool 
 
from alembic import context 
 
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))) 
 
from app.database import Base 
from app.config import settings 
 
from app.restaurants.models import Restaurant, RestaurantImage 
from app.bookings.models import Bookings 
from app.users.models import Users 
from app.reviews.models import Reviews 
 
# this is the Alembic Config object, which provides 
# access to the values within the .ini file in use. 
config = context.config 
 
config.set_main_option("sqlalchemy.url", f"{settings.DATABASE_URL}?async_fallback=True") 
 
# Interpret the config file for Python logging. 
# This line sets up loggers basically. 
if config.config_file_name is not None: 
    fileConfig(config.config_file_name) 
 
# add your model's MetaData object here 
# for 'autogenerate' support 
target_metadata = Base.metadata 
 
def run_migrations_offline() -> None: 
    """Run migrations in 'offline' mode. 
 
    This configures the context with just a URL 
    and not an Engine, though an Engine is acceptable 
    here as well.  By skipping the Engine creation 
    we don't even need a DBAPI to be available. 
 
    Calls to context.execute() here emit the given string to the 
    script output. 
    """ 
    url = config.get_main_option("sqlalchemy.url") 
    context.configure( 
        url=url, 
        target_metadata=target_metadata, 
        literal_binds=True, 
        dialect_opts={"paramstyle": "named"}, 
    ) 
 
    with context.begin_transaction(): 
        context.run_migrations() 
 
 
async def run_migrations_online() -> None: 
    """Run migrations in 'online' mode. 
 
    In this scenario we need to create an Engine 
    and associate a connection with the context. 
    """ 
    connectable = create_async_engine(settings.DATABASE_URL) 
 
    async with connectable.connect() as connection: 
        await connection.run_sync(do_run_migrations) 
 
    await connectable.dispose() 
 
 
def do_run_migrations(connection): 
    context.configure( 
        connection=connection, 
        target_metadata=target_metadata, 
        compare_type=True, 
    ) 
 
    with context.begin_transaction(): 
        context.run_migrations() 
 
 
if context.is_offline_mode(): 
    run_migrations_offline() 
else: 
    asyncio.run(run_migrations_online())