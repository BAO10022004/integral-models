

from utils.expr.expr_node import ExprNode


class FracExprNode(ExprNode):    
    def __init__(self, left=None, right=None, var=None):
        super().__init__(left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, FracExprNode):
            return False

        # so sánh đệ quy
        return (
            self.left._equals(e.left) and
            self.right._equals(e.right)
        )
    def simplify(self):
        return self
    def is_leaf(self):
        return False