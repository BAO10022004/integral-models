
from fastapi import APIRouter, Depends

from fastapi_server.schemas import HealthResponse
from fastapi_server.dependencies import get_model

router = APIRouter(prefix="/health", tags=["Health"])


@router.get(
    "",
    response_model=HealthResponse,
    summary="Health check",
    description="Kiểm tra trạng thái server và model.",
)
async def health_check(model=Depends(get_model)) -> HealthResponse:
    loaded = model is not None
    return HealthResponse(
        status="ok" if loaded else "degraded",
        model_loaded=loaded,
        model_name=type(model).__name__ if loaded else "none",
        api_version="1.0.0",
    )
