from pydantic import BaseModel, Field
from typing import Literal, Optional
from enum import Enum


class DifficultyLevel(str, Enum):
    """Difficulty levels for explanations"""
    BASIC = "basic"  # Simple explanations for beginners
    INTERMEDIATE = "intermediate"  # Moderate complexity
    ADVANCED = "advanced"  # For researchers and experts


class Language(str, Enum):
    """Supported languages"""
    ENGLISH = "en"
    HINDI = "hi"
    KANNADA = "kn"


class LLMQueryRequest(BaseModel):
    """Request model for LLM queries"""
    question: str = Field(..., description="The question about gene editing, biology, or CRISPR (can be in English, Hindi, or Kannada)")
    difficulty: DifficultyLevel = Field(
        default=DifficultyLevel.INTERMEDIATE,
        description="Difficulty level of the explanation"
    )
    language: Language = Field(
        default=Language.ENGLISH,
        description="Language for the response"
    )
    allow_code_mixing: bool = Field(
        default=False,
        description="Allow code-mixing (e.g., Hinglish) for better understanding"
    )


class LLMQueryResponse(BaseModel):
    """Response model for LLM queries"""
    answer: str = Field(..., description="The generated answer")
    question: str = Field(..., description="The original question")
    difficulty: DifficultyLevel = Field(..., description="Difficulty level used")
    language: Language = Field(..., description="Language used")

