from sympy import Integral

from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.expr_node import ExprNode
from utils.expr.value.expr_const import ConstExprNode


class AddExprNode(ExprNode):
    def __init__(self, left=None, right=None, var=None):
        super().__init__( left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, AddExprNode):
            return False
            
        return (
            self.left._equals(e.left) and
            self.right._equals(e.right)
        )
    def is_leaf(self):
        return False
    def simplify(self,message = [],integral=[]  ):
        if isinstance(self.left, Integral) or isinstance(self.right, Integral):
            return message, integral, self
        if self.left is None or self.right is None:
            return message, self
        message,integral, left_simplified,  = self.left.simplify(message, integral)
        message,integral, right_simplified,  = self.right.simplify(message, integral)

        if isinstance(left_simplified, ConstExprNode) and isinstance(right_simplified, ConstExprNode):
            message.append("Áp dụng quy tắc cộng hai hằng số")
            integral.append(self.caculate())
            return message,integral, self.caculate()
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 0:
            message.append("Áp dụng quy tắc cộng với 0")
            integral.append(right_simplified)
            return message,integral, right_simplified
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 0:
            message.append("Áp dụng quy tắc cộng với 0")
            integral.append(left_simplified)
            return message,integral, left_simplified
        if left_simplified._equals(right_simplified):
            message.append("Áp dụng quy tắc cộng hai biểu thức giống nhau")
            i = MulExprNode(right=ConstExprNode(2), left=left_simplified).simplify()
            integral.append(i)
            return message,integral, i

        return message,integral, AddExprNode(left=left_simplified, right=right_simplified, var=self.var)

    def calculate(self, var_values = None):
        if self.left is None or self.right is None:
            return None
        left_value = self.left.calculate(var_values)
        right_value = self.right.calculate(var_values)
        if left_value is None or right_value is None:
            return None
        return float(left_value) + float(right_value)   