"""
solver_engine.py
----------------
Vòng lặp giải tích phân dựa trên mô hình ML:

  1. Parse LaTeX → Integral object
  2. Dự đoán action bằng model
  3. Áp dụng transformation tương ứng
  4. Lặp lại cho đến khi action = 0 (tích phân trực tiếp)
  5. Tính giá trị số và trả về danh sách các bước

Action map (nhãn mới 0-5):
  0 → apply integral    : áp dụng công thức trực tiếp → DỪNG
  1 → linear basic      : rút hằng số ra ngoài c·∫f dx
  2 → split sum         : tách ∫(f±g)dx = ∫f dx ± ∫g dx
  3 → special formula   : khai triển (chưa triển khai đầy đủ → fallback)
  4 → u-substitution    : f(ax+b) → (1/a)·F(ax+b)
  5 → integration by parts (IBP) — chưa triển khai → fallback
"""

import sys
import os
import copy
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/.."))

from ai.utils.integral import Integral
from ai.utils.printer  import Printer

from ai.utils.expr.expr_node            import ExprNode
from ai.utils.expr.value.expr_const     import ConstExprNode
from ai.utils.expr.value.expr_var       import VarExprNode
from ai.utils.expr.operation.expr_add   import AddExprNode
from ai.utils.expr.operation.expr_sub   import SubExprNode
from ai.utils.expr.operation.expr_mul   import MulExprNode
from ai.utils.expr.operation.expr_frac  import FracExprNode
from ai.utils.expr.Power.expr_mono      import MonoExprNode
from ai.utils.expr.Power.expr_sqrt      import SqrtExprNode
from ai.utils.expr.trig.expr_sin        import SinExprNode
from ai.utils.expr.trig.expr_cos        import CosExprNode
from ai.utils.expr.trig.expr_tan        import TanExprNode
from ai.utils.expr.expr_log             import LogExprNode
from ai.utils.expr.expr_exp             import ExpExprNode

from ai.utils.antiderivative_rule.rule_linear import apply_basic_rule
from ai.utils.antiderivative_rule.rule_usub   import rule_usub
from ai.model.feature_extractor               import extract_features

MAX_DEPTH = 12   # giới hạn đệ quy tránh vòng lặp vô hạn


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _expr_str(expr) -> str:
    """Chuyển ExprNode sang chuỗi có thể đọc được."""
    return Printer.expr_to_str(expr)


def _integral_str(integral: Integral) -> str:
    """Hiển thị tích phân dạng ∫[lo→hi] f(x) dx."""
    lo  = integral.left  or "?"
    hi  = integral.right or "?"
    dee = integral.dee   or "x"
    body = _expr_str(integral.integrand)
    return f"∫[{lo}→{hi}] ({body}) d{dee}"


def _predict_action(model, latex: str) -> tuple[int, dict]:
    """
    Dự đoán action cho biểu thức LaTeX.
    Trả về (action_id, probabilities_dict).
    """
    feats = extract_features(latex)
    if feats is None:
        return -1, {}

    X    = pd.DataFrame([feats])
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


def _evaluate(expr: ExprNode, value: str) -> float | None:
    """Tính giá trị của expr tại biến = value (string số)."""
    try:
        return float(expr.calculate(value))
    except Exception:
        return None


def _rebuild_latex(integral: Integral) -> str:
    """
    Cố gắng tạo lại LaTeX từ Integral object để model có thể predict tiếp.
    Dùng định dạng \\int_{lo}^{hi} body d{dee}.
    """
    lo   = integral.left  or "0"
    hi   = integral.right or "1"
    dee  = integral.dee   or "x"
    body = _expr_str(integral.integrand)
    # Đơn giản hoá body cho LaTeX parser nhận
    # (Printer.expr_to_str ra dạng readable, không phải LaTeX thuần)
    # Dùng fallback: ký hiệu đại số thông thường
    return rf"\int_{{{lo}}}^{{{hi}}}{body}d{dee}"


# ─────────────────────────────────────────────────────────────────────────────
# Core solver
# ─────────────────────────────────────────────────────────────────────────────

