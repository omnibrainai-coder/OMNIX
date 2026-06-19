"""1-to-1 WebSocket chat with text + photo/video/audio attachments,
per-room wallpaper, and block-aware filtering.

Endpoints:
- POST /api/chat/start                       open/create 1-1 conversation
- GET  /api/chat/conversations               list user's conversations
- GET  /api/chat/messages/{conv_id}          paginated history
- POST /api/chat/{conv_id}/wallpaper         set chat background
- GET  /api/chat/{conv_id}/wallpaper         get chat background
- POST /api/chat/{conv_id}/attachment        upload attachment, returns id
- WS   /api/ws/chat/{conv_id}                real-time stream
"""
import base64
import logging
from datetime import datetime, timezone
from typing import Dict, Set

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from pydantic import BaseModel

from db import get_db
from deps import get_current_user
from security import ACCESS_COOKIE, decode_token, verify_csrf
from routers.users import _bump_streak

log = logging.getLogger("chat")
router = APIRouter(tags=["chat"])

ATTACHMENT_LIMIT = 8 * 1024 * 1024  # 8 MB
ATTACHMENT_KINDS = {
    "photo": {"image/jpeg", "image/png", "image/webp", "image/gif"},
    "video": {"video/mp4", "video/webm", "video/quicktime"},
    "audio": {"audio/mpeg", "audio/mp4", "audio/webm", "audio/ogg", "audio/wav"},
}
PREDEFINED_WALLPAPERS = {
    "default": "#0f1115",
    "midnight": "#0a0f1a",
    "rose": "#1f0d14",
    "forest": "#0d1f13",
    "sand": "#1f1a0d",
}


def _conv_id_for(uid_a, uid_b) -> str:
    a, b = sorted([str(uid_a), str(uid_b)])
    return f"{a}__{b}"


class StartChatIn(BaseModel):
    username: str


class WallpaperIn(BaseModel):
    # Either preset_id or custom_b64 + mime
    preset_id: str | None = None
    custom_b64: str | None = None
    custom_mime: str | None = None


async def _are_blocked(db, a, b) -> bool:
    return bool(await db.blocks.find_one({"$or": [
        {"blocker": a, "blocked": b},
        {"blocker": b, "blocked": a},
    ]}))


