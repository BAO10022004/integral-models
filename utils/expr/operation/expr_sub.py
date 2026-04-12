

from sympy import Integral

from utils.expr.expr_node import ExprNode
from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.value.expr_const import ConstExprNode


class SubExprNode(ExprNode):
    def __init__(self, left=None, right=None, var=None):
        super().__init__(left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, SubExprNode):
            return False
        if self.kind != e.kind:
            return False
        # so sánh đệ quy
        return (
            self.left.equals(e.left) and
            self.right.equals(e.right)
        )
    def simplify(self, message = [], integral = []):
        if self.left is None or self.right is None:
            return message, integral, self
        if isinstance(self.left, Integral) or isinstance(self.right, Integral):
            return message, integral, self
        message, integral, left_simplified = self.left.simplify(message, integral)
        message, integral, right_simplified = self.right.simplify(message, integral)
        if isinstance(left_simplified, ConstExprNode) and isinstance(right_simplified, ConstExprNode):
            return message, integral, ConstExprNode(left=left_simplified.left - right_simplified.left)
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 0:
            return message, integral, MulExprNode(left=ConstExprNode(left=-1), right=right_simplified).simplify()
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 0:
            return message, integral,    left_simplified
        if left_simplified._equals(right_simplified):
            return message, integral, ConstExprNode(left=0)
        return message, integral, SubExprNode(left=left_simplified, right=right_simplified, var=self.var)
    def is_leaf(self):
        return False
    def calculate(self, var_values = None):
        if self.left is None or self.right is None:
            return None
        left_value = self.left.calculate(var_values)
        right_value = self.right.calculate(var_values)
        if left_value is None or right_value is None:
            return None
        return float(left_value) - float(right_value)