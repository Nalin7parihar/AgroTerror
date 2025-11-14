from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import Optional
from datetime import datetime
from bson import ObjectId
from schemas.llm import DifficultyLevel, Language


class LLMQuery(BaseModel):
    """Model for storing LLM queries and responses in MongoDB"""
    id: Optional[ObjectId] = Field(alias="_id", default=None)
    user_id: ObjectId = Field(..., description="ID of the user who made the query")
    question: str = Field(..., description="The question asked")
    answer: str = Field(..., description="The generated answer")
    difficulty: DifficultyLevel = Field(..., description="Difficulty level used")
    language: Language = Field(..., description="Language used")
    allow_code_mixing: bool = Field(default=False, description="Whether code-mixing was allowed")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="When the query was created")

    @field_serializer('id')
    def serialize_id(self, id: Optional[ObjectId], _info):
        if id is None:
            return None
        return str(id)
    
    @field_serializer('user_id')
    def serialize_user_id(self, user_id: ObjectId, _info):
        return str(user_id)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "question": "What is CRISPR?",
                "answer": "CRISPR is a gene editing technology...",
                "difficulty": "intermediate",
                "language": "en",
                "allow_code_mixing": False
            }
        }
    )

