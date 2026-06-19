"""1-to-1 WebSocket chat. Conversations are deterministic from sorted (user_a, user_b).
Auth via access_token cookie at WS handshake. PIN-pending sessions are rejected.

Endpoints:
- GET  /api/chat/conversations              list user's conversations
- POST /api/chat/start                       open/create a 1-1 conversation with target username
- GET  /api/chat/messages/{conv_id}          paginated message history
- WS   /api/ws/chat/{conv_id}                real-time message stream
"""
import logging
from datetime import datetime, timezone
from typing import Dict, Set

from bson import ObjectId
from fastapi import APIRouter, Request, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from db import get_db
from deps import get_current_user
from security import ACCESS_COOKIE, decode_token, verify_csrf

log = logging.getLogger("chat")
router = APIRouter(tags=["chat"])


def _conv_id_for(uid_a: str, uid_b: str) -> str:
    a, b = sorted([str(uid_a), str(uid_b)])
    return f"{a}__{b}"


class StartChatIn(BaseModel):
    username: str


@router.post("/api/chat/start")
async def start_chat(payload: StartChatIn, request: Request):
    verify_csrf(request)
    me = await get_current_user(request)
    db = get_db()
    target = await db.users.find_one({"username": payload.username.strip().lower()})
    if not target:
        raise HTTPException(404, "User not found")
    if target["_id"] == me["_id"]:
        raise HTTPException(400, "Cannot chat with yourself")
    cid = _conv_id_for(me["_id"], target["_id"])
    await db.conversations.update_one(
        {"_id": cid},
        {"$setOnInsert": {
            "_id": cid,
            "members": [me["_id"], target["_id"]],
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
    cursor = db.conversations.find({"members": me["_id"]})
    out = []
    async for conv in cursor:
        peer_id = next((m for m in conv["members"] if m != me["_id"]), None)
        peer = await db.users.find_one({"_id": peer_id}) if peer_id else None
        last = await db.messages.find_one({"conversation_id": conv["_id"]}, sort=[("created_at", -1)])
        out.append({
            "conversation_id": conv["_id"],
            "peer": {"id": str(peer["_id"]), "username": peer["username"]} if peer else None,
            "last_message": {
                "text": last["text"],
                "from": str(last["from_user_id"]),
                "created_at": last["created_at"].isoformat(),
            } if last else None,
        })
    return {"conversations": out}


@router.get("/api/chat/messages/{conv_id}")
async def get_messages(conv_id: str, request: Request, limit: int = 50):
    me = await get_current_user(request)
    db = get_db()
    conv = await db.conversations.find_one({"_id": conv_id, "members": me["_id"]})
    if not conv:
        raise HTTPException(404, "Conversation not found")
    cursor = db.messages.find({"conversation_id": conv_id}).sort("created_at", -1).limit(min(limit, 200))
    msgs = [m async for m in cursor][::-1]
    return {
        "messages": [
            {
                "id": str(m["_id"]),
                "from": str(m["from_user_id"]),
                "text": m["text"],
                "created_at": m["created_at"].isoformat(),
            } for m in msgs
        ]
    }


# ---------- WebSocket connection manager ----------
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
    # Authenticate via the access_token cookie
    token = ws.cookies.get(ACCESS_COOKIE)
    if not token:
        await ws.close(code=4401)
        return
    try:
        payload = decode_token(token)
    except HTTPException:
        await ws.close(code=4401)
        return
    if payload.get("type") != "access" or payload.get("pin_pending"):
        await ws.close(code=4403)
        return

    db = get_db()
    try:
        user_oid = ObjectId(payload["sub"])
    except Exception:
        await ws.close(code=4401)
        return
    user = await db.users.find_one({"_id": user_oid})
    if not user:
        await ws.close(code=4401)
        return
    conv = await db.conversations.find_one({"_id": conv_id, "members": user["_id"]})
    if not conv:
        await ws.close(code=4404)
        return

    await manager.connect(conv_id, ws)
    try:
        while True:
            data = await ws.receive_json()
            text = (data.get("text") or "").strip()
            if not text:
                continue
            if len(text) > 2000:
                text = text[:2000]
            now = datetime.now(timezone.utc)
            msg_doc = {
                "conversation_id": conv_id,
                "from_user_id": user["_id"],
                "from_username": user["username"],
                "text": text,
                "created_at": now,
            }
            res = await db.messages.insert_one(msg_doc)
            await manager.broadcast(conv_id, {
                "type": "message",
                "id": str(res.inserted_id),
                "from": str(user["_id"]),
                "from_username": user["username"],
                "text": text,
                "created_at": now.isoformat(),
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
