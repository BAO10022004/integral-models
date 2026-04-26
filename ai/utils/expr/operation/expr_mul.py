
from sympy import Integral

from ai.utils.expr.operation.expr_frac import FracExprNode
from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.utils.expr.value.expr_var import VarExprNode

class MulExprNode(ExprNode):
    def __init__(self, left=None, right=None, var=None):
        super().__init__(left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, MulExprNode):
            return False
        
        # so sánh đệ quy
        return (
            self.left._equals(e.left) and
            self.right._equals(e.right)
        )
    def is_leaf(self):
        return False
    def is_only_contain_leaf(self, var):
        return self.left.is_leaf() and self.right.is_leaf() 
    def has_function(self, func_name):
        l = False
        r = False

        if self.left is not None:
            l = self.left.has_function(func_name)

        if self.right is not None:
            r = self.right.has_function(func_name)
        if isinstance(self, func_name) :
            return  True
        return l or r
    def calculate(self, var_values = None):
        if self.left is None or self.right is None:
            return None
        
        left_value = self.left.calculate(var_values)
        right_value = self.right.calculate(var_values)
        if left_value is None or right_value is None:
            return None
        return float(left_value) * float(right_value) 
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
    def simplify(self,message = [], integral = [] ):          
        if self.left is None or self.right is None:
            return message, integral, self
        if isinstance(self.left, Integral) or isinstance(self.right, Integral):
            return message, integral, self
        message, integral, left_simplified = self.left.simplify(message, integral)
        message, integral, right_simplified = self.right.simplify(message, integral)
        if left_simplified._equals(right_simplified):
            message.append("Áp dụng quy tắc nhân hai biểu thức giống nhau")
            message, integral, i = MonoExprNode(left=left_simplified, right=ConstExprNode(left=2), var=left_simplified.var).simplify(message, integral)
            integral.append(i)
            return message, integral, i
        if isinstance(left_simplified, ConstExprNode) and isinstance(right_simplified, ConstExprNode):
            message.append("Áp dụng quy tắc nhân hai hằng số")
            return message, integral, ConstExprNode(left=left_simplified.left * right_simplified.left)
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 0:
            message.append("Áp dụng quy tắc nhân với 0")
            return message, integral, ConstExprNode(left=0)
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 0:
            message.append("Áp dụng quy tắc nhân với 0")
            return message, integral, ConstExprNode(left=0)
        # nếu một trong hai là hằng số 1, trả về phần còn lại
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 1:
            message.append("Áp dụng quy tắc nhân với 1")
            return message, integral, right_simplified
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 1:
            message.append("Áp dụng quy tắc nhân với 1")
            return message, integral, left_simplified

        
        if isinstance(right_simplified, FracExprNode) and isinstance(right_simplified.left, ConstExprNode):
            if(isinstance(left_simplified, ConstExprNode)):  
                new_left = ConstExprNode(left=left_simplified.left * right_simplified.left.left)
            if(isinstance(left_simplified, VarExprNode)):
                new_left = MonoExprNode(left=left_simplified, right=right_simplified.right.simplify(), var=left_simplified.var)
            if right_simplified.right._equals(ConstExprNode(left=1)):
                new_left = left_simplified.simplify()
            message.append("Áp dụng quy tắc nhân một biểu thức với một phân số có tử là hằng số")
            i = FracExprNode(left=new_left, right=right_simplified.right)
            integral.append(i)
            return message, integral, i
        return message, integral, MulExprNode(left=left_simplified, right=right_simplified)