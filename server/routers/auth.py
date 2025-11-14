from fastapi import APIRouter, Depends, HTTPException, status, Request
from schemas.auth import UserCreate, UserLogin, Token, UserResponse
from core.dependencies import get_current_user
from core.database import get_db
from core.security import get_password_hash, verify_password, create_access_token
from core.rate_limit import limiter, get_rate_limit
from model.user import User
from datetime import timedelta
from core.config import settings
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_rate_limit("auth_register"))
async def register(request: Request, user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Register a new user
    """
    try:
        # Check if user with email already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if user with username already exists
        existing_username = await db.users.find_one({"username": user_data.username})
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
            "hashed_password": hashed_password
        }
        
        result = await db.users.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        user = User(**user_dict)
        
        return UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            created_at=user.created_at.isoformat(),
            updated_at=user.updated_at.isoformat()
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
@limiter.limit(get_rate_limit("auth_login"))
async def login(request: Request, login_data: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Login and get access token
    """
    try:
        # Get user by email
        user_doc = await db.users.find_one({"email": login_data.email})
        if not user_doc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = User(**user_doc)
        
        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/me", response_model=UserResponse)
@limiter.limit(get_rate_limit("auth_me"))
async def get_current_user_info(request: Request, current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    try:
        return UserResponse(
            id=str(current_user.id),
            email=current_user.email,
            username=current_user.username,
            created_at=current_user.created_at.isoformat() if current_user.created_at else "",
            updated_at=current_user.updated_at.isoformat() if current_user.updated_at else ""
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

