from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status

from fastapi_server.schemas import (
    PredictRequest, PredictResponse,
    SolveRequest,  SolveResponse,
    SolveStep, Probability,
)
from fastapi_server.dependencies import get_model, get_solver
from fastapi_server.action_info import get_action_info, ACTION_INFO

router = APIRouter(prefix="/integrals", tags=["Integrals"])


# ─── Helper ───────────────────────────────────────────────────────────────────

def _build_predict_response(latex: str, pred_action: int, probabilities: dict) -> PredictResponse:
    info = get_action_info(pred_action)
    sorted_probs = sorted(probabilities.items(), key=lambda x: -x[1])
    _, top_confidence = sorted_probs[0] if sorted_probs else (0, 0.0)

    return PredictResponse(
        latex=latex,
        action=int(pred_action),
        action_name=info.get("name", f"action_{pred_action}"),
        action_name_en=info.get("name_en", ""),
        icon=info.get("icon", "🔢"),
        color=info.get("color", "#ffffff"),
        description=info.get("description", ""),
        confidence=round(float(top_confidence), 1),
        steps=info.get("steps", []),
        formulas=info.get("formulas", []),
        probabilities=[
            Probability(
                action=int(a),
                name=ACTION_INFO.get(int(a), {}).get("name", f"action_{a}"),
                probability=round(float(p), 1),
                color=ACTION_INFO.get(int(a), {}).get("color", "#888"),
            )
            for a, p in sorted_probs
        ],
    )


def _format_steps(raw_steps: list) -> list[SolveStep]:
    formatted = []
    for s in raw_steps:
        val = s.get("value")
        if isinstance(val, (int, float)):
            val = round(float(val), 8)
        else:
            val = None

        probs = s.get("probabilities")
        if probs is not None:
            probs = {str(k): float(v) for k, v in probs.items()}

        formatted.append(SolveStep(
            kind=s.get("kind", ""),
            depth=s.get("depth", 0),
            description=s.get("description", ""),
            action=s.get("action"),
            formula=s.get("formula"),
            integral=s.get("integral_str"),
            value=val,
            probabilities=probs,
        ))
    return formatted

@router.post(
    "/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    summary="Dự đoán action tích phân",
    description=(
        "Nhận biểu thức tích phân LaTeX và dự đoán action tốt nhất cần thực hiện "
        "(rút hằng số, tách tổng, đổi biến, ...) kèm xác suất từng action."
    ),
    responses={
        422: {"description": "Không thể parse biểu thức LaTeX"},
        503: {"description": "Model chưa được load"},
    },
)
async def predict_integral(
    body: PredictRequest,
    model=Depends(get_model),
) -> PredictResponse:
    if model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model chưa được load — server khởi động chưa hoàn tất.",
        )

    from ai.solver_engine.helpers import predict_action
    pred, probs_dict = predict_action(model, body.latex.strip())

    if pred == -1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "message": "Không thể parse biểu thức LaTeX",
                "latex": body.latex,
                "hint": r"Hãy kiểm tra cú pháp, ví dụ: \int_{0}^{1} x^2 dx",
            },
        )

    # probs_dict đã là {int_key: float_percent}
    probabilities = {int(k): float(v) for k, v in probs_dict.items()}
    return _build_predict_response(body.latex.strip(), pred, probabilities)


@router.post(
    "/solve",
    response_model=SolveResponse,
    status_code=status.HTTP_200_OK,
    summary="Giải tích phân từng bước",
    description=(
        "Nhận biểu thức tích phân LaTeX và trả về từng bước giải chi tiết cùng kết quả cuối. "
        "Hỗ trợ tích phân xác định (có cận) và bất định (không có cận)."
    ),
    responses={
        422: {"description": "Không thể parse biểu thức LaTeX"},
        503: {"description": "Solver chưa sẵn sàng"},
    },
)
async def solve_integral(
    body: SolveRequest,
    solver=Depends(get_solver),
) -> SolveResponse:
    if solver is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SolverEngine chưa sẵn sàng — model chưa được load.",
        )

    result = solver.solve(body.latex.strip())
    ans: Any = result.get("answer")
    if isinstance(ans, (int, float)):
        ans = round(float(ans), 8)
    elif not isinstance(ans, str):
        ans = None

    return SolveResponse(
        latex=body.latex.strip(),
        steps=_format_steps(result.get("steps", [])),
        answer=ans,
        success=bool(result.get("success")),
        error=result.get("error"),
    )
