from __future__ import annotations

import json

from backend.services.billing import billing_service


def main() -> None:
    result = billing_service.reconcile_all()
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()