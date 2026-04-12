from utils.expr.expr_node import ExprNode
from utils.expr.expr_mono import MonoExprNode
from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.value.expr_const import ConstExprNode
from utils.expr.value.expr_var import VarExprNode


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
