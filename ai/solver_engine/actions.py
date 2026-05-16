"""
actions.py
----------
Mixin chứa toàn bộ logic xử lý từng action tích phân:

  Action 0 — _apply_direct  : áp dụng công thức trực tiếp
  Action 1 — _apply_const   : rút hằng số ra ngoài   c · ∫ f(x) dx
  Action 2 — _apply_split   : tách tổng / hiệu        ∫ (f±g) = ∫f ± ∫g
  Action 3 — _apply_special : công thức đặc trưng (khai triển, lượng giác…)
  Action 4 — _apply_usub    : đổi biến u = ax + b
  Action 5 — _apply_byparts : tích phân từng phần (IBP)
"""

from ai.utils.integral                      import Integral
from ai.utils.expr.expr_node                import ExprNode
from ai.utils.expr.value.expr_const         import ConstExprNode
from ai.utils.expr.operation.expr_add       import AddExprNode
from ai.utils.expr.operation.expr_sub       import SubExprNode
from ai.utils.expr.operation.expr_mul       import MulExprNode

from ai.utils.antiderivative_rule.rule_linear import apply_basic_rule
from ai.utils.antiderivative_rule.rule_usub   import rule_usub

# pyrefly: ignore [missing-import]
from ai.solver_engine.helpers import (
    expr_str, integral_str, evaluate, make_step,
)


