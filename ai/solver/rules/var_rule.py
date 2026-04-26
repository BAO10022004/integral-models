from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.value.expr_var import VarExprNode


def var_rule(expr: ExprNode, dee):
    if  not isinstance(expr, ConstExprNode):
        return expr
    return  MulExprNode(
                left= ConstExprNode(left=1/2),
                right= MonoExprNode(
                    left= VarExprNode(left=dee),
                    right=ConstExprNode(
                        left= 2
                    )
                )
            )
