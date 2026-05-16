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
def _trig_simple_inner(node):
    return isinstance(node, (SinExprNode, CosExprNode)) and not has_non_trivial_inner(node)

def detect_basic_antiderivative(body):
    feats = {}
    # Kiểm tra xem biểu thức chỉ là một biến số đơn thuần (ví dụ: x)
    # feats["is_pure_var"] = 1 if isinstance(body, VarExprNode) else 0
    # Kiểm tra xem biểu thức chỉ là một hằng số (ví dụ: 5, pi)
    # feats["is_pure_const"] = 1 if isinstance(body, ConstExprNode) else 0

    # Kiểm tra xem biểu thức gốc có phải là đơn thức hoặc hàm lũy thừa không (ví dụ: x^2)
    feats["root_is_mono"] = 1 if isinstance(body, (MonoExprNode, PowerExprNode)) else 0

    # Kiểm tra xem biểu thức có phải là hàm lượng giác đơn giản không có hàm hợp bên trong (ví dụ: sin(x) hoặc cos(x))
    feats["is_single_trig_simple"] = 0
    if isinstance(body, (SinExprNode, CosExprNode)) and not has_non_trivial_inner(body):
        feats["is_single_trig_simple"] = 1

    # Kiểm tra xem biểu thức gốc có phải là căn bậc hai không (ví dụ: sqrt(...))
    feats["root_is_sqrt"] = 1 if isinstance(body, SqrtExprNode) else 0
    
    # Kiểm tra xem biểu thức căn bậc hai có đơn giản không (bên trong là biến số hoặc biểu thức bậc nhất ax+b)
    feats["root_is_sqrt_simple"] = 0
    if isinstance(body, SqrtExprNode):
        if not has_non_trivial_inner(body):
            feats["root_is_sqrt_simple"] = 1   
        elif is_linear_expr(body.left):
            feats["root_is_sqrt_simple"] = 1   

    # Kiểm tra xem biểu thức gốc có dạng hằng số chia cho biến số không (ví dụ: c/x)
    feats["root_is_inv_x"] = 0
    if isinstance(body, FracExprNode) and body.left is not None and body.right is not None:
        if isinstance(body.left, ConstExprNode) and isinstance(body.right, VarExprNode):
            feats["root_is_inv_x"] = 1          

    # Kiểm tra xem biểu thức có dạng hằng số nhân với đơn thức/lũy thừa/biến số không (ví dụ: 3*x^2)
    feats["root_const_times_mono"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, (MonoExprNode, PowerExprNode, VarExprNode))) or \
           (isinstance(R, ConstExprNode) and isinstance(L, (MonoExprNode, PowerExprNode, VarExprNode))):
            feats["root_const_times_mono"] = 1

    # Kiểm tra xem biểu thức có dạng hằng số nhân với hàm c/x không (ví dụ: 5 * (1/x))
    feats["root_const_times_inv_x"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        inv_x_R = isinstance(R, FracExprNode) and isinstance(getattr(R, "left", None), ConstExprNode) \
                  and isinstance(getattr(R, "right", None), VarExprNode)
        inv_x_L = isinstance(L, FracExprNode) and isinstance(getattr(L, "left", None), ConstExprNode) \
                  and isinstance(getattr(L, "right", None), VarExprNode)
        if (isinstance(L, ConstExprNode) and inv_x_R) or (isinstance(R, ConstExprNode) and inv_x_L):
            feats["root_const_times_inv_x"] = 1

    # Tổng hợp: Nếu thỏa mãn bất kỳ đặc trưng cơ bản nào ở trên thì tích phân này có thể giải trong 1 bước cơ bản
    feats["one_step_basic"] = 1 if any([
        # feats["is_pure_var"],
        # feats["is_pure_const"],
        feats["root_is_mono"],
        feats["is_single_trig_simple"],
        feats["root_is_sqrt_simple"],
        feats["root_is_inv_x"],
        feats["root_const_times_mono"],
        feats["root_const_times_inv_x"],
    ]) else 0

    return feats
