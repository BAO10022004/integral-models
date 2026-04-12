from utils.expr.expr_mono import MonoExprNode
from utils.expr.operation.expr_frac import FracExprNode
from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.value.expr_const import ConstExprNode


class Exponential :
    @staticmethod
    def rule_mul(expr: MonoExprNode):
        if expr.left is None or expr.right is None:
            return None

        if isinstance(expr.left, MulExprNode):
            a = expr.left.left
            b = expr.left.right
            n = expr.right
            return MulExprNode(
                left=MonoExprNode(left=a, right=n),
                right=MonoExprNode(left=b, right=n)
            )
        return expr
    @staticmethod
    def rule_frac(expr: MonoExprNode):
        if expr.left is None or expr.right is None:
            return None
        if isinstance(expr.left, FracExprNode) and isinstance(expr.right, ConstExprNode):
            a = expr.left
            n = expr.right
            return FracExprNode(
                left=MonoExprNode(left=a.left, right=n),
                right=MonoExprNode(left=a.right, right=n)
            )
        return expr