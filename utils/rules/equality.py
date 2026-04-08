from utils.expr.expr_mono import MonoExprNode
from utils.expr.operation.expr_add import AddExprNode
from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.operation.expr_sub import SubExprNode
from utils.expr.value.expr_const import ConstExprNode


class EqualityRule:

    @staticmethod
    def apply_rule_1(expr, type):
        if isinstance(expr, MonoExprNode):          
            if isinstance(expr.left, AddExprNode) and expr.right.left ==2:
                R = expr.right
                L = expr.left
                if type is AddExprNode:
                    exp = AddExprNode(
                        left=MonoExprNode(left=L.left, right=R),
                        right=AddExprNode(
                            left=MulExprNode(left=L.left, 
                                             right=MulExprNode(
                                                                left=ConstExprNode(left=2), 
                                                                right=L.right)), 
                            right=MonoExprNode(left=L.right, right=R))
                    )
                return exp