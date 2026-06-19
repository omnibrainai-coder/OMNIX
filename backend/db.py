"""MongoDB client + collection accessors + startup index creation."""
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGO_URL, tz_aware=True)
    return _client


def get_db():
    return get_client()[settings.DB_NAME]


async def ensure_indexes():
    db = get_db()
    await db.users.create_index("username", unique=True)
    await db.users.create_index("phone", unique=True)
    # OTP TTL: docs auto-deleted after 300s
    await db.otps.create_index("created_at", expireAfterSeconds=300)
    # Stories TTL: docs deleted at exact expires_at timestamp
    await db.stories.create_index("expires_at", expireAfterSeconds=0)
    # Refresh-token revocation list TTL = 8 days (refresh = 7)
    await db.revoked_tokens.create_index("revoked_at", expireAfterSeconds=86400 * 8)
    # Messages: index for conversation feed
    await db.messages.create_index([("conversation_id", 1), ("created_at", 1)])
    # Rate limit OTP requests per phone
    await db.otp_attempts.create_index("created_at", expireAfterSeconds=3600)


def close_client():
    global _client
    if _client is not None:
        _client.close()
        _client = None
