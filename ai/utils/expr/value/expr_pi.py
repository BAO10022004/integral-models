import math
from ai.utils.expr.expr_node import ExprNode


class PiExprNode(ExprNode):
    def __init__(self, var=None):
        super().__init__(left=None, right=None, var=var)
    def _equals(self, e):
        return isinstance(e, PiExprNode)
    def is_leaf(self):
        return True
    def calculate(self, var_values=None):
        return math.pi
    def has_function(self, func_name):
        return False

    def cont_function(self, func_name):
        if isinstance(self, func_name):
            return 1
        return 0
    def simplify(self, message=[], integral=[]):
        return message, integral, self

    def is_function(self):
        return False
    def to_latex(self):
        return r"\pi"
    def __repr__(self):
        return "PiExprNode(π)"
