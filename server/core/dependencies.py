from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from bson import ObjectId
from core.config import settings
from core.database import get_db
from model.user import User
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
) -> User:
    """
    Dependency to get the current authenticated user from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please provide a valid authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if credentials is None:
        logger.warning("Authentication failed: No credentials provided")
        raise credentials_exception
    
    try:
        token = credentials.credentials
        if not token:
            logger.warning("Authentication failed: Empty token provided")
            raise credentials_exception
            
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            logger.warning("Authentication failed: No user ID in token payload")
            raise credentials_exception
    except JWTError as e:
        logger.warning(f"Authentication failed: JWT validation error - {str(e)}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise credentials_exception
    
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            logger.warning(f"Authentication failed: User not found with ID {user_id}")
            raise credentials_exception
    except Exception as e:
        logger.error(f"Database error during authentication: {str(e)}")
        raise credentials_exception
    
    return User(**user)

