from utils.expr.expr_mono import MonoExprNode
from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.value.expr_const import ConstExprNode
from utils.expr.value.expr_var import VarExprNode
from utils.integral import Integral


def const_rule(integral: Integral):
    expr = integral.integrand

    print(1)
    if  not isinstance(expr, ConstExprNode):
        return integral
    
    integral.antiderivative = True
    integral.integrand = MulExprNode(
                left= expr,
                right= MonoExprNode(
                    left=expr,
                    right=VarExprNode(left=integral.dee)
                )
            )
    return integral
