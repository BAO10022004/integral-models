
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
    def __init__(self, model):
        self.model = model
    def solve(self, latex: str) -> dict:
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

    def _solve_integral(self, integral: Integral, steps: list, depth: int) -> float | None:
        from ai.utils.antiderivative_rule.rule_linear import apply_basic_rule
        if depth > MAX_DEPTH:
            steps.append(make_step("error", depth,
                description="Vượt quá độ sâu tối đa — dừng vòng lặp",
                integral_str=integral_str(integral)))
            return None

        int_s = integral_str(integral)
        anti = apply_basic_rule(integral.integrand, integral.dee)
        if anti is not integral.integrand:
            steps.append(make_step("predict", depth,
                action="direct",
                description="Áp dụng công thức cơ bản trực tiếp",
                integral_str=int_s,
                probabilities={"direct": 1.0}))
            return self._apply_direct(integral, steps, depth)

        action, probs = predict_action(self.model, integral.latex)
        steps.append(make_step("predict", depth,
            action=action,
            description=action_desc(action),
            integral_str=int_s,
            probabilities=probs))
        if action == 0:  
            return self._apply_const(integral, steps, depth)

        if action == 1:  
            return self._apply_split(integral, steps, depth)

        if action == 2:  
            return self._apply_special(integral, steps, depth)

        if action == 3:  
            return self._apply_usub(integral, steps, depth)

        if action == 4:   
            return self._apply_byparts(integral, steps, depth)

        steps.append(make_step("error", depth,
            description=f"Action {action} không được hỗ trợ",
            integral_str=int_s))
        return None
    def _clone_integral(self, original: Integral, new_expr: ExprNode) -> Integral:
        body_latex = expr_to_latex(new_expr, original.dee)
        if original.left is None and original.right is None:
            new_latex  = rf"\int {body_latex}d{original.dee}"
        else:
            new_latex  = rf"\int_{{{original.left}}}^{{{original.right}}}{body_latex}d{original.dee}"

        try:
            new_integral = Integral(new_latex)
            if new_integral.integrand is None:
                raise ValueError("parse fail")
        except Exception:
            new_integral = object.__new__(Integral)
            new_integral.latex          = new_latex
            new_integral.integrand      = new_expr
            new_integral.left           = original.left
            new_integral.right          = original.right
            new_integral.dee            = original.dee

        return new_integral