class SolverEngine:
    """
    Giải tích phân qua vòng lặp Model → Rule → Model → ...

    Parameters
    ----------
    model : sklearn estimator  — mô hình đã load
    """

    def __init__(self, model):
        self.model = model

    def solve(self, latex: str) -> dict:
        """
        Giải tích phân từ chuỗi LaTeX.

        Returns
        -------
        dict:
            steps   : list[dict]  — danh sách bước giải
            answer  : float|None  — kết quả số (nếu là tích phân xác định)
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

    # ── Private ──────────────────────────────────────────────────────────────

    def _solve_integral(self, integral: Integral, steps: list, depth: int) -> float | None:
        """
        Đệ quy giải một Integral object.
        Trả về giá trị số (float) hoặc None.
        """
        if depth > MAX_DEPTH:
            steps.append(self._step("error", depth,
                description="Vượt quá độ sâu tối đa — dừng vòng lặp",
                integral_str=_integral_str(integral)))
            return None

        # Hiện thị trạng thái ban đầu
        int_str = _integral_str(integral)

        # Predict action
        action, probs = _predict_action(self.model, integral.latex)

        if action == -1:
            # Không extract được features — thử trực tiếp
            steps.append(self._step("fallback", depth,
                action=action,
                description="Không predict được — thử áp dụng công thức trực tiếp",
                integral_str=int_str, probabilities=probs))
            return self._apply_direct(integral, steps, depth)

        steps.append(self._step("predict", depth,
            action=action,
            description=self._action_desc(action),
            integral_str=int_str,
            probabilities=probs))

        # ── Action 0: Áp dụng trực tiếp ──────────────────────────────────
        if action == 0:
            return self._apply_direct(integral, steps, depth)

        # ── Action 1: Rút hằng số ra ngoài  c·∫f(x)dx ───────────────────
        if action == 1:
            return self._apply_linear(integral, steps, depth)

        # ── Action 2: Tách tổng/hiệu ─────────────────────────────────────
        if action == 2:
            return self._apply_split(integral, steps, depth)

        # ── Action 3: Công thức đặc trưng (fallback) ─────────────────────
        if action == 3:
            steps.append(self._step("info", depth,
                description="Áp dụng công thức đặc trưng / khai triển (tự động)",
                integral_str=int_str))
            return self._apply_direct(integral, steps, depth)

        # ── Action 4: Đổi biến u = ax+b ──────────────────────────────────
        if action == 4:
            return self._apply_usub(integral, steps, depth)

        # ── Action 5: Tích phân từng phần (IBP) — fallback ───────────────
        if action == 5:
            steps.append(self._step("info", depth,
                description="Phương pháp tích phân từng phần (IBP) — chưa triển khai đầy đủ. Thử áp dụng trực tiếp.",
                integral_str=int_str))
            return self._apply_direct(integral, steps, depth)

        return None

    # ── Action handlers ───────────────────────────────────────────────────────

    def _apply_direct(self, integral: Integral, steps: list, depth: int) -> float | None:
        """Action 0: áp dụng công thức trực tiếp, tính giá trị số."""
        try:
            expr   = integral.integrand
            anti   = apply_basic_rule(expr, integral.dee)

            if anti is expr:
                steps.append(self._step("error", depth,
                    description=f"Không có rule cho {type(expr).__name__}",
                    integral_str=_integral_str(integral)))
                return None

            anti_str = _expr_str(anti)
            steps.append(self._step("antiderivative", depth,
                description=f"Nguyên hàm: F(x) = {anti_str}",
                formula=anti_str,
                integral_str=_integral_str(integral)))

            # Tính F(upper) - F(lower)
            r = _evaluate(anti, integral.right)
            l = _evaluate(anti, integral.left)

            if r is None or l is None:
                steps.append(self._step("error", depth,
                    description="Không thể evaluate tại cận (có thể cần biểu tượng số pi,...)",
                    integral_str=_integral_str(integral)))
                return None

            result = r - l
            steps.append(self._step("result", depth,
                description=f"Tính giá trị: F({integral.right}) − F({integral.left}) = {round(r,6)} − {round(l,6)} = {round(result,6)}",
                value=result))
            return result

        except Exception as e:
            steps.append(self._step("error", depth,
                description=f"Lỗi khi tính: {e}",
                integral_str=_integral_str(integral)))
            return None

    def _apply_linear(self, integral: Integral, steps: list, depth: int) -> float | None:
        """Action 1: rút hằng số ra ngoài — c·∫f(x)dx."""
        expr = integral.integrand
        dee  = integral.dee

        # Tìm dạng c * f(x)
        if isinstance(expr, MulExprNode):
            L, R = expr.left, expr.right

            if isinstance(L, ConstExprNode) and not isinstance(R, ConstExprNode):
                const_val = L.left
                func_expr = R
            elif isinstance(R, ConstExprNode) and not isinstance(L, ConstExprNode):
                const_val = R.left
                func_expr = L
            else:
                # Không nhận ra dạng c·f → thử direct
                return self._apply_direct(integral, steps, depth)
        else:
            return self._apply_direct(integral, steps, depth)

        func_str = _expr_str(func_expr)
        steps.append(self._step("transform", depth,
            description=f"Rút hằng số: ∫ {const_val} · ({func_str}) d{dee} = {const_val} · ∫ ({func_str}) d{dee}",
            formula=f"{const_val} · ∫ ({func_str}) d{dee}"))

        # Tạo integral mới cho ∫ func_expr dx
        sub_integral = self._clone_integral(integral, func_expr)

        sub_result = self._solve_integral(sub_integral, steps, depth + 1)
        if sub_result is None:
            return None

        result = const_val * sub_result
        steps.append(self._step("result", depth,
            description=f"Nhân hằng số: {const_val} × {round(sub_result, 6)} = {round(result, 6)}",
            value=result))
        return result

    def _apply_split(self, integral: Integral, steps: list, depth: int) -> float | None:
        """Action 2: tách ∫(f ± g)dx = ∫f dx ± ∫g dx."""
        expr = integral.integrand
        dee  = integral.dee

        if not isinstance(expr, (AddExprNode, SubExprNode)):
            return self._apply_direct(integral, steps, depth)

        is_sub = isinstance(expr, SubExprNode)
        op_str = "−" if is_sub else "+"
        L, R   = expr.left, expr.right

        L_str = _expr_str(L)
        R_str = _expr_str(R)
        steps.append(self._step("transform", depth,
            description=f"Tách tổng: ∫ ({L_str} {op_str} {R_str}) d{dee} = ∫({L_str})d{dee} {op_str} ∫({R_str})d{dee}",
            formula=f"∫({L_str})d{dee} {op_str} ∫({R_str})d{dee}"))

        # Giải từng phần
        int_L = self._clone_integral(integral, L)
        int_R = self._clone_integral(integral, R)

        steps.append(self._step("info", depth,
            description=f"Giải phần trái: ∫ ({L_str}) d{dee}"))
        res_L = self._solve_integral(int_L, steps, depth + 1)

        steps.append(self._step("info", depth,
            description=f"Giải phần phải: ∫ ({R_str}) d{dee}"))
        res_R = self._solve_integral(int_R, steps, depth + 1)

        if res_L is None or res_R is None:
            return None

        result = res_L - res_R if is_sub else res_L + res_R
        steps.append(self._step("result", depth,
            description=f"Kết hợp: {round(res_L,6)} {op_str} {round(res_R,6)} = {round(result,6)}",
            value=result))
        return result

    def _apply_usub(self, integral: Integral, steps: list, depth: int) -> float | None:
        """Action 4: đổi biến u = ax+b."""
        expr = integral.integrand
        dee  = integral.dee

        anti = rule_usub(expr, dee)

        if anti is expr:
            # rule_usub không nhận ra → thử direct
            steps.append(self._step("info", depth,
                description="U-sub không nhận ra dạng — thử áp dụng trực tiếp",
                integral_str=_integral_str(integral)))
            return self._apply_direct(integral, steps, depth)

        anti_str = _expr_str(anti)
        steps.append(self._step("antiderivative", depth,
            description=f"Đổi biến u = ax+b → Nguyên hàm: F(x) = {anti_str}",
            formula=anti_str,
            integral_str=_integral_str(integral)))

        r = _evaluate(anti, integral.right)
        l = _evaluate(anti, integral.left)

        if r is None or l is None:
            steps.append(self._step("error", depth,
                description="Không evaluate được tại cận sau u-sub",
                integral_str=_integral_str(integral)))
            return None

        result = r - l
        steps.append(self._step("result", depth,
            description=f"F({integral.right}) − F({integral.left}) = {round(r,6)} − {round(l,6)} = {round(result,6)}",
            value=result))
        return result

    # ── Utility ───────────────────────────────────────────────────────────────

    def _clone_integral(self, original: Integral, new_expr: ExprNode) -> Integral:
        """Tạo Integral mới cùng cận, dee nhưng integrand khác."""
        from ai.utils.antiderivative_rule.expr_to_latex import expr_to_latex
        body_latex = expr_to_latex(new_expr, original.dee)
        new_latex = rf"\int_{{{original.left}}}^{{{original.right}}}{body_latex}d{original.dee}"

        try:
            new_integral = Integral(new_latex)
            # Nếu parse lại thất bại, gắn trực tiếp
            if new_integral.integrand is None:
                raise ValueError("parse fail")
        except Exception:
            # Fallback: tạo object và gán thủ công
            new_integral = object.__new__(Integral)
            new_integral.latex        = new_latex
            new_integral.left         = original.left
            new_integral.right        = original.right
            new_integral.dee          = original.dee
            new_integral.integrand    = new_expr
            new_integral.antiderivative = False

        return new_integral

    @staticmethod
    def _step(kind: str, depth: int, **kwargs) -> dict:
        """Tạo một dict mô tả bước giải."""
        return {"kind": kind, "depth": depth, **kwargs}

    @staticmethod
    def _action_desc(action: int) -> str:
        descs = {
            0: "Áp dụng công thức tích phân trực tiếp (Action 0)",
            1: "Rút hằng số ra ngoài dấu tích phân (Action 1)",
            2: "Tách tổng / hiệu thành hai tích phân (Action 2)",
            3: "Áp dụng công thức đặc trưng / khai triển (Action 3)",
            4: "Đổi biến u = ax + b (Action 4)",
            5: "Tích phân từng phần (IBP) (Action 5)",
        }
        return descs.get(action, f"Action {action}")
