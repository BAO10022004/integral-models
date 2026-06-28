import math
from ai.utils.expr.expr_node import ExprNode


class SinExprNode(ExprNode):
    def __init__(self, left, var):
        super().__init__(left=left, var=var)
    def _equals(self, e):
        if not isinstance(e, SinExprNode):
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
        return math.sin(float(left_value))
    def simplify(self,message = [], integral = []):
        if self.left is None:
            return message, integral, self
        message, integral, left_simplified = self.left.simplify(message, integral)
        return message, integral, SinExprNode(left=left_simplified, var=self.var)
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
    def cont_function(self, func_name):
        l =0
        r =0
        if self.left is not None:
            l = self.left.cont_function(func_name) 
        if self.right is not None:
            r = self.right.cont_function(func_name) 
        if isinstance(self, func_name) :
            return l+1
        return l 
    