from fastapi import HTTPException

from main import trigger_signup_notification_webhook, verify_admin_request


def test_verify_admin_request_accepts_admin_role_header():
    assert verify_admin_request("Bearer admin-token", "admin") is True


def test_verify_admin_request_rejects_non_admin_role():
    try:
        verify_admin_request("Bearer admin-token", "user")
    except HTTPException as exc:
        assert exc.status_code == 403
    else:
        raise AssertionError("Expected admin role verification to fail")


def test_trigger_signup_notification_webhook_returns_pending_payload():
    result = trigger_signup_notification_webhook({"username": "ops", "email": "ops@example.com"})

    assert result["status"] == "queued"
    assert result["channel"] == "phone"
