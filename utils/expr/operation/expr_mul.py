
from utils.expr.operation.expr_frac import FracExprNode
from utils.expr.expr_node import ExprNode
from utils.expr.value.expr_const import ConstExprNode
from utils.expr.expr_mono import MonoExprNode
from utils.expr.value.expr_var import VarExprNode

class MulExprNode(ExprNode):
    def __init__(self, left=None, right=None, var=None):
        super().__init__(left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, MulExprNode):
            return False
        
        # so sánh đệ quy
        return (
            self.left._equals(e.left) and
            self.right._equals(e.right)
        )
    def is_leaf(self):
        return False
    def is_only_contain_leaf(self, var):
        return self.left.is_leaf() and self.right.is_leaf() 
    def simplify(self):

        if self.left is None or self.right is None:
            return self
        left_simplified = self.left.simplify()
        right_simplified = self.right.simplify()
        
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 0:
            return ConstExprNode(left=0)
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 0:
            return ConstExprNode(left=0)
        # nếu một trong hai là hằng số 1, trả về phần còn lại
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 1:
            return right_simplified
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 1:
            return left_simplified
        if isinstance(left_simplified, ConstExprNode) and isinstance(right_simplified, ConstExprNode):
            return ConstExprNode(left=left_simplified.left * right_simplified.left)
        if (isinstance(left_simplified, MonoExprNode) and isinstance(right_simplified, MonoExprNode) and left_simplified.var == right_simplified.var):
            new_left = MulExprNode(left=left_simplified.left, right=right_simplified.left).simplify()
            new_right = MulExprNode(left=left_simplified.right, right=right_simplified.right).simplify()
            return MonoExprNode(left=new_left, right=new_right, var=left_simplified.var)
        if isinstance(right_simplified, FracExprNode) and isinstance(right_simplified.left, ConstExprNode):
            if(isinstance(left_simplified, ConstExprNode)):
                new_left = ConstExprNode(left=left_simplified.left * right_simplified.left.left)
            if(isinstance(left_simplified, VarExprNode)):
                new_left = MonoExprNode(left=left_simplified, right=right_simplified.right.simplify(), var=left_simplified.var)
            return FracExprNode(left=new_left, right=right_simplified.right.simplify())
        return MulExprNode(left=left_simplified, right=right_simplified)