#!/usr/bin/env python
import os
import sys
import argparse

_ROOT = os.path.abspath(os.path.dirname(__file__))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

# Tự động chuyển sang chạy bằng Python trong .venv nếu có và chưa kích hoạt
_VENV_PYTHON = os.path.abspath(os.path.join(_ROOT, ".venv", "Scripts", "python.exe" if os.name == "nt" else "bin/python"))
if os.path.exists(_VENV_PYTHON) and os.path.abspath(sys.executable) != _VENV_PYTHON and "VIRTUAL_ENV" not in os.environ:
    import subprocess
    print(f"[INFO] Tu dong chuyen sang chay bang Python trong .venv...")
    sys.exit(subprocess.call([_VENV_PYTHON] + sys.argv))


def main():
    parser = argparse.ArgumentParser(description="Integral Solver FastAPI Server")
    parser.add_argument("--host", default="0.0.0.0", help="Host (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port (default: 8000)")
    parser.add_argument("--dev",  action="store_true",  help="Bật hot-reload (development)")
    parser.add_argument("--workers", type=int, default=1, help="Số worker (production)")
    args = parser.parse_args()

    import uvicorn

    print("=" * 55)
    print("  Integral Solver FastAPI Server")
    print(f"  Host   : {args.host}:{args.port}")
    print(f"  Mode   : {'development (reload)' if args.dev else 'production'}")
    print(f"  Docs   : http://localhost:{args.port}/docs")
    print(f"  ReDoc  : http://localhost:{args.port}/redoc")
    print("=" * 55)

    uvicorn.run(
        "fastapi_server.app:app",
        host=args.host,
        port=args.port,
        reload=args.dev,
        workers=1 if args.dev else args.workers,
        log_level="info",
    )


if __name__ == "__main__":
    main()
