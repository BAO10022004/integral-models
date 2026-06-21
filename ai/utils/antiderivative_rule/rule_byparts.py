from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode
from ai.utils.expr.operation.expr_frac import FracExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.value.expr_var import VarExprNode
from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.utils.expr.trig.expr_sin import SinExprNode
from ai.utils.expr.trig.expr_cos import CosExprNode
from ai.utils.expr.trig.expr_tan import TanExprNode
from ai.utils.expr.expr_log import LogExprNode
from ai.utils.expr.expr_exp import ExpExprNode
from ai.utils.expr.Power.expr_power import PowerExprNode
from ai.utils.expr_utils import get_liate_score

def rule_byparts(expr: ExprNode, dee: str):

    u = None
    v_prime = None
    if isinstance(expr, MulExprNode):
        L = expr.left
        R = expr.right
        score_L = get_liate_score(L)
        score_R = get_liate_score(R)
        if score_L <= score_R:
            u = L
            v_prime = R
        else:
            u = R
            v_prime = L   
    elif isinstance(expr, LogExprNode):
        u = expr
        v_prime = ConstExprNode(left=1.0)
    else:
        return None

    from ai.utils.derivative_rule import derivative
    du = derivative(u, dee)
    if hasattr(du, 'simplify'):
        du = du.simplify()[2]

    from ai.utils.antiderivative_rule.rule_linear import apply_basic_rule
    v = apply_basic_rule(v_prime, dee)
    if hasattr(v, 'simplify'):
        v = v.simplify()[2]
    if v is v_prime:
        return None

    v_du = MulExprNode(left=v, right=du, var=dee)
    if hasattr(v_du, 'simplify'):
        v_du = v_du.simplify()[2]

    return u, v, du, v_du
