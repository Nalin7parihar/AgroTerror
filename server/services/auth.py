from fastapi import HTTPException, status
from core.database import get_database
from core.security import get_password_hash, verify_password, create_access_token
from model.user import User
from schemas.auth import UserCreate, UserLogin
from datetime import timedelta
from core.config import settings
from bson import ObjectId
from bson.errors import InvalidId


async def get_user_by_email(email: str) -> User | None:
    """
    Get a user by email
    """
    database = get_database()
    user = await database.users.find_one({"email": email})
    if user:
        return User(**user)
    return None


async def get_user_by_username(username: str) -> User | None:
    """
    Get a user by username
    """
    database = get_database()
    user = await database.users.find_one({"username": username})
    if user:
        return User(**user)
    return None


async def get_user_by_id(user_id: str) -> User | None:
    """
    Get a user by ID
    """
    try:
        object_id = ObjectId(user_id)
    except (InvalidId, ValueError):
        return None
    
    database = get_database()
    user = await database.users.find_one({"_id": object_id})
    if user:
        return User(**user)
    return None


async def create_user(user_data: UserCreate) -> User:
    """
    Create a new user
    """
    database = get_database()
    
    # Check if user with email already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if user with username already exists
    existing_username = await get_user_by_username(user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "email": user_data.email,
        "username": user_data.username,
        "hashed_password": hashed_password,
        "is_active": True,
        "is_superuser": False,
    }
    
    result = await database.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    return User(**user_dict)


async def authenticate_user(email: str, password: str) -> User | None:
    """
    Authenticate a user by email and password
    """
    user = await get_user_by_email(email)
    if not user:
        return None
    
    if not user.is_active:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user


async def login_user(login_data: UserLogin) -> dict:
    """
    Login a user and return access token
    """
    user = await authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

