
from utils.expr.expr_node import ExprNode


class SinExprNode(ExprNode):
    def __init__(self, left, var):
        super().__init__(left=left, var=var)
    def _equals(self, e):
        if not isinstance(e, SinExprNode):
            return False
       
        # so sánh đệ quy
        return self.left._equals(e.left)
    def is_leaf(self):
        return False
    def simplify(self):
        return self
    