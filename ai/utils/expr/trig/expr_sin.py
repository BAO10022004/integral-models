from ai.utils.expr.expr_node import ExprNode


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
    