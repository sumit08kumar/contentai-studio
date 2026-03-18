"""
Backward-compatible shim — the real app now lives at backend/main.py
so Vercel can detect the FastAPI entrypoint.
Both `uvicorn main:app` and `uvicorn app.main:app` will work.
"""

import sys
from pathlib import Path

# Ensure the backend root is on sys.path so `import main` works
_backend_root = str(Path(__file__).resolve().parent.parent)
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)

from main import app  # noqa: E402, F401

