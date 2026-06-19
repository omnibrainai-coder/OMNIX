"""Users router: profile, follow, close friends, block, search, streak, hide, delete account.

All endpoints under /api/users/*.
"""
import re
import base64
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form, Response
from pydantic import BaseModel, Field

from db import get_db
from deps import get_current_user
from security import verify_csrf, clear_auth_cookies

router = APIRouter(prefix="/api/users", tags=["users"])

USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]{3,24}$")
MAX_AVATAR_BYTES = 1 * 1024 * 1024
MAX_BIO_LEN = 280


class UpdateProfileIn(BaseModel):
    bio: str | None = Field(default=None, max_length=MAX_BIO_LEN)
    display_name: str | None = Field(default=None, max_length=60)


class CloseFriendsIn(BaseModel):
    usernames: list[str]


def _public_user(u: dict) -> dict:
    return {
        "id": str(u["_id"]),
        "username": u["username"],
        "display_name": u.get("display_name") or u["username"],
        "bio": u.get("bio") or "",
        "avatar_b64": u.get("avatar_b64") or "",
        "avatar_mime": u.get("avatar_mime") or "",
        "is_hidden": bool(u.get("search_hidden")),
        "is_deleted": bool(u.get("deleted_at")),
    }


# ---------- Profile ----------
@router.get("/me")
async def my_profile(request: Request):
    user = await get_current_user(request)
    return {**_public_user(user), "phone": user["phone"], "close_friends": [str(x) for x in user.get("close_friends", [])]}


@router.patch("/me")
async def update_profile(payload: UpdateProfileIn, request: Request):
    verify_csrf(request)
    user = await get_current_user(request)
    db = get_db()
    upd = {"updated_at": datetime.now(timezone.utc)}
    if payload.bio is not None:
        upd["bio"] = payload.bio.strip()
    if payload.display_name is not None:
        upd["display_name"] = payload.display_name.strip()
    await db.users.update_one({"_id": user["_id"]}, {"$set": upd})
    return {"ok": True}


@router.post("/me/avatar")
async def upload_avatar(request: Request, image: UploadFile = File(...)):
    verify_csrf(request)
    user = await get_current_user(request)
    if image.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(400, "Only JPEG/PNG/WEBP allowed")
    raw = await image.read()
    if len(raw) > MAX_AVATAR_BYTES:
        raise HTTPException(413, "Avatar too large (max 1 MB)")
    db = get_db()
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "avatar_b64": base64.b64encode(raw).decode(),
            "avatar_mime": image.content_type,
            "updated_at": datetime.now(timezone.utc),
        }},
    )
    return {"ok": True}


@router.get("/{username}")
async def get_profile(username: str, request: Request):
    me = await get_current_user(request)
    db = get_db()
    u = await db.users.find_one({"username": username.lower(), "deleted_at": {"$exists": False}})
    if not u:
        raise HTTPException(404, "User not found")
    # If hidden and not me and not following, 404
    if u.get("search_hidden") and u["_id"] != me["_id"]:
        is_follower = await db.follows.find_one({"follower": me["_id"], "followee": u["_id"]})
        if not is_follower:
            raise HTTPException(404, "User not found")
    # Block check
    if await db.blocks.find_one({"blocker": u["_id"], "blocked": me["_id"]}):
        raise HTTPException(404, "User not found")
    followers = await db.follows.count_documents({"followee": u["_id"]})
    following = await db.follows.count_documents({"follower": u["_id"]})
    am_following = bool(await db.follows.find_one({"follower": me["_id"], "followee": u["_id"]}))
    return {**_public_user(u), "followers": followers, "following": following, "am_following": am_following}


