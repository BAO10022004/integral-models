from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.trig.expr_sin import SinExprNode
from ai.utils.expr.trig.expr_cos import CosExprNode
from ai.utils.expr.trig.expr_tan import TanExprNode
from ai.utils.expr.operation.expr_add import AddExprNode
from ai.utils.expr.operation.expr_sub import SubExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode
from ai.utils.expr.operation.expr_frac import FracExprNode
from ai.utils.expr.value.expr_var import VarExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.utils.expr.expr_log import LogExprNode
from ai.utils.expr.Power.expr_sqrt import SqrtExprNode
from ai.utils.expr.Power.expr_power import PowerExprNode
from ai.utils.expr.expr_exp import ExpExprNode
from ai.model.features.utils import *
def _is_single_func(node):
    return isinstance(node, _FUNC_TYPES)

def _is_const_times_func(node):
    if not isinstance(node, MulExprNode):
        return False
    L, R = node.left, node.right
    if L is None or R is None:
        return False
    return (isinstance(L, ConstExprNode) and _is_single_func(R)) or \
           (isinstance(R, ConstExprNode) and _is_single_func(L))

def _find_const_times_func_any(node):
    if node is None:
        return False
    if _is_const_times_func(node):
        return True
    r = False
    if hasattr(node, "left"):
        r = r or _find_const_times_func_any(node.left)
    if hasattr(node, "right"):
        r = r or _find_const_times_func_any(node.right)
    return r

def detect_const_times_func(body):
    feats = {}
    # Kiểm tra xem biểu thức gốc (root) có phải là phép nhân hay không (ví dụ: a * b)
    feats["root_is_mul"] = 1 if isinstance(body, MulExprNode) else 0
    # Kiểm tra xem biểu thức gốc có dạng hằng số nhân với một hàm số đơn giản không (ví dụ: 5 * sin(x))
    feats["root_const_times_func"] = 1 if _is_const_times_func(body) else 0

    # Kiểm tra xem biểu thức có phải là phép nhân giữa một hằng số và một biến số không (ví dụ: 3 * x)
    feats["is_mul_const_var"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        if (isinstance(body.left, ConstExprNode) and isinstance(body.right, VarExprNode)) or \
           (isinstance(body.right, ConstExprNode) and isinstance(body.left, VarExprNode)):
            feats["is_mul_const_var"] = 1

    # Kiểm tra xem biểu thức có dạng hằng số nhân với hàm lượng giác không (ví dụ: 2 * cos(x))
    feats["root_const_times_trig"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, (SinExprNode, CosExprNode, TanExprNode))) or \
           (isinstance(R, ConstExprNode) and isinstance(L, (SinExprNode, CosExprNode, TanExprNode))):
            feats["root_const_times_trig"] = 1

    # Kiểm tra xem biểu thức có dạng hằng số nhân với căn bậc hai không (ví dụ: 4 * sqrt(x))
    feats["root_const_times_sqrt"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, SqrtExprNode)) or \
           (isinstance(R, ConstExprNode) and isinstance(L, SqrtExprNode)):
            feats["root_const_times_sqrt"] = 1

    # Kiểm tra xem biểu thức có dạng hằng số nhân với phân thức không (ví dụ: 7 * (1/x))
    feats["root_const_times_frac"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, FracExprNode)) or \
           (isinstance(R, ConstExprNode) and isinstance(L, FracExprNode)):
            feats["root_const_times_frac"] = 1

    # Kiểm tra xem có bất kỳ nút con nào trong cây biểu thức có dạng hằng số nhân với hàm số không
    feats["any_const_times_func"] = 1 if _find_const_times_func_any(body) else 0

    # Kiểm tra xem biểu thức có chứa bất kỳ phép nhân nào không
    feats["has_mul"] = 1 if body.has_function(MulExprNode) else 0
    # Đếm tổng số phép nhân xuất hiện trong toàn bộ biểu thức
    feats["count_mul"] = body.cont_function(MulExprNode)
    return feats
