from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

from backend.routes.settings_management import resolve_current_user_id
from backend.services.zero_knowledge import ZeroKnowledgeError, zero_knowledge_service


router = APIRouter(prefix="/api/v1/security", tags=["Zero Knowledge Security"])


def raise_zero_knowledge_error(error: ZeroKnowledgeError) -> None:
    raise HTTPException(status_code=error.status_code, detail=error.detail)


class PublicKeyBundleRequest(BaseModel):
    algorithm: str
    identity_public_key: str
    prekey_public_key: str
    prekey_key_id: str
    device_id: Optional[str] = "primary-device"


class EncryptedVaultRequest(BaseModel):
    encrypted_vault: str
    vault_nonce: str
    vault_salt: str
    vault_version: int
    recovery_hint: str


@router.put("/e2ee/key-bundle")
async def upsert_e2ee_key_bundle(req: PublicKeyBundleRequest, x_user_id: Optional[str] = Header(default=None)):
    user_id = resolve_current_user_id(x_user_id)
    bundle = zero_knowledge_service.upsert_public_key_bundle(user_id, req.model_dump())
    return {"success": True, "bundle": bundle}


@router.get("/e2ee/key-bundle/{user_id}")
async def get_e2ee_key_bundle(user_id: str):
    try:
        bundle = zero_knowledge_service.get_public_key_bundle(user_id)
    except ZeroKnowledgeError as error:
        raise_zero_knowledge_error(error)
    return {"success": True, "bundle": bundle}


@router.put("/lock-vault")
async def upsert_lock_vault(req: EncryptedVaultRequest, x_user_id: Optional[str] = Header(default=None)):
    user_id = resolve_current_user_id(x_user_id)
    vault = zero_knowledge_service.upsert_encrypted_vault(user_id, req.model_dump())
    return {"success": True, "vault": vault}


@router.get("/lock-vault")
async def get_lock_vault(x_user_id: Optional[str] = Header(default=None)):
    user_id = resolve_current_user_id(x_user_id)
    try:
        vault = zero_knowledge_service.get_encrypted_vault(user_id)
    except ZeroKnowledgeError as error:
        raise_zero_knowledge_error(error)
    return {"success": True, "vault": vault}