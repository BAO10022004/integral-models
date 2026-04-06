
from utils.expr.expr_node import ExprNode



class ConstExprNode(ExprNode):
    def __init__(self, left=None, var=None):
        super().__init__(left=left, right=None, var=var)
    def _equals(self, e):
        if not isinstance(e, ConstExprNode):
            return False
        return self.left == e.left
    def simplify(self):
        return self
    def is_leaf(self):
        return True
    def caculate(self, var_values = None):
        return self.left