# ---------- Follow ----------
@router.post("/{username}/follow")
async def follow(username: str, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    target = await db.users.find_one({"username": username.lower(), "deleted_at": {"$exists": False}})
    if not target:
        raise HTTPException(404, "User not found")
    if target["_id"] == me["_id"]:
        raise HTTPException(400, "Cannot follow yourself")
    if await db.blocks.find_one({"$or": [
        {"blocker": me["_id"], "blocked": target["_id"]},
        {"blocker": target["_id"], "blocked": me["_id"]},
    ]}):
        raise HTTPException(403, "Cannot follow")
    await db.follows.update_one(
        {"follower": me["_id"], "followee": target["_id"]},
        {"$setOnInsert": {
            "follower": me["_id"], "followee": target["_id"],
            "created_at": datetime.now(timezone.utc),
        }},
        upsert=True,
    )
    return {"ok": True}


@router.delete("/{username}/follow")
async def unfollow(username: str, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    target = await db.users.find_one({"username": username.lower()})
    if not target:
        raise HTTPException(404, "User not found")
    await db.follows.delete_one({"follower": me["_id"], "followee": target["_id"]})
    return {"ok": True}


@router.get("/me/followers")
async def my_followers(request: Request):
    me = await get_current_user(request)
    db = get_db()
    out = []
    async for f in db.follows.find({"followee": me["_id"]}):
        u = await db.users.find_one({"_id": f["follower"], "deleted_at": {"$exists": False}})
        if u: out.append(_public_user(u))
    return {"followers": out}


@router.get("/me/following")
async def my_following(request: Request):
    me = await get_current_user(request)
    db = get_db()
    out = []
    async for f in db.follows.find({"follower": me["_id"]}):
        u = await db.users.find_one({"_id": f["followee"], "deleted_at": {"$exists": False}})
        if u: out.append(_public_user(u))
    return {"following": out}


# ---------- Close Friends ----------
@router.put("/me/close-friends")
async def set_close_friends(payload: CloseFriendsIn, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    ids = []
    for uname in payload.usernames:
        u = await db.users.find_one({"username": uname.lower()})
        if u and u["_id"] != me["_id"]:
            ids.append(u["_id"])
    await db.users.update_one(
        {"_id": me["_id"]},
        {"$set": {"close_friends": ids, "updated_at": datetime.now(timezone.utc)}},
    )
    return {"ok": True, "count": len(ids)}


@router.get("/me/close-friends")
async def get_close_friends(request: Request):
    me = await get_current_user(request)
    db = get_db()
    out = []
    for uid in me.get("close_friends", []):
        u = await db.users.find_one({"_id": uid, "deleted_at": {"$exists": False}})
        if u: out.append(_public_user(u))
    return {"close_friends": out}


# ---------- Block ----------
@router.post("/{username}/block")
async def block_user(username: str, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    target = await db.users.find_one({"username": username.lower()})
    if not target:
        raise HTTPException(404, "User not found")
    if target["_id"] == me["_id"]:
        raise HTTPException(400, "Cannot block yourself")
    await db.blocks.update_one(
        {"blocker": me["_id"], "blocked": target["_id"]},
        {"$setOnInsert": {
            "blocker": me["_id"], "blocked": target["_id"],
            "created_at": datetime.now(timezone.utc),
        }},
        upsert=True,
    )
    # Auto-unfollow both sides
    await db.follows.delete_many({"$or": [
        {"follower": me["_id"], "followee": target["_id"]},
        {"follower": target["_id"], "followee": me["_id"]},
    ]})
    return {"ok": True}


@router.delete("/{username}/block")
async def unblock_user(username: str, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    target = await db.users.find_one({"username": username.lower()})
    if not target:
        raise HTTPException(404, "User not found")
    await db.blocks.delete_one({"blocker": me["_id"], "blocked": target["_id"]})
    return {"ok": True}


@router.get("/me/blocks")
async def list_blocks(request: Request):
    me = await get_current_user(request)
    db = get_db()
    out = []
    async for b in db.blocks.find({"blocker": me["_id"]}):
        u = await db.users.find_one({"_id": b["blocked"]})
        if u: out.append(_public_user(u))
    return {"blocked": out}


# ---------- Privacy: hide from global search ----------
class HideIn(BaseModel):
    hidden: bool


@router.put("/me/visibility")
async def set_visibility(payload: HideIn, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    await db.users.update_one(
        {"_id": me["_id"]},
        {"$set": {"search_hidden": bool(payload.hidden), "updated_at": datetime.now(timezone.utc)}},
    )
    return {"ok": True, "hidden": bool(payload.hidden)}


# ---------- Account deletion (soft + hard) ----------
@router.post("/me/delete")
async def soft_delete_account(request: Request, response: Response):
    """Soft-delete: 30-day grace period. User can recover by logging in
    (we'd also need a recover endpoint; for prototype, hard-delete worker would purge after 30d)."""
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": me["_id"]},
        {"$set": {"deleted_at": now, "search_hidden": True}},
    )
    # Revoke active session
    clear_auth_cookies(response)
    return {"ok": True, "purge_at": (now + timedelta(days=30)).isoformat()}


@router.post("/me/delete-hard")
async def hard_delete_account(request: Request, response: Response):
    """Immediate, irreversible wipe. Cascades to posts/stories/messages/follows/blocks/streaks."""
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    uid = me["_id"]
    # Cascade
    await db.posts.delete_many({"user_id": uid})
    await db.stories.delete_many({"user_id": uid})
    await db.messages.delete_many({"$or": [{"from_user_id": uid}]})
    await db.conversations.delete_many({"members": uid})
    await db.follows.delete_many({"$or": [{"follower": uid}, {"followee": uid}]})
    await db.blocks.delete_many({"$or": [{"blocker": uid}, {"blocked": uid}]})
    await db.streaks.delete_many({"$or": [{"user_a": uid}, {"user_b": uid}]})
    # Tombstone username for 90d
    await db.tombstones.insert_one({
        "username": me["username"],
        "released_at": datetime.now(timezone.utc) + timedelta(days=90),
        "created_at": datetime.now(timezone.utc),
    })
    await db.users.delete_one({"_id": uid})
    clear_auth_cookies(response)
    return {"ok": True}


# ---------- Search ----------
@router.get("/search/q")
async def search_users(request: Request, q: str = "", limit: int = 20):
    me = await get_current_user(request)
    q = q.strip()
    if len(q) < 1:
        return {"results": []}
    db = get_db()
    # Exclude hidden, deleted, and bidirectional blocks
    blocked_by = [b["blocker"] async for b in db.blocks.find({"blocked": me["_id"]})]
    i_blocked = [b["blocked"] async for b in db.blocks.find({"blocker": me["_id"]})]
    excluded = list(set(blocked_by) | set(i_blocked))
    pattern = re.escape(q)
    cursor = db.users.find(
        {
            "$and": [
                {"deleted_at": {"$exists": False}},
                {"search_hidden": {"$ne": True}},
                {"_id": {"$nin": excluded}},
                {"$or": [
                    {"username": {"$regex": pattern, "$options": "i"}},
                    {"display_name": {"$regex": pattern, "$options": "i"}},
                    {"bio": {"$regex": pattern, "$options": "i"}},
                ]},
            ]
        }
    ).limit(min(limit, 50))
    return {"results": [_public_user(u) async for u in cursor]}


# ---------- Streak ----------
async def _bump_streak(db, uid_a, uid_b) -> dict:
    """Update streak between two users based on interaction window:
    - If never interacted: create with count=1
    - If last interaction < 22h ago: keep count, just bump last_interaction
    - If between 22h and 48h: increment count, set new last_interaction
    - If > 48h (missed the 24h window): reset to 1
    """
    a, b = sorted([uid_a, uid_b], key=str)
    now = datetime.now(timezone.utc)
    doc = await db.streaks.find_one({"user_a": a, "user_b": b})
    if not doc:
        await db.streaks.insert_one({
            "user_a": a, "user_b": b,
            "count": 1,
            "last_interaction": now,
            "started_at": now,
        })
        return {"count": 1, "last_interaction": now.isoformat()}
    last = doc["last_interaction"]
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    delta = now - last
    if delta < timedelta(hours=22):
        new_count = doc["count"]
    elif delta <= timedelta(hours=48):
        new_count = doc["count"] + 1
    else:
        new_count = 1
    await db.streaks.update_one(
        {"_id": doc["_id"]},
        {"$set": {"count": new_count, "last_interaction": now}},
    )
    return {"count": new_count, "last_interaction": now.isoformat()}


@router.get("/streak/{username}")
async def get_streak(username: str, request: Request):
    me = await get_current_user(request)
    db = get_db()
    target = await db.users.find_one({"username": username.lower()})
    if not target:
        raise HTTPException(404, "User not found")
    a, b = sorted([me["_id"], target["_id"]], key=str)
    doc = await db.streaks.find_one({"user_a": a, "user_b": b})
    if not doc:
        return {"count": 0, "active": False, "last_interaction": None}
    last = doc["last_interaction"]
    if last.tzinfo is None:
        last = last.replace(tzinfo=timezone.utc)
    delta = datetime.now(timezone.utc) - last
    return {
        "count": doc["count"] if delta <= timedelta(hours=48) else 0,
        "active": delta <= timedelta(hours=24),
        "last_interaction": last.isoformat(),
    }
