from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./edugenie.db"
    secret_key: str = "dev-secret-key-change-in-production"
    gemini_api_key: str = ""
    upload_dir: str = "./uploads"
    chroma_dir: str = "./chroma_db"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    access_token_expire_minutes: int = 60 * 24

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
