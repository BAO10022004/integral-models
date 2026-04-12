from utils.expr.expr_mono import MonoExprNode
from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.value.expr_const import ConstExprNode
from utils.expr.value.expr_var import VarExprNode
from utils.integral import Integral


def mono_rule(integral: Integral):
    expr = integral.integrand
    if expr.left is None and expr.right is None:
        return integral
    if isinstance(expr, MonoExprNode):
        if expr.left.left == integral.dee and isinstance(expr.right, ConstExprNode):
            integral.antiderivative = True
            power_value = expr.right.left+1
            base = expr.left
            integral.integrand = MulExprNode(
                left= ConstExprNode(left=1/power_value),
                right= MonoExprNode(
                    left=base,
                    right=ConstExprNode(left=power_value)
                )
            )
        return integral
