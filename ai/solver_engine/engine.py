"""
engine.py
---------
Class SolverEngine — vòng lặp chính Model → Rule → Model → ...

Sử dụng ActionsMixin (actions.py) cho các handler từng action,
và các helpers (helpers.py) cho predict, evaluate, stringify.

Action dispatch:
  0 → _apply_direct   : công thức trực tiếp
  1 → _apply_const    : rút hằng số  c·∫f dx
  2 → _apply_split    : tách tổng    ∫(f±g) = ∫f ± ∫g
  3 → _apply_special  : công thức đặc trưng
  4 → _apply_usub     : đổi biến u = ax + b
  5 → _apply_byparts  : tích phân từng phần (IBP)
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/../.."))

from ai.utils.integral import Integral
from ai.utils.expr.expr_node import ExprNode

from ai.utils.antiderivative_rule.expr_to_latex import expr_to_latex

from ai.solver_engine.constants import MAX_DEPTH, action_desc
from ai.solver_engine.helpers   import (
    integral_str, predict_action, make_step,
)
from ai.solver_engine.actions   import ActionsMixin


class SolverEngine(ActionsMixin):
    """
    Giải tích phân qua vòng lặp Model → Rule → Model → ...

    Parameters
    ----------
    model : sklearn estimator — mô hình đã load.
    """

    def __init__(self, model):
        self.model = model

    # ── Public API ────────────────────────────────────────────────────────────

    def solve(self, latex: str) -> dict:
        """
        Giải tích phân từ chuỗi LaTeX.

        Returns
        -------
        dict
            steps   : list[dict]  — danh sách bước giải
            answer  : float|None  — kết quả số (tích phân xác định)
            success : bool
            error   : str|None
        """
        steps = []

        try:
            integral = Integral(latex)
        except Exception as e:
            return {"steps": [], "answer": None, "success": False,
                    "error": f"Không parse được: {e}"}

        if integral.integrand is None:
            return {"steps": [], "answer": None, "success": False,
                    "error": "Parse thành công nhưng integrand là None"}

        answer = self._solve_integral(integral, steps, depth=0)

        return {
            "steps":   steps,
            "answer":  answer,
            "success": answer is not None,
            "error":   None if answer is not None else "Không thể tính được tích phân này",
        }

    # ── Core recursive solver ─────────────────────────────────────────────────

    def _solve_integral(self, integral: Integral, steps: list, depth: int) -> float | None:
        """
        Đệ quy giải một Integral object.
        Trả về giá trị số (float) hoặc None nếu thất bại.
        """
        if depth > MAX_DEPTH:
            steps.append(make_step("error", depth,
                description="Vượt quá độ sâu tối đa — dừng vòng lặp",
                integral_str=integral_str(integral)))
            return None

        int_s  = integral_str(integral)
        action, probs = predict_action(self.model, integral.latex)

        if action == -1:
            steps.append(make_step("fallback", depth,
                action=action,
                description="Không predict được — thử áp dụng công thức trực tiếp",
                integral_str=int_s, probabilities=probs))
            return self._apply_direct(integral, steps, depth)

        steps.append(make_step("predict", depth,
            action=action,
            description=action_desc(action),
            integral_str=int_s,
            probabilities=probs))

        # ── Dispatch theo action ──────────────────────────────────────────────
        if action == 0:
            return self._apply_direct(integral, steps, depth)

        if action == 1:
            return self._apply_const(integral, steps, depth)

        if action == 2:
            return self._apply_split(integral, steps, depth)

        if action == 3:
            return self._apply_special(integral, steps, depth)

        if action == 4:
            return self._apply_usub(integral, steps, depth)

        if action == 5:
            return self._apply_byparts(integral, steps, depth)

        # Unknown action → fallback
        steps.append(make_step("error", depth,
            description=f"Action {action} không được hỗ trợ",
            integral_str=int_s))
        return None

    # ── Utility ───────────────────────────────────────────────────────────────

    def _clone_integral(self, original: Integral, new_expr: ExprNode) -> Integral:
        """Tạo Integral mới cùng cận và dee, nhưng integrand khác."""
        body_latex = expr_to_latex(new_expr, original.dee)
        new_latex  = rf"\int_{{{original.left}}}^{{{original.right}}}{body_latex}d{original.dee}"

        try:
            new_integral = Integral(new_latex)
            if new_integral.integrand is None:
                raise ValueError("parse fail")
        except Exception:
            # Fallback: gán thủ công
            new_integral = object.__new__(Integral)
            new_integral.latex          = new_latex
            new_integral.left           = original.left
            new_integral.right          = original.right
            new_integral.dee            = original.dee
            new_integral.integrand      = new_expr
            new_integral.antiderivative = False

        return new_integral
