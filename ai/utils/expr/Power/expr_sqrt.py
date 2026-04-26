from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.value.expr_const import ConstExprNode

class SqrtExprNode(ExprNode):
    def __init__(self, left=None, right=None, var=None):
        super().__init__(left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, SqrtExprNode):
            return False
        # so sánh đệ quy
        return (
            self.left._equals(e.left) and
            self.right._equals(e.right)
        )
    def is_leaf(self):
        return False
    def calculate(self, var_values=None):
        if self.left is None or self.right is None:
            return None
        
        left_value = self.left.calculate(var_values)
        right_value = self.right.calculate(var_values)
        if left_value is None or right_value is None:
            return None
        return float(left_value) ** float(right_value)
    def has_function(self, func_name:ExprNode):
        l = False
        r = False

        if self.left is not None:
            l = self.left.has_function(func_name)

        if self.right is not None:
            r = self.right.has_function(func_name)
        if isinstance(self, func_name) :
            return  True
        return l or r
    def cont_function(self, func_name):
        l =0
        r =0
        if self.left is not None:
            l = self.left.cont_function(func_name) 
        if self.right is not None:
            r = self.right.cont_function(func_name) 
        if isinstance(self, func_name) :
            return l+r+1
        return l + r

    def simplify(self, message = [], integral = []):
        if self.left is None or self.right is None:
            return message, integral, self
        message, integral, left_simplified = self.left.simplify(message, integral)
        message, integral, right_simplified = self.right.simplify(message, integral)
        if isinstance(left_simplified, ConstExprNode) and isinstance(right_simplified, ConstExprNode):
            mono = left_simplified.left ** right_simplified.left
            message.append(f"Áp dụng quy tắc lũy thừa của một hằng số: {left_simplified.left} ^ {right_simplified.left} = {mono}")
            return message, integral, ConstExprNode(left=mono)
        # nếu một trong hai là hằng số 0, kết quả là 0
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 0:
            message.append("Áp dụng quy tắc nhân với 0")
            return message, integral, ConstExprNode(left=0)
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 0:
            message.append("Áp dụng quy tắc nhân với 0")
            return message, integral, ConstExprNode(left=0)
        return message, integral, SqrtExprNode(left=left_simplified, right=right_simplified)