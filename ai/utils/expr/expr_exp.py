from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
import math


class ExpExprNode(ExprNode):
    """Node biểu diễn hàm mũ e^{f(x)}.
    
    - left: biểu thức mũ f(x)
    - right: None (không dùng)
    """
    def __init__(self, left=None, right=None, var=None):
        super().__init__(left=left, right=right, var=var)

    def _equals(self, e):
        if not isinstance(e, ExpExprNode):
            return False
        return self.left._equals(e.left)

    def is_leaf(self):
        return False

    def calculate(self, var_values=None):
        if self.left is None:
            return None
        left_value = self.left.calculate(var_values)
        if left_value is None:
            return None
        return math.exp(float(left_value))

    def has_function(self, func_name):
        l = False
        if self.left is not None:
            l = self.left.has_function(func_name)
        if isinstance(self, func_name):
            return True
        return l

    def cont_function(self, func_name):
        l = 0
        if self.left is not None:
            l = self.left.cont_function(func_name)
        if isinstance(self, func_name):
            return l + 1
        return l

    def simplify(self, message=[], integral=[]):
        if self.left is None:
            return message, integral, self
        message, integral, left_simplified = self.left.simplify(message, integral)
        if isinstance(left_simplified, ConstExprNode):
            val = math.exp(float(left_simplified.left))
            message.append(f"Áp dụng e^{left_simplified.left} = {val}")
            return message, integral, ConstExprNode(left=val)
        return message, integral, ExpExprNode(left=left_simplified, var=self.var)
