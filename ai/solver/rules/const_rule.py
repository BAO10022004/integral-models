from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.value.expr_var import VarExprNode


def const_rule(expr: ExprNode, dee):
    if  not isinstance(expr, ConstExprNode):
        return expr
    if expr.left == 0:
        return ConstExprNode(left=0)
    if expr.left == 1:
        return VarExprNode(left=dee)
    
    return  MulExprNode(
                left= expr,
                right= VarExprNode(left=dee)
            )
