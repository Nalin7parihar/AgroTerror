from fastapi import APIRouter, Depends, HTTPException, status, Request
from schemas.llm import LLMQueryRequest, LLMQueryResponse
from services.gemini import generate_response
from core.dependencies import get_current_user
from core.database import get_db
from core.rate_limit import limiter, get_rate_limit
from model.user import User
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/llm", tags=["LLM"])


@router.post("/query", response_model=LLMQueryResponse, status_code=status.HTTP_200_OK)
@limiter.limit(get_rate_limit("llm_query"))
async def query_llm(
    http_request: Request,
    request: LLMQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    try:
        if not request.question or not request.question.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question cannot be empty"
            )
        
        # Generate response
        response = await generate_response(request)
        
        # Save to database after generation
        user_id = current_user.id if isinstance(current_user.id, ObjectId) else ObjectId(current_user.id)
        llm_query_dict = {
            "user_id": user_id,
            "question": response.question,
            "answer": response.answer,
            "difficulty": response.difficulty.value,
            "language": response.language.value,
            "allow_code_mixing": request.allow_code_mixing,
            "created_at": datetime.utcnow()
        }
        
        await db.llm_queries.insert_one(llm_query_dict)
        logger.info(f"Saved LLM query to database for user: {user_id}")
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in LLM query endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process query: {str(e)}"
        )

