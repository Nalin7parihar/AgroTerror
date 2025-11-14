from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # MongoDB Configuration
    MONGODB_URL: str = Field(alias="MONGO_URI")
    DATABASE_NAME: str
    
    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Configuration
    CORS_ORIGINS: list[str] = ["*"]
    
    # Gemini LLM Configuration
    GEMINI_API_KEY: str
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        populate_by_name=True
    )


settings = Settings()

