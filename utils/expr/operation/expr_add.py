from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.expr_node import ExprNode
from utils.expr.value.expr_const import ConstExprNode


class AddExprNode(ExprNode):
    def __init__(self, left=None, right=None, var=None):
        super().__init__( left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, AddExprNode):
            return False
        if self.kind != e.kind:
            return False
        # so sánh đệ quy
        return (
            self.left.equals(e.left) and
            self.right.equals(e.right)
        )
    def is_leaf(self):
        return False
    def simplify(self):
        if self.left is None or self.right is None:
            return self
        left_simplified = self.left.simplify()
        right_simplified = self.right.simplify()

        if isinstance(left_simplified, ConstExprNode) and isinstance(right_simplified, ConstExprNode):
            return self.caculate()
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 0:
            return right_simplified
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 0:
            return left_simplified
        if left_simplified._equals(right_simplified):
            return MulExprNode(right=ConstExprNode(2), left=left_simplified).simplify()

        return AddExprNode(left=left_simplified, right=right_simplified, var=self.var)
            
    def caculate(self, var_values = None):
        if self.left is None or self.right is None:
            return None
        left_value = self.left.caculate(var_values)
        right_value = self.right.caculate(var_values)
        if left_value is None or right_value is None:
            return None
        return left_value + right_value   