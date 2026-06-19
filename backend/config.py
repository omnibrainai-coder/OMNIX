"""Centralized settings loader. Reads from /app/backend/.env."""
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")


class Settings:
    MONGO_URL: str = os.environ["MONGO_URL"]
    DB_NAME: str = os.environ["DB_NAME"]

    JWT_SECRET: str = os.environ["JWT_SECRET"]
    JWT_ALGORITHM: str = "HS256"
    OTP_HMAC_SECRET: str = os.environ["OTP_HMAC_SECRET"]
    COOKIE_SECRET: str = os.environ["COOKIE_SECRET"]

    ACCESS_TOKEN_MINUTES: int = int(os.environ.get("ACCESS_TOKEN_MINUTES", "15"))
    REFRESH_TOKEN_DAYS: int = int(os.environ.get("REFRESH_TOKEN_DAYS", "7"))
    PIN_DEADLINE_MINUTES: int = int(os.environ.get("PIN_DEADLINE_MINUTES", "3"))
    PIN_MAX_STRIKES: int = int(os.environ.get("PIN_MAX_STRIKES", "5"))

    ENV: str = os.environ.get("ENV", "dev")
    FAST2SMS_API_KEY: str = os.environ.get("FAST2SMS_API_KEY", "")
    FAST2SMS_SENDER_ID: str = os.environ.get("FAST2SMS_SENDER_ID", "")
    MOCK_OTP: str = os.environ.get("MOCK_OTP", "123456")

    # In dev (HTTP preview) Secure=True breaks cookies. We still keep HttpOnly + SameSite.
    COOKIE_SECURE: bool = ENV == "prod"


settings = Settings()
