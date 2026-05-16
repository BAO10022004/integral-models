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
def _is_poly_like(node):
    if isinstance(node, _POLY_TYPES):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, _POLY_TYPES)) or \
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, _POLY_TYPES)):
            return True
    return False

def _is_trig_like(node):
    if isinstance(node, _TRIG_TYPES):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, _TRIG_TYPES)) or \
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, _TRIG_TYPES)):
            return True
    return False

def _is_exp_like(node):
    if isinstance(node, ExpExprNode):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, ExpExprNode)) or \
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, ExpExprNode)):
            return True
    return False

def _is_log_like(node):
    if isinstance(node, LogExprNode):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, LogExprNode)) or \
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, LogExprNode)):
            return True
    return False

def _check_mul_pattern(node, check_left, check_right):
    if not isinstance(node, MulExprNode):
        return False
    if node.left is None or node.right is None:
        return False
    L, R = node.left, node.right
    return (check_left(L) and check_right(R)) or \
           (check_left(R) and check_right(L))

def _find_ibp_pattern_any(node, check_left, check_right):
    if node is None:
        return False
    if _check_mul_pattern(node, check_left, check_right):
        return True
    r = False
    if hasattr(node, 'left'):
        r = r or _find_ibp_pattern_any(node.left, check_left, check_right)
    if hasattr(node, 'right'):
        r = r or _find_ibp_pattern_any(node.right, check_left, check_right)
    return r

def detect_integration_by_parts(body):
    feats = {}
    feats['ibp_root_poly_times_trig'] = 1 if _check_mul_pattern(
        body, _is_poly_like, _is_trig_like) else 0
    feats['ibp_root_poly_times_exp'] = 1 if _check_mul_pattern(
        body, _is_poly_like, _is_exp_like) else 0
    feats['ibp_root_poly_times_log'] = 1 if _check_mul_pattern(
        body, _is_poly_like, _is_log_like) else 0
    feats['ibp_root_trig_times_exp'] = 1 if _check_mul_pattern(
        body, _is_trig_like, _is_exp_like) else 0

    feats['ibp_any_poly_times_trig'] = 1 if _find_ibp_pattern_any(
        body, _is_poly_like, _is_trig_like) else 0
    feats['ibp_any_poly_times_exp'] = 1 if _find_ibp_pattern_any(
        body, _is_poly_like, _is_exp_like) else 0
    feats['ibp_any_poly_times_log'] = 1 if _find_ibp_pattern_any(
        body, _is_poly_like, _is_log_like) else 0
    feats['ibp_any_trig_times_exp'] = 1 if _find_ibp_pattern_any(
        body, _is_trig_like, _is_exp_like) else 0

    feats['ibp_root_is_log_only'] = 1 if isinstance(body, LogExprNode) else 0

    feats['ibp_candidate'] = 1 if any([
        feats['ibp_root_poly_times_trig'],
        feats['ibp_root_poly_times_exp'],
        feats['ibp_root_poly_times_log'],
        feats['ibp_root_trig_times_exp'],
        feats['ibp_any_poly_times_trig'],
        feats['ibp_any_poly_times_exp'],
        feats['ibp_any_poly_times_log'],
        feats['ibp_any_trig_times_exp'],
        feats['ibp_root_is_log_only'],
    ]) else 0
    return feats
