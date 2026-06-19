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

    # ---------- users ----------
    await db.users.create_index("username", unique=True)
    await db.users.create_index("phone", unique=True)
    await db.users.create_index("deleted_at", sparse=True)
    await db.users.create_index("search_hidden")
    # Text index for fuzzy global search (Mongo built-in word-level matching)
    try:
        await db.users.create_index(
            [("username", "text"), ("display_name", "text"), ("bio", "text")],
            default_language="english",
            name="users_text_search",
        )
    except Exception:
        # Already exists with different definition — ignore
        pass

    # ---------- otp ----------
    await db.otps.create_index("created_at", expireAfterSeconds=300)
    await db.otp_attempts.create_index("created_at", expireAfterSeconds=3600)

    # ---------- stories ----------
    # NOTE: no TTL index on stories anymore — we archive instead of delete.
    # Drop legacy TTL index from previous version if present.
    try:
        await db.stories.drop_index("expires_at_1")
    except Exception:
        pass
    await db.stories.create_index([("user_id", 1), ("created_at", -1)])
    await db.stories.create_index("expires_at")
    await db.stories.create_index("archived")

    # ---------- posts ----------
    await db.posts.create_index([("user_id", 1), ("created_at", -1)])
    await db.posts.create_index("created_at")

    # ---------- chat ----------
    await db.messages.create_index([("conversation_id", 1), ("created_at", 1)])
    await db.conversations.create_index("members")

    # ---------- social graph ----------
    await db.follows.create_index([("follower", 1), ("followee", 1)], unique=True)
    await db.follows.create_index("followee")
    await db.follows.create_index("follower")

    await db.blocks.create_index([("blocker", 1), ("blocked", 1)], unique=True)
    await db.blocks.create_index("blocked")

    await db.streaks.create_index([("user_a", 1), ("user_b", 1)], unique=True)

    # ---------- compliance / housekeeping ----------
    await db.tombstones.create_index("username", unique=True)
    await db.tombstones.create_index("released_at")
    await db.revoked_tokens.create_index("revoked_at", expireAfterSeconds=86400 * 8)


def close_client():
    global _client
    if _client is not None:
        _client.close()
        _client = None
