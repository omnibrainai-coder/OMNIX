from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import Any, Dict, Optional


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class ZeroKnowledgeError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class ZeroKnowledgeService:
    def __init__(self) -> None:
        self.public_key_bundles: Dict[str, Dict[str, Any]] = {}
        self.encrypted_vaults: Dict[str, Dict[str, Any]] = {}

    def upsert_public_key_bundle(self, user_id: str, bundle: Dict[str, Any]) -> Dict[str, Any]:
        required = {"algorithm", "identity_public_key", "prekey_public_key", "prekey_key_id"}
        missing = required.difference(bundle.keys())
        if missing:
            raise ZeroKnowledgeError(400, f"Missing public key bundle fields: {', '.join(sorted(missing))}")
        stored = {
            "user_id": user_id,
            "algorithm": bundle["algorithm"],
            "identity_public_key": bundle["identity_public_key"],
            "prekey_public_key": bundle["prekey_public_key"],
            "prekey_key_id": bundle["prekey_key_id"],
            "device_id": bundle.get("device_id", "primary-device"),
            "updated_at": iso_now(),
        }
        self.public_key_bundles[user_id] = stored
        return deepcopy(stored)

    def get_public_key_bundle(self, user_id: str) -> Dict[str, Any]:
        bundle = self.public_key_bundles.get(user_id)
        if bundle is None:
            raise ZeroKnowledgeError(404, "Public key bundle not found")
        return deepcopy(bundle)

    def upsert_encrypted_vault(self, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        required = {"encrypted_vault", "vault_nonce", "vault_salt", "vault_version", "recovery_hint"}
        missing = required.difference(payload.keys())
        if missing:
            raise ZeroKnowledgeError(400, f"Missing encrypted vault fields: {', '.join(sorted(missing))}")
        stored = {
            "user_id": user_id,
            "encrypted_vault": payload["encrypted_vault"],
            "vault_nonce": payload["vault_nonce"],
            "vault_salt": payload["vault_salt"],
            "vault_version": payload["vault_version"],
            "recovery_hint": payload["recovery_hint"],
            "updated_at": iso_now(),
        }
        self.encrypted_vaults[user_id] = stored
        return deepcopy(stored)

    def get_encrypted_vault(self, user_id: str) -> Dict[str, Any]:
        vault = self.encrypted_vaults.get(user_id)
        if vault is None:
            raise ZeroKnowledgeError(404, "Encrypted vault not found")
        return deepcopy(vault)


zero_knowledge_service = ZeroKnowledgeService()