class ActionsMixin:
    """
    Mixin cần được kế thừa cùng với SolverEngine.
    Các phương thức này dùng self._solve_integral và self._clone_integral
    được định nghĩa trong engine.py.
    """

    # ── Action 0 — apply_direct ───────────────────────────────────────────────

    def _apply_direct(self, integral: Integral, steps: list, depth: int) -> float | None:
        """Áp dụng công thức tích phân cơ bản trực tiếp, tính giá trị số."""
        try:
            expr = integral.integrand
            anti = apply_basic_rule(expr, integral.dee)

            if anti is expr:
                steps.append(make_step("error", depth,
                    description=f"Không có rule cho {type(expr).__name__}",
                    integral_str=integral_str(integral)))
                return None

            anti_s = expr_str(anti)
            steps.append(make_step("antiderivative", depth,
                description=f"Nguyên hàm: F(x) = {anti_s}",
                formula=anti_s,
                integral_str=integral_str(integral)))

            # Tính F(upper) − F(lower)
            r = evaluate(anti, integral.right)
            l = evaluate(anti, integral.left)

            if r is None or l is None:
                steps.append(make_step("error", depth,
                    description="Không thể evaluate tại cận (có thể cần biểu tượng số pi,...)",
                    integral_str=integral_str(integral)))
                return None

            result = r - l
            steps.append(make_step("result", depth,
                description=(
                    f"Tính giá trị: F({integral.right}) − F({integral.left})"
                    f" = {round(r,6)} − {round(l,6)} = {round(result,6)}"
                ),
                value=result))
            return result

        except Exception as e:
            steps.append(make_step("error", depth,
                description=f"Lỗi khi tính: {e}",
                integral_str=integral_str(integral)))
            return None

    # ── Action 1 — apply_const ────────────────────────────────────────────────

    def _apply_const(self, integral: Integral, steps: list, depth: int) -> float | None:
        """
        Rút hằng số ra ngoài dấu tích phân:
            ∫ c · f(x) dx  =  c · ∫ f(x) dx
        """
        expr = integral.integrand
        dee  = integral.dee

        if not isinstance(expr, MulExprNode):
            # Không phải dạng nhân → fallback direct
            return self._apply_direct(integral, steps, depth)

        L, R = expr.left, expr.right

        if isinstance(L, ConstExprNode) and not isinstance(R, ConstExprNode):
            const_val, func_expr = L.left, R
        elif isinstance(R, ConstExprNode) and not isinstance(L, ConstExprNode):
            const_val, func_expr = R.left, L
        else:
            # Cả hai vế đều là hằng hoặc không có hằng → fallback direct
            return self._apply_direct(integral, steps, depth)

        func_s = expr_str(func_expr)
        steps.append(make_step("transform", depth,
            description=(
                f"Rút hằng số: ∫ {const_val} · ({func_s}) d{dee}"
                f" = {const_val} · ∫ ({func_s}) d{dee}"
            ),
            formula=f"{const_val} · ∫ ({func_s}) d{dee}"))

        sub_integral = self._clone_integral(integral, func_expr)
        sub_result   = self._solve_integral(sub_integral, steps, depth + 1)
        if sub_result is None:
            return None

        result = const_val * sub_result
        steps.append(make_step("result", depth,
            description=f"Nhân hằng số: {const_val} × {round(sub_result, 6)} = {round(result, 6)}",
            value=result))
        return result

    # ── Action 2 — apply_split ────────────────────────────────────────────────

    def _apply_split(self, integral: Integral, steps: list, depth: int) -> float | None:
        """
        Tách tổng / hiệu thành hai tích phân riêng:
            ∫ (f ± g) dx  =  ∫ f dx  ±  ∫ g dx
        """
        expr = integral.integrand
        dee  = integral.dee

        if not isinstance(expr, (AddExprNode, SubExprNode)):
            # Không phải tổng/hiệu → fallback direct
            return self._apply_direct(integral, steps, depth)

        is_sub = isinstance(expr, SubExprNode)
        op_str = "−" if is_sub else "+"
        L, R   = expr.left, expr.right

        L_s = expr_str(L)
        R_s = expr_str(R)
        steps.append(make_step("transform", depth,
            description=(
                f"Tách tổng: ∫ ({L_s} {op_str} {R_s}) d{dee}"
                f" = ∫({L_s})d{dee} {op_str} ∫({R_s})d{dee}"
            ),
            formula=f"∫({L_s})d{dee} {op_str} ∫({R_s})d{dee}"))

        int_L = self._clone_integral(integral, L)
        int_R = self._clone_integral(integral, R)

        steps.append(make_step("info", depth, description=f"Giải phần trái: ∫ ({L_s}) d{dee}"))
        res_L = self._solve_integral(int_L, steps, depth + 1)

        steps.append(make_step("info", depth, description=f"Giải phần phải: ∫ ({R_s}) d{dee}"))
        res_R = self._solve_integral(int_R, steps, depth + 1)

        if res_L is None or res_R is None:
            return None

        result = res_L - res_R if is_sub else res_L + res_R
        steps.append(make_step("result", depth,
            description=f"Kết hợp: {round(res_L,6)} {op_str} {round(res_R,6)} = {round(result,6)}",
            value=result))
        return result

    # ── Action 3 — apply_special ──────────────────────────────────────────────

    def _apply_special(self, integral: Integral, steps: list, depth: int) -> float | None:
        """
        Công thức đặc trưng / khai triển (sin²+cos²=1, (ax)^n, v.v.).
        Hiện tại fallback về direct; có thể mở rộng sau.
        """
        steps.append(make_step("info", depth,
            description="Áp dụng công thức đặc trưng / khai triển (tự động)",
            integral_str=integral_str(integral)))
        return self._apply_direct(integral, steps, depth)

    # ── Action 4 — apply_usub ─────────────────────────────────────────────────

    def _apply_usub(self, integral: Integral, steps: list, depth: int) -> float | None:
        """Đổi biến u = ax + b."""
        expr = integral.integrand
        dee  = integral.dee

        anti = rule_usub(expr, dee)

        if anti is expr:
            # rule_usub không nhận ra → thử direct
            steps.append(make_step("info", depth,
                description="U-sub không nhận ra dạng — thử áp dụng trực tiếp",
                integral_str=integral_str(integral)))
            return self._apply_direct(integral, steps, depth)

        anti_s = expr_str(anti)
        steps.append(make_step("antiderivative", depth,
            description=f"Đổi biến u = ax+b → Nguyên hàm: F(x) = {anti_s}",
            formula=anti_s,
            integral_str=integral_str(integral)))

        r = evaluate(anti, integral.right)
        l = evaluate(anti, integral.left)

        if r is None or l is None:
            steps.append(make_step("error", depth,
                description="Không evaluate được tại cận sau u-sub",
                integral_str=integral_str(integral)))
            return None

        result = r - l
        steps.append(make_step("result", depth,
            description=(
                f"F({integral.right}) − F({integral.left})"
                f" = {round(r,6)} − {round(l,6)} = {round(result,6)}"
            ),
            value=result))
        return result

    # ── Action 5 — apply_byparts ──────────────────────────────────────────────

    def _apply_byparts(self, integral: Integral, steps: list, depth: int) -> float | None:
        """
        Tích phân từng phần (IBP): ∫ u·v' dx = u·v − ∫ v·u' dx.
        Chưa triển khai đầy đủ — fallback về direct.
        """
        steps.append(make_step("info", depth,
            description=(
                "Phương pháp tích phân từng phần (IBP) — chưa triển khai đầy đủ."
                " Thử áp dụng trực tiếp."
            ),
            integral_str=integral_str(integral)))
        return self._apply_direct(integral, steps, depth)

    # ── Alias tương thích ngược ───────────────────────────────────────────────

    def _apply_linear(self, integral: Integral, steps: list, depth: int) -> float | None:
        """
        Alias tương thích ngược — tự phát hiện dạng và gọi đúng handler:
          • MulExprNode (c*f)  → _apply_const
          • AddExprNode/SubExprNode → _apply_split
          • else → _apply_direct
        """
        expr = integral.integrand
        if isinstance(expr, MulExprNode):
            return self._apply_const(integral, steps, depth)
        if isinstance(expr, (AddExprNode, SubExprNode)):
            return self._apply_split(integral, steps, depth)
        return self._apply_direct(integral, steps, depth)
