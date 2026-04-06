

from utils.expr.expr_node import ExprNode


class SubExprNode(ExprNode):
    def __init__(self, left=None, right=None, var=None):
        super().__init__(left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, SubExprNode):
            return False
        if self.kind != e.kind:
            return False
        # so sánh đệ quy
        return (
            self.left.equals(e.left) and
            self.right.equals(e.right)
        )
    # def simplify(self):
    def simplify(self):
            return self
    def is_leaf(self):
        return False