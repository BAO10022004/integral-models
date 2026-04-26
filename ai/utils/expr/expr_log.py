from ai.utils.expr.expr_node import ExprNode


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
            return l+r+1
        return l + r
    def simplify(self):
        if self.left is None:
            return self
        left_simplified = self.left.simplify()
        if isinstance(left_simplified, LogExprNode):
            return left_simplified.left
        return LogExprNode(left=left_simplified, var=self.var)