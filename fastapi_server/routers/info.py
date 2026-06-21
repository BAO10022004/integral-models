"""
Router: /api/v1/info  — thông tin API và model.
"""
from typing import Optional
from fastapi import APIRouter, Depends

from fastapi_server.schemas import InfoResponse, ExamplesResponse, ExampleItem
from fastapi_server.dependencies import get_meta
from fastapi_server.action_info import ACTION_INFO

router = APIRouter(prefix="/info", tags=["Info"])

_EXAMPLES = [
    ExampleItem(latex=r"\int x^2 dx",             description="Tích phân đa thức",         type="indefinite"),
    ExampleItem(latex=r"\int_{0}^{1} x^2 dx",     description="Tích phân xác định",         type="definite"),
    ExampleItem(latex=r"\int e^x dx",              description="Tích phân hàm mũ",           type="indefinite"),
    ExampleItem(latex=r"\int \sin(x) dx",          description="Tích phân lượng giác",       type="indefinite"),
    ExampleItem(latex=r"\int \frac{1}{x} dx",      description="Tích phân phân số đơn giản", type="indefinite"),
    ExampleItem(latex=r"\int x e^x dx",            description="Tích phân từng phần",        type="indefinite"),
    ExampleItem(latex=r"\int \frac{x+2}{x^2+1} dx", description="Tích phân phân số bậc 2",  type="indefinite"),
    ExampleItem(latex=r"\int_{0}^{2} x+1 dx",     description="Tích phân tổng xác định",    type="definite"),
    ExampleItem(latex=r"\int 3x^2 + 2x + 1 dx",   description="Tích phân đa thức bậc 2",   type="indefinite"),
    ExampleItem(latex=r"\int \frac{1}{x^2+1} dx",  description="Arctan cơ bản",             type="indefinite"),
]


@router.get(
    "",
    response_model=InfoResponse,
    summary="API Info",
    description="Thông tin về API, model và các action được hỗ trợ.",
)
async def get_info(meta: dict = Depends(get_meta)) -> InfoResponse:
    return InfoResponse(
        api_version="1.0.0",
        model=meta.get("best_model", "unknown"),
        f1_macro=meta.get("f1_macro_test"),
        n_classes=meta.get("n_classes", 5),
        actions=list(ACTION_INFO.keys()),
        description=(
            "Integral Solver API — phân tích và giải tích phân từng bước "
            "sử dụng GNN model + rule-based engine."
        ),
    )


@router.get(
    "/examples",
    response_model=ExamplesResponse,
    summary="Danh sách ví dụ",
    description="Trả về danh sách các ví dụ tích phân để thử nghiệm.",
)
async def get_examples() -> ExamplesResponse:
    return ExamplesResponse(examples=_EXAMPLES)
