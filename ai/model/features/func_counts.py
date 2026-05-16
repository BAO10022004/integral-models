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
def _collect_func_types(node, result_set=None):
    if node is None:
        return set() if result_set is None else result_set
    if result_set is None:
        result_set = set()

    cat = _FUNC_CATEGORY_MAP.get(type(node))
    if cat is not None:
        result_set.add(cat)

    if hasattr(node, 'left') and node.left is not None:
        _collect_func_types(node.left, result_set)
    if hasattr(node, 'right') and node.right is not None:
        _collect_func_types(node.right, result_set)
    return result_set

def _count_nontrivial_funcs(node):
    if node is None:
        return 0
    c = 0
    if isinstance(node, _NONTRIVIAL_FUNC_TYPES):
        c = 1
    if hasattr(node, 'left') and node.left is not None:
        c += _count_nontrivial_funcs(node.left)
    if hasattr(node, 'right') and node.right is not None:
        c += _count_nontrivial_funcs(node.right)
    return c

def detect_func_counts(body):
    feats = {}
    func_types = _collect_func_types(body)
    feats['count_nontrivial_funcs'] = _count_nontrivial_funcs(body)
    feats['count_distinct_func_types'] = len(func_types)
    feats['has_multi_func_types'] = 1 if len(func_types) >= 2 else 0
    return feats
