
import math

from utils.expr.operation.expr_frac import FracExprNode
from utils.expr.trig.expr_sin import SinExprNode
from utils.expr.operation.expr_add import AddExprNode
from utils.expr.expr_mono import MonoExprNode
from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.expr_node import ExprNode
from utils.expr.value.expr_var import VarExprNode
from utils.expr.value.expr_const import ConstExprNode
from utils.expr.operation.expr_sub import SubExprNode

class Factor:
    @staticmethod
    def factor_common(left: ExprNode, right: ExprNode, func: ExprNode):
        result = Factor._extract_common(left, right, func)

        if result is None or result[0] is None:
            return  None

        base, coeff_l, coeff_r = result
        if coeff_r is None:
            return MulExprNode(left=coeff_l, right=base)
        return MulExprNode(
            left=base,
            right=func(left=coeff_l, right=coeff_r)
        )
    @staticmethod
    def _find_common_base(node: ExprNode):
        
        if isinstance(node, MulExprNode):
            if isinstance(node.left, ConstExprNode):
                return (node.right, node.left)
            if isinstance(node.right, ConstExprNode):
                return (node.left, node.right)

        if isinstance(node, (FracExprNode, VarExprNode,
                            SubExprNode, AddExprNode,
                            SinExprNode, # TanExprNode, LnExprNode, LogExprNode,
                            MonoExprNode)):
            return (node, ConstExprNode(left =1))
        return None
    
    @staticmethod
    def _extract_common(left: ExprNode, right: ExprNode, func: ExprNode):
        left_result  = Factor._find_common_base(left)
        right_result = Factor._find_common_base(right)

        if left_result is None or right_result is None:
            return (None, None, None)

        base_l, coeff_l = left_result
        base_r, coeff_r = right_result

        if not base_l._equals(base_r):
            return (None, None, None)

        # ── Cộng hệ số nếu cả 2 là const → 2*sin(x) + 3*sin(x) = 5*sin(x) ──
        if isinstance(coeff_l, ConstExprNode) and isinstance(coeff_r, ConstExprNode):
            if isinstance(func, AddExprNode) :
              total = coeff_l.left + coeff_r.left
            else:
              total = coeff_l.left - coeff_r.left  
            return (base_l, ConstExprNode(left=total), None)  # None = không cần AddNode

        # ── Giữ dạng base * (coeff_l + coeff_r) ──
        return (base_l, coeff_l, coeff_r)
