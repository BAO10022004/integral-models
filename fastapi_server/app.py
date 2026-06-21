import logging
import os
import sys
from dotenv import load_dotenv

# Đảm bảo root project trong sys.path TRƯỚC KHI import bất kỳ thứ gì
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

# Load environmental variables from root .env
load_dotenv(os.path.join(_ROOT, ".env"))


from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse

from fastapi_server.dependencies import load_resources
from fastapi_server.middleware import TimingMiddleware
from fastapi_server.routers import health, info, integrals, chat


# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("integral_api")


# ─── Lifespan (startup / shutdown) ───────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 50)
    logger.info("Integral FastAPI Server")
    logger.info("Loading model & resources...")
    load_resources()
    logger.info("Server is ready to serve requests.")
    logger.info("=" * 50)
    yield
    logger.info("Server shutting down.")


# ─── App Factory ──────────────────────────────────────────────────────────────

def create_app() -> FastAPI:
    app = FastAPI(
        title="Integral Solver API",
        description=(
            "**RESTful API** giải tích phân từng bước sử dụng **GNN model** + **rule-based engine**.\n\n"
            "Hỗ trợ:\n"
            "- Tích phân xác định và bất định\n"
            "- Dự đoán phương pháp giải (action prediction)\n"
            "- Giải từng bước có thuyết minh\n\n"
            "Các biến đổi được hỗ trợ:\n"
            "- Rút hằng số (Constant Multiple Rule)\n"
            "- Tách tổng/hiệu (Sum/Difference Rule)\n"
            "- Công thức đặc trưng / Partial Fractions\n"
            "- Đổi biến u = ax + b (U-Substitution)\n"
            "- Tích phân từng phần (Integration by Parts)\n"
        ),
        version="1.0.0",
        contact={
            "name": "Integral Models Team",
        },
        license_info={
            "name": "MIT",
        },
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        
        openapi_url="/openapi.json",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(TimingMiddleware)
    api_prefix = "/api/v1"
    app.include_router(health.router,    prefix=api_prefix)
    app.include_router(info.router,      prefix=api_prefix)
    app.include_router(integrals.router, prefix=api_prefix)
    app.include_router(chat.router,      prefix=api_prefix)
    @app.get("/", include_in_schema=False)
    async def root():
        return RedirectResponse(url="/docs")
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "error": str(exc),
                "path": str(request.url.path),
            },
        )

    return app
app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "fastapi_server.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[_ROOT],
        log_level="info",
    )

# trigger reload
