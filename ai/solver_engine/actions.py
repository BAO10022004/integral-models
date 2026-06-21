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

    def _apply_direct(self, integral: Integral, steps: list, depth: int) -> float | None:
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

            r = evaluate(anti, integral.right)
            l = evaluate(anti, integral.left)

            if integral.right is None and integral.left is None:
                steps.append(make_step("result", depth,
                    description="Tích phân bất định",
                    formula=anti_s))
                return anti_s

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


    def _apply_const(self, integral: Integral, steps: list, depth: int) -> float | None:
        expr = integral.integrand
        dee  = integral.dee

        if not isinstance(expr, MulExprNode):
            return self._apply_direct(integral, steps, depth)

        L, R = expr.left, expr.right

        if isinstance(L, ConstExprNode) and not isinstance(R, ConstExprNode):
            const_val, func_expr = L.left, R
        elif isinstance(R, ConstExprNode) and not isinstance(L, ConstExprNode):
            const_val, func_expr = R.left, L
        else:
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

        if isinstance(sub_result, str):
            result = f"{const_val} * ({sub_result})"
            steps.append(make_step("result", depth,
                description=f"Nhân hằng số: {result}",
                formula=result))
            return result

        result = const_val * sub_result
        steps.append(make_step("result", depth,
            description=f"Nhân hằng số: {const_val} × {round(float(sub_result), 6)} = {round(float(result), 6)}",
            value=result))
        return result


    def _apply_split(self, integral: Integral, steps: list, depth: int) -> float | None:
        expr = integral.integrand
        dee  = integral.dee

        if not isinstance(expr, (AddExprNode, SubExprNode)):
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

        if isinstance(res_L, str) and isinstance(res_R, str):
            result = f"{res_L} {op_str} {res_R}"
            steps.append(make_step("result", depth,
                description=f"Kết hợp: {result}",
                formula=result))
            return result

        if res_L is None or res_R is None:
            return None

        result = res_L - res_R if is_sub else res_L + res_R
        steps.append(make_step("result", depth,
            description=f"Kết hợp: {round(float(res_L),6)} {op_str} {round(float(res_R),6)} = {round(float(result),6)}",
            value=result))
        return result

    def _apply_special(self, integral: Integral, steps: list, depth: int) -> float | None:
        from ai.utils.rules.rule_special import SpecialFormulaRegistry
        
        expr = integral.integrand
        new_expr, rule_name = SpecialFormulaRegistry.apply_first_match(expr, integral.dee)
        
        if new_expr is not None:
            # Nếu có công thức khớp và áp dụng thành công
            old_s = expr_str(expr)
            new_s = expr_str(new_expr)
            steps.append(make_step("transform", depth,
                description=f"Áp dụng {rule_name}",
                formula=f"{old_s} = {new_s}"))
            
            # Giải tiếp tích phân với biểu thức mới
            sub_integral = self._clone_integral(integral, new_expr)
            return self._solve_integral(sub_integral, steps, depth + 1)
        else:
            steps.append(make_step("info", depth,
                description="Không tìm thấy công thức đặc trưng phù hợp (chưa đăng ký) — tự động thử áp dụng trực tiếp",
                integral_str=integral_str(integral)))
            return self._apply_direct(integral, steps, depth)

    def _apply_usub(self, integral: Integral, steps: list, depth: int) -> float | None:
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
            description=f"Đổi biến u = ax+b → Tìm được nguyên hàm theo x: F(x) = {anti_s}\n(Lưu ý: Vì ta đã thế ngược lại biến x vào F(x) nên không cần đổi cận, vẫn dùng cận gốc)",
            formula=anti_s,
            integral_str=integral_str(integral)))

        if integral.right is None and integral.left is None:
            steps.append(make_step("result", depth,
                description="Tích phân bất định",
                formula=anti_s))
            return anti_s

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

    def _apply_byparts(self, integral: Integral, steps: list, depth: int) -> float | None:
        expr = integral.integrand
        dee  = integral.dee

        from ai.utils.antiderivative_rule.rule_byparts import rule_byparts
        res_byparts = rule_byparts(expr, dee)

        if res_byparts is None:
            # Không phân tích được hoặc v' không có nguyên hàm -> fallback direct
            steps.append(make_step("info", depth,
                description="Không tách được u, dv hoặc không tìm thấy nguyên hàm v — chuyển sang giải trực tiếp",
                integral_str=integral_str(integral)))
            return self._apply_direct(integral, steps, depth)

        u, v, du, v_du = res_byparts
        u_s = expr_str(u)
        v_s = expr_str(v)
        du_s = expr_str(du)
        v_du_s = expr_str(v_du)

        steps.append(make_step("transform", depth,
            description=(
                f"Từng phần: Đặt u = {u_s}, dv = ({expr_str(expr.right if isinstance(expr, MulExprNode) else ConstExprNode(left=1.0))}) d{dee}\n"
                f" suy ra du = ({du_s}) d{dee}, v = {v_s}\n"
                f" ∫ u dv = [{u_s} · {v_s}] - ∫ ({v_du_s}) d{dee}"
            ),
            formula=f"[{u_s} * {v_s}] - ∫ ({v_du_s}) d{dee}"))

        uv_expr = MulExprNode(left=u, right=v, var=dee)
        
        if integral.right is None and integral.left is None:
            sub_integral = self._clone_integral(integral, v_du)
            sub_result   = self._solve_integral(sub_integral, steps, depth + 1)
            if sub_result is None:
                return None
            if isinstance(sub_result, str):
                result = f"{u_s} * {v_s} - ({sub_result})"
                steps.append(make_step("result", depth,
                    description=f"Kết quả từng phần: {result}",
                    formula=result))
                return result
            return None

        val_b = evaluate(uv_expr, integral.right)
        val_a = evaluate(uv_expr, integral.left)

        if val_b is None or val_a is None:
            steps.append(make_step("error", depth,
                description="Không evaluate được thế cận [u * v] tại cận",
                integral_str=integral_str(integral)))
            return None

        uv_bound_val = val_b - val_a
        steps.append(make_step("info", depth,
            description=f"Thế cận: [{u_s} · {v_s}] từ {integral.left} đến {integral.right} = {round(val_b, 6)} - ({round(val_a, 6)}) = {round(uv_bound_val, 6)}"))

        # Giải phần tích phân còn lại: ∫ v du
        sub_integral = self._clone_integral(integral, v_du)
        sub_result   = self._solve_integral(sub_integral, steps, depth + 1)

        if sub_result is None:
            return None
        
        result = uv_bound_val - sub_result
        steps.append(make_step("result", depth,
            description=f"Kết hợp: {round(uv_bound_val, 6)} - {round(float(sub_result), 6)} = {round(float(result), 6)}",
            value=result))
        return result


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
