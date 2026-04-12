from utils.expr.expr_node import ExprNode
from utils.expr.expr_mono import MonoExprNode
from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.value.expr_const import ConstExprNode



def mono_rule(expr: ExprNode, dee):
    if expr.left is None and expr.right is None:
        return expr
    if isinstance(expr, MonoExprNode):
        if expr.left.left == dee and isinstance(expr.right, ConstExprNode):
            power_value = expr.right.left+1
            base = expr.left
            return  MulExprNode(
                left= ConstExprNode(left=1/power_value),
                right= MonoExprNode(
                    left=base,
                    right=ConstExprNode(left=power_value)
                )
            )
    return expr
