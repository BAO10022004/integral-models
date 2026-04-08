from utils.expr.expr_mono import MonoExprNode
from utils.expr.operation.expr_mul import MulExprNode


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