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
def detect_root_add_sub(body):
    feats = {}
    # Kiểm tra xem toán tử gốc của biểu thức có phải là phép cộng hoặc trừ không (ví dụ: a + b hoặc a - b)
    feats["root_is_add_or_sub"] = 1 if isinstance(body, (AddExprNode, SubExprNode)) else 0

    # Kiểm tra xem cả hai vế của phép cộng/trừ có phải là các hàm đơn giản hoặc đơn thức không
    # feats["root_add_both_simple"] = 0
    # if feats["root_is_add_or_sub"]:
    #     L, R = body.left, body.right
    #     if L is not None and R is not None:
    #         left_simple = isinstance(L, _FUNC_TYPES) or is_monomial(L)
    #         right_simple = isinstance(R, _FUNC_TYPES) or is_monomial(R)
    #         if left_simple and right_simple:
    #             feats["root_add_both_simple"] = 1

    _NONTRIVIAL_FUNC = (
        SinExprNode, CosExprNode, TanExprNode,
        MonoExprNode, PowerExprNode, SqrtExprNode,
        LogExprNode, ExpExprNode, VarExprNode,
    )
    
    # Kiểm tra xem phép cộng/trừ có một vế là hằng số và vế kia không phải hằng số không (ví dụ: x + 5)
    # feats["root_add_one_side_const"] = 0   
    
    # Kiểm tra xem cả hai vế của phép cộng/trừ đều là các hàm số phức tạp (không phải hằng số) không (ví dụ: sin(x) + x^2)
    # feats["root_add_both_nontrivial"] = 0  
    # if feats["root_is_add_or_sub"]:
    #     L, R = body.left, body.right
    #     if L is not None and R is not None:
    #         L_is_const = isinstance(L, ConstExprNode)
    #         R_is_const = isinstance(R, ConstExprNode)
    #         if (L_is_const and not R_is_const) or (R_is_const and not L_is_const):
    #             feats["root_add_one_side_const"] = 1
    #         L_nontrivial = isinstance(L, _NONTRIVIAL_FUNC) or is_monomial(L)
    #         R_nontrivial = isinstance(R, _NONTRIVIAL_FUNC) or is_monomial(R)
    #         if L_nontrivial and R_nontrivial:
    #             feats["root_add_both_nontrivial"] = 1
    return feats
