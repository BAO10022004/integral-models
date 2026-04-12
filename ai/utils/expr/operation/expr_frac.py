
# from utils.expr.operation.expr_mul import MulExprNode
from sympy import Integral
from utils.expr.expr_node import ExprNode
from utils.expr.value.expr_const import ConstExprNode


class FracExprNode(ExprNode):    
    def __init__(self, left=None, right=None, var=None):
        super().__init__(left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, FracExprNode):
            return False
        return (
            self.left._equals(e.left) and
            self.right._equals(e.right)
        )
    

    def simplify(self, message=[], integral=[]):
        if self.left is None or self.right is None:
            return message, integral, self
        if isinstance(self.left, Integral) or isinstance(self.right, Integral):
            return message, integral, self
        message, integral, left_simplified = self.left.simplify(message, integral)
        message, integral, right_simplified = self.right.simplify(message, integral)

        if isinstance(left_simplified, ConstExprNode) and isinstance(right_simplified, ConstExprNode):
            i = ConstExprNode(left=self.caculate())
            message.append(f"Áp dụng quy tắc chia hai hằng số: {left_simplified.left} / {right_simplified.left} = {left_simplified.left / right_simplified.left}")
            integral.append(i)
            return message, integral, i
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 0:
            message.append("Áp dụng quy tắc chia 0 cho một biểu thức")
            i = ConstExprNode(left=0)
            integral.append(i)
            return message, integral, i
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 0:
            message.append("Áp dụng quy tắc chia cho 0")
            i = ConstExprNode(left=float('inf'))
            integral.append(i)
            return message, integral, i
        if left_simplified._equals(right_simplified):
            message.append("Áp dụng quy tắc chia hai biểu thức giống nhau")
            i = ConstExprNode(left=1)
            integral.append(i)
            return message, integral, i
        if right_simplified._equals(ConstExprNode(left=1)):
            message.append("Áp dụng quy tắc chia cho 1")
            i = left_simplified
            integral.append(i)
            return message, integral, i
        from ai.utils.expr.operation.expr_mul import MulExprNode
        if isinstance(left_simplified, MulExprNode) :
            if left_simplified.left._equals(right_simplified):
                 message.append("Áp dụng quy tắc chia hai biểu thức có cùng tử và cùng mẫu")
                 i = left_simplified.right.simplify()
                 integral.append(i)
                 return message, integral, i
            if left_simplified.right._equals(right_simplified):
                message.append("Áp dụng quy tắc chia hai biểu thức có cùng tử và cùng mẫu")
                i = left_simplified.left
                integral.append(i)
                return message, integral, i
            if left_simplified.left._equals(right_simplified.left):
                 message.append("Áp dụng quy tắc chia hai biểu thức có cùng tử và cùng mẫu")
                 i = FracExprNode(left=left_simplified.right.simplify(), right=right_simplified.right.simplify())
                 integral.append(i)
                 return message, integral, i
            if left_simplified.left._equals(right_simplified.right):
                 message.append("Áp dụng quy tắc chia hai biểu thức có cùng tử và cùng mẫu")
                 i = FracExprNode(left=left_simplified.right.simplify(), right=right_simplified.left.simplify())
                 integral.append(i)
                 return message, integral, i
            if left_simplified.right._equals(right_simplified.left):
                 message.append("Áp dụng quy tắc chia hai biểu thức có cùng tử và cùng mẫu")
                 i = FracExprNode(left=left_simplified.left.simplify(), right=right_simplified.right.simplify())
                 integral.append(i)
                 return message, integral, i
            if left_simplified.right._equals(right_simplified.right):
                 message.append("Áp dụng quy tắc chia hai biểu thức có cùng tử và cùng mẫu")
                 i = FracExprNode(left=left_simplified.left.simplify(), right=right_simplified.left.simplify())
                 integral.append(i)
                 return message, integral, i
            message.append("Áp dụng quy tắc chia hai biểu thức có cùng tử và cùng mẫu")
            i = ConstExprNode(left=1)
            integral.append(i)
            return message, integral, i

        i = FracExprNode(left=left_simplified, right=right_simplified)
        message.append(f"Không đơn giản được nữa!")
        integral.append(i)
        return message, integral, FracExprNode(left=left_simplified, right=right_simplified)
    def is_leaf(self):
        return False
    def calculate(self, var_values = None):
        if self.left is None or self.right is None:
            return None
        left_value = self.left.calculate(var_values)
        right_value = self.right.calculate(var_values)
        if left_value is None or right_value is None:
            return None
        return float(left_value) / float(right_value)