from utils.expr.expr_node import ExprNode


class LogExprNode(ExprNode):
    def __init__(self, left=None, right=None, var=None):
        super().__init__( left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, LogExprNode):
            return False
        # so sánh đệ quy
        return self.left.equals(e.left)
    def is_leaf(self):
        return False
    def simplify(self):
        if self.left is None:
            return self
        left_simplified = self.left.simplify()
        if isinstance(left_simplified, LogExprNode):
            return left_simplified.left
        return LogExprNode(left=left_simplified, var=self.var)