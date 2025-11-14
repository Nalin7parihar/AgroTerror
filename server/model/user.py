from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_serializer
from typing import Optional
from datetime import datetime
from bson import ObjectId


class User(BaseModel):
    id: Optional[ObjectId] = Field(alias="_id", default=None)
    email: EmailStr
    username: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_serializer('id')
    def serialize_id(self, id: Optional[ObjectId], _info):
        if id is None:
            return None
        return str(id)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "email": "user@example.com",
                "username": "johndoe",
                "full_name": "John Doe",
                "is_active": True,
                "is_superuser": False
            }
        }
    )

