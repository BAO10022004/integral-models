"""
helpers.py
----------
Các hàm tiện ích dùng chung trong solver:
  - _expr_str       : ExprNode → chuỗi đọc được
  - _integral_str   : Integral → chuỗi ∫[lo→hi] f dx
  - _predict_action : model → (action_id, probs)
  - _evaluate       : tính giá trị expr tại một điểm
  - _rebuild_latex  : Integral → chuỗi LaTeX để model predict tiếp
  - make_step       : tạo dict mô tả một bước giải
"""

import pandas as pd

from ai.utils.integral import Integral
from ai.utils.printer  import Printer
from ai.utils.expr.expr_node import ExprNode
from ai.model.feature_extractor import extract_features


# ─────────────────────────────────────────────────────────────────────────────

def expr_str(expr) -> str:
    """Chuyển ExprNode sang chuỗi có thể đọc được."""
    return Printer.expr_to_str(expr)


def integral_str(integral: Integral) -> str:
    """Hiển thị tích phân dạng ∫[lo→hi] f(x) dx."""
    lo   = integral.left  or "?"
    hi   = integral.right or "?"
    dee  = integral.dee   or "x"
    body = expr_str(integral.integrand)
    return f"∫[{lo}→{hi}] ({body}) d{dee}"


def predict_action(model, latex: str) -> tuple[int, dict]:
    """
    Dự đoán action cho biểu thức LaTeX. Hỗ trợ cả mô hình Sklearn và GNN.

    Returns
    -------
    (action_id, probabilities_dict)
        action_id == -1 nếu không phân tích được biểu thức.
    """
    # 1. Hỗ trợ mô hình GNN (Có phương thức predict_with_proba)
    if hasattr(model, "predict_with_proba"):
        pred, probs_array = model.predict_with_proba(latex)
        if pred == -1:
            return -1, {}
        probs = {int(c): round(float(p) * 100, 1) for c, p in enumerate(probs_array)}
        return pred, probs

    # 2. Hỗ trợ mô hình Scikit-Learn cũ
    feats = extract_features(latex)
    if feats is None:
        return -1, {}

    X = pd.DataFrame([feats])

    # Đảm bảo thứ tự cột khớp với lúc train (tránh lỗi check_feature_names)
    if hasattr(model, "feature_names_in_"):
        # Thêm các cột thiếu (= 0) rồi sắp xếp lại
        for col in model.feature_names_in_:
            if col not in X.columns:
                X[col] = 0
        X = X[model.feature_names_in_]

    pred = int(model.predict(X)[0])

    probs = {}
    if hasattr(model, "predict_proba"):
        try:
            proba   = model.predict_proba(X)[0]
            classes = model.classes_ if hasattr(model, "classes_") else range(len(proba))
            probs   = {int(c): round(float(p) * 100, 1) for c, p in zip(classes, proba)}
        except Exception:
            probs = {pred: 100.0}

    return pred, probs


def evaluate(expr: ExprNode, value: str) -> float | None:
    """Tính giá trị của expr tại biến = value (string số)."""
    try:
        return float(expr.calculate(value))
    except Exception:
        return None


def rebuild_latex(integral: Integral) -> str:
    """
    Tạo lại chuỗi LaTeX từ Integral để model có thể predict tiếp.
    Dạng: \\int_{lo}^{hi} body d{dee}
    """
    lo   = integral.left  or "0"
    hi   = integral.right or "1"
    dee  = integral.dee   or "x"
    body = expr_str(integral.integrand)
    return rf"\int_{{{lo}}}^{{{hi}}}{body}d{dee}"


def make_step(kind: str, depth: int, **kwargs) -> dict:
    """Tạo một dict mô tả bước giải để trả về cho frontend."""
    return {"kind": kind, "depth": depth, **kwargs}
