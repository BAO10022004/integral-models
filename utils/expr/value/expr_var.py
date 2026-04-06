from utils.expr.expr_node import ExprNode

class VarExprNode(ExprNode):
    def __init__(self, left=None, var =None):
        super().__init__(left=left, right=None, var=var)
    def _equals(self, e):
        if not isinstance(e, VarExprNode):
            return False
        return self.left == e.left
    def simplify(self):
        return self
    def is_leaf(self):
        return True
    def caculate(self, var_values = None):
        if var_values is None:
            return None
        if self.left not in var_values:
            return None
        return var_values[self.left]