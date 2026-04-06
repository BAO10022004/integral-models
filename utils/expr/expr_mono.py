from utils.expr.expr_node import ExprNode
from utils.expr.value.expr_const import ConstExprNode

class MonoExprNode(ExprNode):
    def __init__(self, left=None, right=None, var=None):
        super().__init__(left=left, right=right, var=var)
    def _equals(self, e):
        if not isinstance(e, MonoExprNode):
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
        
        # nếu một trong hai là hằng số 0, kết quả là 0
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 0:
            return ConstExprNode(left=0)
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 0:
            return ConstExprNode(left=0)
        # nếu một trong hai là hằng số 1, trả về phần còn lại
        if isinstance(left_simplified, ConstExprNode) and left_simplified.left == 1:
            return right_simplified
        if isinstance(right_simplified, ConstExprNode) and right_simplified.left == 1:
            return left_simplified
        # nếu không thể đơn giản hơn, trả về biểu thức mới với các phần đã được đơn giản hóa
        return MonoExprNode(left=left_simplified, right=right_simplified)