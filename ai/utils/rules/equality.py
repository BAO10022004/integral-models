from ast import expr

from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.operation.expr_add import AddExprNode
from ai.utils.expr.operation.expr_frac import FracExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode
from ai.utils.expr.operation.expr_sub import SubExprNode
from ai.utils.expr.value.expr_const import ConstExprNode

class EqualityRule:
    @staticmethod
    def apply(expr: ExprNode):
        if expr.is_leaf():
            return "", expr
        leftNode = expr.left
        rightNode = expr.right
        if leftNode.is_leaf() and rightNode.is_leaf():
            return 
        if rightNode.left == 1:
                return "Số mũ là 1", leftNode
        if rightNode.left == 0:
                return "Số mũ là 0", ConstExprNode(left=1)
        if rightNode.left == -1:
                return "Số mũ là -1 ", FracExprNode(left=ConstExprNode(left=1), right=leftNode)
        if (isinstance(leftNode, SubExprNode) or isinstance(leftNode, AddExprNode)) and isinstance(rightNode, ConstExprNode): 
            if rightNode.left == 2:
                
                if isinstance(leftNode, AddExprNode):
                    return "Áp dụng quy tắc bình phương của một tổng", EqualityRule.apply_level_2_add(leftNode.left, leftNode.right).simplify()
                if isinstance(leftNode, SubExprNode):
                    return "Áp dụng quy tắc bình phương của một hiệu", EqualityRule.apply_level_2_sub(leftNode.left, leftNode.right).simplify()
        if (isinstance(expr, SubExprNode) or isinstance(expr, AddExprNode)) :
            print("=== Áp dụng quy tắc đẳng thức ===")
            if (isinstance(leftNode, MonoExprNode) and isinstance(rightNode, MonoExprNode)) and leftNode.right._equals(rightNode.right):
                if rightNode.right.left == 2:
                    if isinstance(expr, SubExprNode):
                        return "Áp dụng quy tắc Hiệu hai bình phương", EqualityRule.apply_level_2_contrast(leftNode.left, rightNode.left).simplify()
                
                if rightNode.right.left == 3:
                    if isinstance(expr, AddExprNode):
                        return "Áp dụng quy tắc Lập phương của một tổng", EqualityRule.apply_level_3_contrast_add(leftNode.left, rightNode.left).simplify()
        return "" , expr
    @staticmethod
    def apply_level_2_add(left: ExprNode, right: ExprNode):
        exp = AddExprNode(
                        left=MonoExprNode(left=left, right=right),
                        right=AddExprNode(
                            left=MulExprNode(left=left, 
                                             right=MulExprNode(
                                                                left=ConstExprNode(left=2), 
                                                                right=right)), 
                            right=MonoExprNode(left=right, right=right))
                    )
    @staticmethod
    def apply_level_2_sub(left: ExprNode, right: ExprNode):
        return SubExprNode(
                        left=MonoExprNode(left=left, right=right),
                        right=SubExprNode(
                            left=MulExprNode(right= left, 
                                             left=MulExprNode(
                                                                left=ConstExprNode(left=2), 
                                                                right=right)), 
                            right=MonoExprNode(left=right, right=right))
                    )
    @staticmethod
    def apply_level_2_contrast(left: ExprNode, right: ExprNode):
        return MulExprNode(
            left=SubExprNode(
                left=left,
                right=right
            ),
            right= AddExprNode(
                left=left,
                right=right
            )
        )
    @staticmethod
    def apply_level_3_contrast_add(left: ExprNode, right: ExprNode):     
        return MulExprNode(
            left=AddExprNode(
                left=left,
                right=right
            ),
            right= SubExprNode(
                left=MonoExprNode(left= left, right=ConstExprNode(left=2)),
                right=SubExprNode(
                    left=MulExprNode(left=left, right=right),
                    right=MonoExprNode(left=right, right=ConstExprNode(left=2))
                )

            )
        )
    @staticmethod
    def apply_level_3_contrast_sub(left: ExprNode, right: ExprNode):
        if left.is_leaf():
            return left
        if left.left is None and  left.right is None:
            return expr   
        return MulExprNode(
            left=SubExprNode(
                left=left,
                right=      right
            ),
            right= AddExprNode(
                left=MonoExprNode(left= left, right=ConstExprNode(left=2)),
                right=AddExprNode(
                    left=MulExprNode(left=left, right=right),
                    right=MonoExprNode(left=right, right=ConstExprNode(left=2))
                )

            )
        )
    