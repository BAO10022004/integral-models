import math

from ai.utils.expr.expr_node            import ExprNode
from ai.utils.expr.value.expr_const     import ConstExprNode
from ai.utils.expr.value.expr_var       import VarExprNode
from ai.utils.expr.operation.expr_mul   import MulExprNode
from ai.utils.expr.operation.expr_add   import AddExprNode
from ai.utils.expr.operation.expr_sub   import SubExprNode
from ai.utils.expr.operation.expr_frac  import FracExprNode
from ai.utils.expr.trig.expr_sin        import SinExprNode
from ai.utils.expr.trig.expr_cos        import CosExprNode
from ai.utils.expr.trig.expr_tan        import TanExprNode
from ai.utils.expr.Power.expr_mono      import MonoExprNode
from ai.utils.expr.Power.expr_sqrt      import SqrtExprNode
from ai.utils.expr.Power.expr_power     import PowerExprNode
from ai.utils.expr.expr_log             import LogExprNode
from ai.utils.expr.expr_exp             import ExpExprNode
from ai.utils.expr_utils                import _extract_a, _scale

def rule_usub(expr: ExprNode, dee: str) -> ExprNode:

    if isinstance(expr, SinExprNode):
        inner = expr.left
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        cos_node = CosExprNode(left=inner, var=dee)
        return _scale(-1.0 / a, cos_node, dee)
    if isinstance(expr, CosExprNode):
        inner = expr.left
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        sin_node = SinExprNode(left=inner, var=dee)
        return _scale(1.0 / a, sin_node, dee)
    if isinstance(expr, TanExprNode):
        inner = expr.left
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        cos_node = CosExprNode(left=inner, var=dee)
        log_node = LogExprNode(left=cos_node, var=dee)
        neg_log  = MulExprNode(left=ConstExprNode(left=-1), right=log_node, var=dee)
        return _scale(1.0 / a, neg_log, dee)
    if isinstance(expr, MonoExprNode):
        inner = expr.left
        if not isinstance(expr.right, ConstExprNode):
            return expr
        n = float(expr.right.left)
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        if n == -1:
            log_node = LogExprNode(left=inner, var=dee)
            return _scale(1.0 / a, log_node, dee)
        new_n = n + 1
        mono  = MonoExprNode(
            left  = inner,
            right = ConstExprNode(left=new_n),
            var   = dee,
        )
        return _scale(1.0 / (a * new_n), mono, dee)

    if isinstance(expr, SqrtExprNode):
        inner = expr.left
        if not isinstance(expr.right, ConstExprNode):
            return expr
        try:
            n = float(expr.right.left)
        except (TypeError, ValueError):
            return expr
        a = _extract_a(inner, dee)
        if a is None or n == 0:
            return expr
        new_power = (n + 1) / n
        coeff     = 1.0 / (a * new_power)
        mono = MonoExprNode(
            left  = inner,
            right = ConstExprNode(left=new_power),
            var   = dee,
        )
        return _scale(coeff, mono, dee)

    if isinstance(expr, ExpExprNode):
        inner = expr.left
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        exp_node = ExpExprNode(left=inner, var=dee)
        return _scale(1.0 / a, exp_node, dee)

    if isinstance(expr, PowerExprNode):
        inner = expr.right
        if not isinstance(expr.left, ConstExprNode):
            return expr
        base = float(expr.left.left)
        if base <= 0 or base == 1:
            return expr
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        if abs(base - math.e) < 1e-9:
            exp_node = ExpExprNode(left=inner, var=dee)
            return _scale(1.0 / a, exp_node, dee)
        coeff = 1.0 / (a * math.log(base))
        return _scale(coeff, expr, dee)
    if isinstance(expr, LogExprNode):
        inner = expr.left
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        log_node   = LogExprNode(left=inner, var=dee)
        u_ln_u     = MulExprNode(left=inner, right=log_node, var=dee)
        u_ln_u_m_u = SubExprNode(left=u_ln_u, right=inner, var=dee)
        return _scale(1.0 / a, u_ln_u_m_u, dee)
    if isinstance(expr, FracExprNode):
        numer = expr.left
        denom = expr.right
        
        # Check u'/u
        from ai.utils.derivative_rule import derivative
        d_denom = derivative(denom, dee)
        if d_denom is not None:
            # Value-based proportionality check
            try:
                ratios = []
                for x_val in ["2.1", "3.2", "4.5"]:
                    n_val = float(numer.calculate(x_val))
                    d_val = float(d_denom.calculate(x_val))
                    if d_val == 0:
                        raise ValueError()
                    ratios.append(n_val / d_val)
                if all(abs(r - ratios[0]) < 1e-6 for r in ratios):
                    k = ratios[0]
                    log_node = LogExprNode(left=denom, var=dee)
                    if abs(k - 1.0) < 1e-6:
                        return log_node
                    else:
                        return _scale(k, log_node, dee)
            except Exception:
                pass

        if isinstance(numer, ConstExprNode) and numer.left == 1:
            a = _extract_a(denom, dee)
            if a is None:
                return expr
            log_node = LogExprNode(left=denom, var=dee)
            return _scale(1.0 / a, log_node, dee)

    return expr  