@router.post("/api/chat/start")
async def start_chat(payload: StartChatIn, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    target = await db.users.find_one({"username": payload.username.strip().lower(),
                                       "deleted_at": {"$exists": False}})
    if not target:
        raise HTTPException(404, "User not found")
    if target["_id"] == me["_id"]:
        raise HTTPException(400, "Cannot chat with yourself")
    if await _are_blocked(db, me["_id"], target["_id"]):
        raise HTTPException(403, "Cannot start chat")
    cid = _conv_id_for(me["_id"], target["_id"])
    await db.conversations.update_one(
        {"_id": cid},
        {"$setOnInsert": {
            "_id": cid,
            "members": [me["_id"], target["_id"]],
            "wallpaper": {"preset_id": "default"},
            "created_at": datetime.now(timezone.utc),
        }},
        upsert=True,
    )
    return {
        "conversation_id": cid,
        "peer": {"id": str(target["_id"]), "username": target["username"]},
    }


@router.get("/api/chat/conversations")
async def list_conversations(request: Request):
    me = await get_current_user(request)
    db = get_db()
    blocked_ids = {b["blocked"] async for b in db.blocks.find({"blocker": me["_id"]})}
    blocked_ids |= {b["blocker"] async for b in db.blocks.find({"blocked": me["_id"]})}
    cursor = db.conversations.find({"members": me["_id"]})
    out = []
    async for conv in cursor:
        peer_id = next((m for m in conv["members"] if m != me["_id"]), None)
        if peer_id in blocked_ids:
            continue
        peer = await db.users.find_one({"_id": peer_id, "deleted_at": {"$exists": False}}) if peer_id else None
        if not peer:
            continue
        last = await db.messages.find_one({"conversation_id": conv["_id"]}, sort=[("created_at", -1)])
        out.append({
            "conversation_id": conv["_id"],
            "peer": {"id": str(peer["_id"]), "username": peer["username"]},
            "last_message": _serialize_message(last) if last else None,
        })
    return {"conversations": out}


def _serialize_message(m: dict) -> dict:
    return {
        "id": str(m["_id"]),
        "from": str(m["from_user_id"]),
        "from_username": m.get("from_username", ""),
        "kind": m.get("kind", "text"),
        "text": m.get("text", ""),
        "attachment": m.get("attachment"),
        "created_at": m["created_at"].isoformat(),
    }


@router.get("/api/chat/messages/{conv_id}")
async def get_messages(conv_id: str, request: Request, limit: int = 50):
    me = await get_current_user(request)
    db = get_db()
    conv = await db.conversations.find_one({"_id": conv_id, "members": me["_id"]})
    if not conv:
        raise HTTPException(404, "Conversation not found")
    cursor = db.messages.find({"conversation_id": conv_id}).sort("created_at", -1).limit(min(limit, 200))
    msgs = [m async for m in cursor][::-1]
    return {"messages": [_serialize_message(m) for m in msgs]}


# ---------- Wallpaper ----------
@router.get("/api/chat/{conv_id}/wallpaper")
async def get_wallpaper(conv_id: str, request: Request):
    me = await get_current_user(request)
    db = get_db()
    conv = await db.conversations.find_one({"_id": conv_id, "members": me["_id"]})
    if not conv:
        raise HTTPException(404, "Conversation not found")
    return {"wallpaper": conv.get("wallpaper") or {"preset_id": "default"},
            "presets": PREDEFINED_WALLPAPERS}


@router.post("/api/chat/{conv_id}/wallpaper")
async def set_wallpaper(conv_id: str, payload: WallpaperIn, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    conv = await db.conversations.find_one({"_id": conv_id, "members": me["_id"]})
    if not conv:
        raise HTTPException(404, "Conversation not found")
    wallpaper = {}
    if payload.preset_id:
        if payload.preset_id not in PREDEFINED_WALLPAPERS:
            raise HTTPException(400, "Unknown preset")
        wallpaper = {"preset_id": payload.preset_id}
    elif payload.custom_b64 and payload.custom_mime:
        if payload.custom_mime not in ATTACHMENT_KINDS["photo"]:
            raise HTTPException(400, "Wallpaper must be an image")
        try:
            raw = base64.b64decode(payload.custom_b64, validate=True)
        except Exception:
            raise HTTPException(400, "Invalid base64")
        if len(raw) > 2 * 1024 * 1024:
            raise HTTPException(413, "Wallpaper too large (max 2 MB)")
        wallpaper = {"custom_b64": payload.custom_b64, "custom_mime": payload.custom_mime}
    else:
        raise HTTPException(400, "Provide preset_id OR (custom_b64 + custom_mime)")
    await db.conversations.update_one({"_id": conv_id}, {"$set": {"wallpaper": wallpaper}})
    return {"ok": True, "wallpaper": wallpaper}


# ---------- Attachment upload (returns base64 + metadata for WS payload) ----------
@router.post("/api/chat/{conv_id}/attachment")
async def upload_attachment(conv_id: str, request: Request, file: UploadFile = File(...)):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    conv = await db.conversations.find_one({"_id": conv_id, "members": me["_id"]})
    if not conv:
        raise HTTPException(404, "Conversation not found")
    kind = None
    for k, mimes in ATTACHMENT_KINDS.items():
        if file.content_type in mimes:
            kind = k
            break
    if not kind:
        raise HTTPException(400, f"Unsupported MIME: {file.content_type}")
    raw = await file.read()
    if len(raw) > ATTACHMENT_LIMIT:
        raise HTTPException(413, "Attachment too large (max 8 MB)")
    attachment = {
        "kind": kind,
        "mime": file.content_type,
        "b64": base64.b64encode(raw).decode(),
        "bytes": len(raw),
        "name": file.filename or "",
    }
    return {"ok": True, "attachment": attachment}


# ---------- WebSocket ----------
class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(self, conv_id: str, ws: WebSocket):
        await ws.accept()
        self.rooms.setdefault(conv_id, set()).add(ws)

    def disconnect(self, conv_id: str, ws: WebSocket):
        room = self.rooms.get(conv_id)
        if room and ws in room:
            room.discard(ws)
            if not room:
                self.rooms.pop(conv_id, None)

    async def broadcast(self, conv_id: str, message: dict):
        room = self.rooms.get(conv_id, set())
        dead = []
        for ws in room:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(conv_id, ws)


manager = ConnectionManager()


@router.websocket("/api/ws/chat/{conv_id}")
async def ws_chat(ws: WebSocket, conv_id: str):
    token = ws.cookies.get(ACCESS_COOKIE)
    if not token:
        await ws.close(code=4401); return
    try:
        payload = decode_token(token)
    except HTTPException:
        await ws.close(code=4401); return
    if payload.get("type") != "access" or payload.get("pin_pending"):
        await ws.close(code=4403); return

    db = get_db()
    try:
        user_oid = ObjectId(payload["sub"])
    except Exception:
        await ws.close(code=4401); return
    user = await db.users.find_one({"_id": user_oid, "deleted_at": {"$exists": False}})
    if not user:
        await ws.close(code=4401); return
    conv = await db.conversations.find_one({"_id": conv_id, "members": user["_id"]})
    if not conv:
        await ws.close(code=4404); return

    peer_id = next((m for m in conv["members"] if m != user["_id"]), None)
    if peer_id and await _are_blocked(db, user["_id"], peer_id):
        await ws.close(code=4403); return

    await manager.connect(conv_id, ws)
    try:
        while True:
            data = await ws.receive_json()
            kind = (data.get("kind") or "text").lower()
            text = (data.get("text") or "").strip()
            attachment = data.get("attachment")  # {kind, mime, b64, bytes}

            if kind == "text":
                if not text:
                    continue
                if len(text) > 2000:
                    text = text[:2000]
                attachment = None
            elif kind in ATTACHMENT_KINDS:
                if not attachment or attachment.get("kind") != kind:
                    continue
                # Server-side cap (already enforced on upload but re-check)
                if attachment.get("bytes", 0) > ATTACHMENT_LIMIT:
                    continue
            else:
                continue  # unknown kind, ignore

            now = datetime.now(timezone.utc)
            msg_doc = {
                "conversation_id": conv_id,
                "from_user_id": user["_id"],
                "from_username": user["username"],
                "kind": kind,
                "text": text if kind == "text" else "",
                "attachment": attachment,
                "created_at": now,
            }
            res = await db.messages.insert_one(msg_doc)
            # Bump streak between members
            if peer_id:
                try:
                    await _bump_streak(db, user["_id"], peer_id)
                except Exception as e:
                    log.warning(f"streak bump failed: {e}")
            await manager.broadcast(conv_id, {
                "type": "message",
                **_serialize_message({**msg_doc, "_id": res.inserted_id}),
            })
    except WebSocketDisconnect:
        manager.disconnect(conv_id, ws)
    except Exception as e:
        log.exception(f"WS error: {e}")
        manager.disconnect(conv_id, ws)
        try:
            await ws.close()
        except Exception:
            pass
