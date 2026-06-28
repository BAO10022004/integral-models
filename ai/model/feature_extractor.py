import sys
import os
sys.path.append(os.path.abspath("../.."))

from ai.utils.integral import Integral
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
from ai.model.features.add_sub import detect_root_add_sub
from ai.model.features.const_func import detect_const_times_func
from ai.model.features.basic import detect_basic_antiderivative
from ai.model.features.func_counts import detect_func_counts
from ai.model.features.ibp import detect_integration_by_parts
from ai.model.features.usub import detect_u_sub_linear
from ai.model.features.inner_type import detect_inner_type_precise
from ai.model.features.action_signals import detect_action_signals
from ai.model.features.trig import detect_trig_features
from ai.model.features.utils import _has_mono_add_inner, _check_trig_nontrivial, _check_sqrt_nontrivial, is_linear_expr



def extract_features(latex_str):
    """
    Trích xuất toàn bộ features từ một biểu thức tích phân (LaTeX string).
    Trả về dict hoặc None nếu không parse được.
    """
    try:
        parsed = Integral(latex_str)
    except Exception as e:
        # print(f"⚠️ PARSE ERROR: {latex_str[:60]}... → {e}")
        return None
    if parsed is None:
        return None
    body = parsed.integrand
    if body is None:
        return None

    feats = {}

    # ══ A. Root type ══
    feats["root_is_frac"]  = 1 if isinstance(body, FracExprNode) else 0
    feats["root_is_trig"]  = 1 if isinstance(body, (SinExprNode, CosExprNode, TanExprNode)) else 0
    feats["root_is_log"]   = 1 if isinstance(body, LogExprNode) else 0
    feats["root_is_var"]   = 1 if isinstance(body, VarExprNode) else 0
    feats["root_is_const"] = 1 if isinstance(body, ConstExprNode) else 0

    # # ══ B. Has – sự hiện diện ══
    # feats["has_trig"]  = 1 if (body.has_function(SinExprNode) or
    #                             body.has_function(CosExprNode) or
    #                             body.has_function(TanExprNode)) else 0
    # feats["has_sin"]   = 1 if body.has_function(SinExprNode) else 0
    # feats["has_cos"]   = 1 if body.has_function(CosExprNode) else 0
    # feats["has_tan"]   = 1 if body.has_function(TanExprNode) else 0
    # feats["has_sqrt"]  = 1 if body.has_function(SqrtExprNode) else 0
    # feats["has_power"] = 1 if body.has_function(PowerExprNode) else 0
    # feats["has_mono"]  = 1 if body.has_function(MonoExprNode) else 0
    # feats["has_frac"]  = 1 if body.has_function(FracExprNode) else 0
    # feats["has_exp"]   = 1 if body.has_function(ExpExprNode) else 0
    # feats["has_log"]   = 1 if body.has_function(LogExprNode) else 0

    # # ══ C. Count ══
    # feats["count_sin"]   = body.cont_function(SinExprNode)
    # feats["count_cos"]   = body.cont_function(CosExprNode)
    # feats["count_tan"]   = body.cont_function(TanExprNode)
    # feats["count_frac"]  = body.cont_function(FracExprNode)
    # feats["count_sqrt"]  = body.cont_function(SqrtExprNode)
    # feats["count_pow"]   = body.cont_function(PowerExprNode)
    # feats["count_mono"]  = body.cont_function(MonoExprNode)
    # feats["count_log"]   = body.cont_function(LogExprNode)
    # feats["count_exp"]   = body.cont_function(ExpExprNode)
    # feats["count_x"]     = body.cont_function(VarExprNode)
    # feats["count_const"] = body.cont_function(ConstExprNode)

    # # ══ D. Tree structure ══
    # feats["tree_depth"] = get_depth(body)
    # feats["tree_nodes"] = count_nodes(body)

    # ══ NHÓM 1: Root ADD / SUB ══
    feats.update(detect_root_add_sub(body))

    # ══ NHÓM 2: Const * Function ══
    feats.update(detect_const_times_func(body))

    # ══ NHÓM 3: Basic antiderivative 1 bước ══
    feats.update(detect_basic_antiderivative(body))

    # ══ NHÓM 4: Đếm hàm (không tính ADD/SUB) ══
    feats.update(detect_func_counts(body))

    # ══ NHÓM 5: Tích phân từng phần (Integration by Parts) ══
    feats.update(detect_integration_by_parts(body))

    # ══ F. Expand (action 2) ══
    feats["root_mono_with_add_inner"] = 0
    if isinstance(body, (MonoExprNode, PowerExprNode)):
        if body.left is not None and isinstance(body.left, (AddExprNode, SubExprNode)):
            feats["root_mono_with_add_inner"] = 1
    feats["mono_with_add_inner"] = 1 if _has_mono_add_inner(body) else 0

    # ══ G. U-substitution (action 3 / 7) ══
    feats["trig_nontrivial_inner"] = 1 if _check_trig_nontrivial(body) else 0
    feats["sqrt_nontrivial_inner"] = 1 if _check_sqrt_nontrivial(body) else 0

    # ══ NHÓM 6: U-sub u=ax+b (action 7) ══
    feats.update(detect_u_sub_linear(body))

    # ══ NHÓM 7: Phân biệt inner=x (class 0) vs inner=ax+b (class 4) ══
    feats.update(detect_inner_type_precise(body))

    # ══ NHÓM 8: Tín hiệu phân loại action (knowledge-based) ══
    feats.update(detect_action_signals(body))

    # ══ NHÓM 9: Đặc trưng lượng giác nâng cao (trig features) ══
    feats.update(detect_trig_features(body))

    # ══ H. Frac rule (action 4) ══
    feats["frac_linear_over_linear"] = 0
    feats["frac_linear_over_add"]    = 0
    if isinstance(body, FracExprNode) and body.left is not None and body.right is not None:
        if is_linear_expr(body.left):
            if is_linear_expr(body.right):
                feats["frac_linear_over_linear"] = 1
            elif isinstance(body.right, (AddExprNode, SubExprNode)):
                feats["frac_linear_over_add"] = 1

    # ══ I. Simplify / power rule (action 7) ══
    feats["mul_two_mono"] = 0
    if isinstance(body, MulExprNode):
        if isinstance(body.left, (MonoExprNode, PowerExprNode)) and \
           isinstance(body.right, (MonoExprNode, PowerExprNode)):
            feats["mul_two_mono"] = 1

    # ══ K. sqrt (action 9) – đã nằm trong nhóm 3 ══

    # ══ L. Interaction features ══
    # feats["mul_trig_poly"]  = 1 if (feats["has_trig"] and feats["has_mul"] and
    #                                  (feats["has_mono"] or feats["has_power"])) else 0
    # feats["mul_sqrt_other"] = 1 if (feats["has_sqrt"] and feats["has_mul"]) else 0
    # feats["frac_and_trig"]  = 1 if (feats["has_frac"] and feats["has_trig"]) else 0
    # feats["frac_and_sqrt"]  = 1 if (feats["has_frac"] and feats["has_sqrt"]) else 0
    # feats["add_and_frac"]   = 1 if (feats["has_add"] and feats["has_frac"]) else 0
    # feats["add_and_trig"]   = 1 if (feats["has_add"] and feats["has_trig"]) else 0
    # feats["add_and_sqrt"]   = 1 if (feats["has_add"] and feats["has_sqrt"]) else 0
    # feats["trig_and_sqrt"]  = 1 if (feats["has_trig"] and feats["has_sqrt"]) else 0

    # # ══ M. Complexity ══
    # feats["total_ops"] = (feats["count_add"] + feats["count_sub"] +
    #                       feats["count_mul"] + feats["count_frac"] +
    #                       feats["count_pow"] + feats["count_mono"] +
    #                       feats["count_sqrt"])
    # feats["is_simple"] = 1 if feats["total_ops"] <= 1 and feats["tree_depth"] <= 2 else 0

    return feats

