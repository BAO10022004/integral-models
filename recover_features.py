import os

os.makedirs("ai/model/features", exist_ok=True)

base_imports = """from ai.utils.expr.expr_node import ExprNode
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
"""

utils_content = base_imports + """
_FUNC_TYPES = (
    SinExprNode, CosExprNode, TanExprNode,
    SqrtExprNode, LogExprNode, ExpExprNode,
    MonoExprNode, PowerExprNode,
    VarExprNode, ConstExprNode,
    FracExprNode,
)

_NONTRIVIAL_FUNC_TYPES = (
    SinExprNode, CosExprNode, TanExprNode,
    SqrtExprNode, LogExprNode, ExpExprNode,
    MonoExprNode, PowerExprNode,
    FracExprNode, MulExprNode,
)

_FUNC_CATEGORY_MAP = {
    SinExprNode:   'trig',
    CosExprNode:   'trig',
    TanExprNode:   'trig',
    SqrtExprNode:  'sqrt',
    LogExprNode:   'log',
    ExpExprNode:   'exp',
    MonoExprNode:  'poly',
    PowerExprNode: 'poly',
    FracExprNode:  'frac',
    MulExprNode:   'mul',
    VarExprNode:   'poly',
}

_POLY_TYPES = (VarExprNode, MonoExprNode, PowerExprNode)
_TRIG_TYPES = (SinExprNode, CosExprNode, TanExprNode)

def is_pure_var_or_const(node):
    return isinstance(node, (VarExprNode, ConstExprNode))

def is_linear_expr(node):
    if isinstance(node, (VarExprNode, ConstExprNode)):
        return True
    if isinstance(node, MulExprNode):
        if isinstance(node.left, ConstExprNode) and isinstance(node.right, VarExprNode):
            return True
        if isinstance(node.right, ConstExprNode) and isinstance(node.left, VarExprNode):
            return True
    if isinstance(node, (AddExprNode, SubExprNode)):
        return is_linear_expr(node.left) and is_linear_expr(node.right)
    return False

def is_monomial(node):
    if isinstance(node, (MonoExprNode, PowerExprNode)):
        return True
    if isinstance(node, MulExprNode):
        if isinstance(node.left, ConstExprNode) and isinstance(
            node.right, (MonoExprNode, PowerExprNode, VarExprNode)
        ):
            return True
        if isinstance(node.right, ConstExprNode) and isinstance(
            node.left, (MonoExprNode, PowerExprNode, VarExprNode)
        ):
            return True
    return False

def has_non_trivial_inner(node):
    inner = node.left
    if inner is None:
        return False
    return not isinstance(inner, VarExprNode)

def count_nodes(node):
    if node is None:
        return 0
    c = 1
    if hasattr(node, "left") and node.left is not None:
        c += count_nodes(node.left)
    if hasattr(node, "right") and node.right is not None:
        c += count_nodes(node.right)
    return c

def get_depth(node, d=0):
    if node is None:
        return d
    dl = dr = d
    if hasattr(node, "left") and node.left is not None:
        dl = get_depth(node.left, d + 1)
    if hasattr(node, "right") and node.right is not None:
        dr = get_depth(node.right, d + 1)
    return max(dl, dr)

def _has_mono_add_inner(node):
    if node is None:
        return False
    if isinstance(node, (MonoExprNode, PowerExprNode)):
        if node.left is not None and isinstance(node.left, (AddExprNode, SubExprNode)):
            return True
    r = False
    if hasattr(node, "left"):
        r = r or _has_mono_add_inner(node.left)
    if hasattr(node, "right"):
        r = r or _has_mono_add_inner(node.right)
    return r

def _check_trig_nontrivial(node):
    if node is None:
        return False
    if isinstance(node, (SinExprNode, CosExprNode, TanExprNode)):
        if has_non_trivial_inner(node):
            return True
    r = False
    if hasattr(node, "left"):
        r = r or _check_trig_nontrivial(node.left)
    if hasattr(node, "right"):
        r = r or _check_trig_nontrivial(node.right)
    return r

def _check_sqrt_nontrivial(node):
    if node is None:
        return False
    if isinstance(node, SqrtExprNode):
        if has_non_trivial_inner(node):
            return True
    r = False
    if hasattr(node, "left"):
        r = r or _check_sqrt_nontrivial(node.left)
    if hasattr(node, "right"):
        r = r or _check_sqrt_nontrivial(node.right)
    return r

def _is_ax_plus_b(node):
    if isinstance(node, MulExprNode):
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, VarExprNode)) or \\
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, VarExprNode)):
            return True
    if isinstance(node, (AddExprNode, SubExprNode)):
        if isinstance(node.left, VarExprNode) and isinstance(node.right, ConstExprNode):
            return True
        if isinstance(node.right, VarExprNode) and isinstance(node.left, ConstExprNode):
            return True
        if isinstance(node.left, MulExprNode) and isinstance(node.right, ConstExprNode):
            L = node.left
            if (isinstance(L.left, ConstExprNode) and isinstance(L.right, VarExprNode)) or \\
               (isinstance(L.right, ConstExprNode) and isinstance(L.left, VarExprNode)):
                return True
    return False

def _is_nonlinear_inner(node):
    if isinstance(node, (MonoExprNode, PowerExprNode)):
        return True
    return False

def _is_pure_x(node):
    return isinstance(node, VarExprNode)

def _inner_has_offset(node):
    if isinstance(node, (AddExprNode, SubExprNode)):
        L, R = node.left, node.right
        if isinstance(L, VarExprNode) and isinstance(R, ConstExprNode):
            return True
        if isinstance(R, VarExprNode) and isinstance(L, ConstExprNode):
            return True
        if isinstance(L, MulExprNode) and isinstance(R, ConstExprNode):
            LL, LR = L.left, L.right
            if (isinstance(LL, ConstExprNode) and isinstance(LR, VarExprNode)) or \\
               (isinstance(LR, ConstExprNode) and isinstance(LL, VarExprNode)):
                return True
    return False

def _inner_has_coeff_only(node):
    if isinstance(node, MulExprNode):
        L, R = node.left, node.right
        if isinstance(L, ConstExprNode) and isinstance(R, VarExprNode):
            return True
        if isinstance(R, ConstExprNode) and isinstance(L, VarExprNode):
            return True
    return False

def _is_polynomial_sum(node):
    if node is None:
        return False
    if isinstance(node, (VarExprNode, ConstExprNode)):
        return True
    if isinstance(node, (MonoExprNode, PowerExprNode)):
        inner = getattr(node, 'left', None)
        return inner is None or isinstance(inner, VarExprNode)
    if isinstance(node, MulExprNode):
        L, R = node.left, node.right
        if L is None or R is None:
            return False
        return _is_polynomial_sum(L) and _is_polynomial_sum(R)
    if isinstance(node, (AddExprNode, SubExprNode)):
        L, R = node.left, node.right
        if L is None or R is None:
            return False
        return _is_polynomial_sum(L) and _is_polynomial_sum(R)
    return False

def _get_poly_degree(node):
    if node is None:
        return 0
    if isinstance(node, ConstExprNode):
        return 0
    if isinstance(node, VarExprNode):
        return 1
    if isinstance(node, (MonoExprNode, PowerExprNode)):
        exp_node = getattr(node, 'right', None)
        if exp_node is not None and isinstance(exp_node, ConstExprNode):
            try:
                return int(exp_node.left)
            except Exception:
                return 2
        return 2
    if isinstance(node, (AddExprNode, SubExprNode)):
        dl = _get_poly_degree(node.left)
        dr = _get_poly_degree(node.right)
        return max(dl, dr)
    if isinstance(node, MulExprNode):
        dl = _get_poly_degree(node.left)
        dr = _get_poly_degree(node.right)
        return dl + dr
    return -1

def _func_category(node):
    if isinstance(node, (SinExprNode, CosExprNode, TanExprNode)):
        return 'trig'
    if isinstance(node, SqrtExprNode):
        return 'sqrt'
    if isinstance(node, ExpExprNode):
        return 'exp'
    if isinstance(node, LogExprNode):
        return 'log'
    if isinstance(node, FracExprNode):
        return 'frac'
    if isinstance(node, ConstExprNode):
        return 'const'
    if isinstance(node, VarExprNode):
        return 'var'
    if isinstance(node, (MonoExprNode, PowerExprNode)):
        return 'poly'
    if isinstance(node, MulExprNode):
        return 'mul'
    return 'unknown'

def _is_const_node(node):
    return isinstance(node, ConstExprNode)

def _could_be_derivative(f_node, g_node):
    if f_node is None or g_node is None:
        return False
    deg_f = _get_poly_degree(f_node)
    deg_g = _get_poly_degree(g_node)
    if deg_f >= 0 and deg_g >= 1 and deg_f == deg_g - 1:
        return True
    f_cat = _func_category(f_node)
    g_cat = _func_category(g_node)
    if f_cat == 'trig' and g_cat in ('trig', 'exp', 'log'):
        return True
    return False
"""

add_sub_content = base_imports + "from ai.model.features.utils import *\\n\\n" + """
def detect_root_add_sub(body):
    feats = {}
    feats["root_is_add"] = 1 if isinstance(body, AddExprNode) else 0
    feats["root_is_sub"] = 1 if isinstance(body, SubExprNode) else 0
    feats["root_is_add_or_sub"] = 1 if isinstance(body, (AddExprNode, SubExprNode)) else 0

    feats["root_add_both_simple"] = 0
    if feats["root_is_add_or_sub"]:
        L, R = body.left, body.right
        if L is not None and R is not None:
            left_simple = isinstance(L, _FUNC_TYPES) or is_monomial(L)
            right_simple = isinstance(R, _FUNC_TYPES) or is_monomial(R)
            if left_simple and right_simple:
                feats["root_add_both_simple"] = 1

    _NONTRIVIAL_FUNC = (
        SinExprNode, CosExprNode, TanExprNode,
        MonoExprNode, PowerExprNode, SqrtExprNode,
        LogExprNode, ExpExprNode, VarExprNode,
    )
    feats["root_add_one_side_const"] = 0   
    feats["root_add_both_nontrivial"] = 0  
    if feats["root_is_add_or_sub"]:
        L, R = body.left, body.right
        if L is not None and R is not None:
            L_is_const = isinstance(L, ConstExprNode)
            R_is_const = isinstance(R, ConstExprNode)
            if (L_is_const and not R_is_const) or (R_is_const and not L_is_const):
                feats["root_add_one_side_const"] = 1
            L_nontrivial = isinstance(L, _NONTRIVIAL_FUNC) or is_monomial(L)
            R_nontrivial = isinstance(R, _NONTRIVIAL_FUNC) or is_monomial(R)
            if L_nontrivial and R_nontrivial:
                feats["root_add_both_nontrivial"] = 1

    feats["has_add"] = 1 if body.has_function(AddExprNode) else 0
    feats["has_sub"] = 1 if body.has_function(SubExprNode) else 0
    feats["count_add"] = body.cont_function(AddExprNode)
    feats["count_sub"] = body.cont_function(SubExprNode)
    feats["count_terms"] = feats["count_add"] + feats["count_sub"] + 1
    return feats
"""

const_func_content = base_imports + "from ai.model.features.utils import *\\n\\n" + """
def _is_single_func(node):
    return isinstance(node, _FUNC_TYPES)

def _is_const_times_func(node):
    if not isinstance(node, MulExprNode):
        return False
    L, R = node.left, node.right
    if L is None or R is None:
        return False
    return (isinstance(L, ConstExprNode) and _is_single_func(R)) or \\
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
    feats["root_is_mul"] = 1 if isinstance(body, MulExprNode) else 0
    feats["root_const_times_func"] = 1 if _is_const_times_func(body) else 0

    feats["is_mul_const_var"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        if (isinstance(body.left, ConstExprNode) and isinstance(body.right, VarExprNode)) or \\
           (isinstance(body.right, ConstExprNode) and isinstance(body.left, VarExprNode)):
            feats["is_mul_const_var"] = 1

    feats["root_const_times_trig"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, (SinExprNode, CosExprNode, TanExprNode))) or \\
           (isinstance(R, ConstExprNode) and isinstance(L, (SinExprNode, CosExprNode, TanExprNode))):
            feats["root_const_times_trig"] = 1

    feats["root_const_times_sqrt"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, SqrtExprNode)) or \\
           (isinstance(R, ConstExprNode) and isinstance(L, SqrtExprNode)):
            feats["root_const_times_sqrt"] = 1

    feats["root_const_times_frac"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, FracExprNode)) or \\
           (isinstance(R, ConstExprNode) and isinstance(L, FracExprNode)):
            feats["root_const_times_frac"] = 1

    feats["any_const_times_func"] = 1 if _find_const_times_func_any(body) else 0

    feats["has_mul"] = 1 if body.has_function(MulExprNode) else 0
    feats["count_mul"] = body.cont_function(MulExprNode)
    return feats
"""

basic_content = base_imports + "from ai.model.features.utils import *\\n\\n" + """
def _trig_simple_inner(node):
    return isinstance(node, (SinExprNode, CosExprNode)) and not has_non_trivial_inner(node)

def detect_basic_antiderivative(body):
    feats = {}
    feats["is_pure_var"] = 1 if isinstance(body, VarExprNode) else 0
    feats["is_pure_const"] = 1 if isinstance(body, ConstExprNode) else 0

    feats["root_is_mono"] = 1 if isinstance(body, (MonoExprNode, PowerExprNode)) else 0

    feats["is_single_trig_simple"] = 0
    if isinstance(body, (SinExprNode, CosExprNode)) and not has_non_trivial_inner(body):
        feats["is_single_trig_simple"] = 1

    feats["root_is_sqrt"] = 1 if isinstance(body, SqrtExprNode) else 0
    feats["root_is_sqrt_simple"] = 0
    if isinstance(body, SqrtExprNode):
        if not has_non_trivial_inner(body):
            feats["root_is_sqrt_simple"] = 1   
        elif is_linear_expr(body.left):
            feats["root_is_sqrt_simple"] = 1   

    feats["root_is_inv_x"] = 0
    if isinstance(body, FracExprNode) and body.left is not None and body.right is not None:
        if isinstance(body.left, ConstExprNode) and isinstance(body.right, VarExprNode):
            feats["root_is_inv_x"] = 1          

    feats["root_const_times_mono"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, (MonoExprNode, PowerExprNode, VarExprNode))) or \\
           (isinstance(R, ConstExprNode) and isinstance(L, (MonoExprNode, PowerExprNode, VarExprNode))):
            feats["root_const_times_mono"] = 1

    feats["root_const_times_inv_x"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        inv_x_R = isinstance(R, FracExprNode) and isinstance(getattr(R, "left", None), ConstExprNode) \\
                  and isinstance(getattr(R, "right", None), VarExprNode)
        inv_x_L = isinstance(L, FracExprNode) and isinstance(getattr(L, "left", None), ConstExprNode) \\
                  and isinstance(getattr(L, "right", None), VarExprNode)
        if (isinstance(L, ConstExprNode) and inv_x_R) or (isinstance(R, ConstExprNode) and inv_x_L):
            feats["root_const_times_inv_x"] = 1

    feats["one_step_basic"] = 1 if any([
        feats["is_pure_var"],
        feats["is_pure_const"],
        feats["root_is_mono"],
        feats["is_single_trig_simple"],
        feats["root_is_sqrt_simple"],
        feats["root_is_inv_x"],
        feats["root_const_times_mono"],
        feats["root_const_times_inv_x"],
    ]) else 0

    return feats
"""

func_counts_content = base_imports + "from ai.model.features.utils import *\\n\\n" + """
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
"""

ibp_content = base_imports + "from ai.model.features.utils import *\\n\\n" + """
def _is_poly_like(node):
    if isinstance(node, _POLY_TYPES):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, _POLY_TYPES)) or \\
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, _POLY_TYPES)):
            return True
    return False

def _is_trig_like(node):
    if isinstance(node, _TRIG_TYPES):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, _TRIG_TYPES)) or \\
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, _TRIG_TYPES)):
            return True
    return False

def _is_exp_like(node):
    if isinstance(node, ExpExprNode):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, ExpExprNode)) or \\
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, ExpExprNode)):
            return True
    return False

def _is_log_like(node):
    if isinstance(node, LogExprNode):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, LogExprNode)) or \\
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, LogExprNode)):
            return True
    return False

def _check_mul_pattern(node, check_left, check_right):
    if not isinstance(node, MulExprNode):
        return False
    if node.left is None or node.right is None:
        return False
    L, R = node.left, node.right
    return (check_left(L) and check_right(R)) or \\
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
"""

usub_content = base_imports + "from ai.model.features.utils import *\\n\\n" + """
def detect_u_sub_linear(body):
    feats = {}
    feats['usub_root_trig_linear'] = 0
    if isinstance(body, (SinExprNode, CosExprNode, TanExprNode)):
        inner = getattr(body, 'left', None)
        if inner is not None and _is_ax_plus_b(inner):
            feats['usub_root_trig_linear'] = 1

    feats['usub_root_sqrt_linear'] = 0
    if isinstance(body, SqrtExprNode):
        inner = getattr(body, 'left', None)
        if inner is not None and _is_ax_plus_b(inner):
            feats['usub_root_sqrt_linear'] = 1

    feats['usub_root_power_linear'] = 0
    if isinstance(body, (MonoExprNode, PowerExprNode)):
        inner = getattr(body, 'left', None)
        if inner is not None and _is_ax_plus_b(inner):
            feats['usub_root_power_linear'] = 1

    feats['usub_root_log_linear'] = 0
    if isinstance(body, LogExprNode):
        inner = getattr(body, 'left', None)
        if inner is not None and _is_ax_plus_b(inner):
            feats['usub_root_log_linear'] = 1

    def _scan(node, lin_found, nonlin_found):
        if node is None:
            return lin_found, nonlin_found
        if isinstance(node, (SinExprNode, CosExprNode, TanExprNode, SqrtExprNode, LogExprNode)):
            inner = getattr(node, 'left', None)
            if inner is not None:
                if _is_ax_plus_b(inner):
                    lin_found = True
                elif _is_nonlinear_inner(inner):
                    nonlin_found = True
        if hasattr(node, 'left') and node.left is not None:
            lin_found, nonlin_found = _scan(node.left, lin_found, nonlin_found)
        if hasattr(node, 'right') and node.right is not None:
            lin_found, nonlin_found = _scan(node.right, lin_found, nonlin_found)
        return lin_found, nonlin_found

    lin, nonlin = _scan(body, False, False)
    feats['usub_inner_is_linear']    = 1 if lin else 0
    feats['usub_inner_is_nonlinear'] = 1 if nonlin else 0

    root_is_add_sub = isinstance(body, (AddExprNode, SubExprNode))
    any_linear_root = any([
        feats['usub_root_trig_linear'],
        feats['usub_root_sqrt_linear'],
        feats['usub_root_power_linear'],
        feats['usub_root_log_linear'],
    ])
    feats['usub_linear_candidate']   = 1 if (lin and not nonlin) else 0
    feats['usub_is_pure_linear_form'] = 1 if (not root_is_add_sub and any_linear_root) else 0

    return feats
"""

inner_type_content = base_imports + "from ai.model.features.utils import *\\n\\n" + """
def detect_inner_type_precise(body):
    feats = {}

    feats['trig_inner_pure_x']    = 0
    feats['trig_inner_ax_plus_b'] = 0
    feats['trig_inner_offset']    = 0
    feats['trig_inner_coeff']     = 0
    if isinstance(body, (SinExprNode, CosExprNode, TanExprNode)):
        inner = getattr(body, 'left', None)
        if inner is not None:
            if _is_pure_x(inner):
                feats['trig_inner_pure_x'] = 1
            elif _inner_has_offset(inner):
                feats['trig_inner_ax_plus_b'] = 1
                feats['trig_inner_offset']    = 1
            elif _inner_has_coeff_only(inner):
                feats['trig_inner_ax_plus_b'] = 1
                feats['trig_inner_coeff']     = 1

    feats['mono_inner_pure_x']    = 0
    feats['mono_inner_ax_plus_b'] = 0
    feats['mono_inner_offset']    = 0
    if isinstance(body, (MonoExprNode, PowerExprNode)):
        inner = getattr(body, 'left', None)
        if inner is not None:
            if _is_pure_x(inner):
                feats['mono_inner_pure_x'] = 1
            elif _inner_has_offset(inner):
                feats['mono_inner_ax_plus_b'] = 1
                feats['mono_inner_offset']    = 1
            elif _inner_has_coeff_only(inner):
                feats['mono_inner_ax_plus_b'] = 1

    feats['sqrt_inner_pure_x']    = 0
    feats['sqrt_inner_ax_plus_b'] = 0
    if isinstance(body, SqrtExprNode):
        inner = getattr(body, 'left', None)
        if inner is not None:
            if _is_pure_x(inner):
                feats['sqrt_inner_pure_x'] = 1
            elif _is_ax_plus_b(inner):
                feats['sqrt_inner_ax_plus_b'] = 1

    feats['log_inner_pure_x']    = 0
    feats['log_inner_ax_plus_b'] = 0
    if isinstance(body, LogExprNode):
        inner = getattr(body, 'left', None)
        if inner is not None:
            if _is_pure_x(inner):
                feats['log_inner_pure_x'] = 1
            elif _is_ax_plus_b(inner):
                feats['log_inner_ax_plus_b'] = 1

    feats['exp_inner_pure_x']    = 0
    feats['exp_inner_ax_plus_b'] = 0
    if isinstance(body, ExpExprNode):
        inner = getattr(body, 'left', None)
        if inner is not None:
            if _is_pure_x(inner):
                feats['exp_inner_pure_x'] = 1
            elif _is_ax_plus_b(inner):
                feats['exp_inner_ax_plus_b'] = 1

    feats['any_func_inner_pure_x'] = 1 if any([
        feats['trig_inner_pure_x'],
        feats['mono_inner_pure_x'],
        feats['sqrt_inner_pure_x'],
        feats['log_inner_pure_x'],
        feats['exp_inner_pure_x'],
    ]) else 0

    feats['any_func_inner_ax_plus_b'] = 1 if any([
        feats['trig_inner_ax_plus_b'],
        feats['mono_inner_ax_plus_b'],
        feats['sqrt_inner_ax_plus_b'],
        feats['log_inner_ax_plus_b'],
        feats['exp_inner_ax_plus_b'],
    ]) else 0

    feats['inner_is_x_plus_const'] = 1 if any([
        feats['trig_inner_offset'],
        feats['mono_inner_offset'],
    ]) else 0

    feats['inner_offset_not_zero'] = feats['inner_is_x_plus_const']

    root_is_func = isinstance(body, (
        SinExprNode, CosExprNode, TanExprNode,
        MonoExprNode, PowerExprNode, SqrtExprNode,
        LogExprNode, ExpExprNode
    ))
    feats['root_func_class0_signal'] = 1 if (root_is_func and feats['any_func_inner_pure_x']) else 0
    feats['root_func_class4_signal'] = 1 if (root_is_func and feats['any_func_inner_ax_plus_b']) else 0

    return feats
"""

action_signals_content = base_imports + "from ai.model.features.utils import *\\n\\n" + """
def detect_action_signals(body):
    feats = {}

    feats['sig_is_pure_polynomial'] = 1 if _is_polynomial_sum(body) else 0
    feats['sig_poly_degree']        = max(0, _get_poly_degree(body)) if feats['sig_is_pure_polynomial'] else 0
    feats['sig_poly_multi_terms']   = 0
    if feats['sig_is_pure_polynomial'] and isinstance(body, (AddExprNode, SubExprNode)):
        feats['sig_poly_multi_terms'] = 1

    feats['sig_mul_root']           = 1 if isinstance(body, MulExprNode) else 0
    feats['sig_mul_f_is_const']     = 0
    feats['sig_mul_same_category']  = 0
    feats['sig_mul_diff_category']  = 0
    feats['sig_mul_uprime_gu']      = 0
    feats['sig_mul_ibp_candidate']  = 0

    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        cat_L = _func_category(L)
        cat_R = _func_category(R)

        if _is_const_node(L) or _is_const_node(R):
            feats['sig_mul_f_is_const'] = 1
        else:
            if cat_L == cat_R:
                feats['sig_mul_same_category'] = 1
            else:
                feats['sig_mul_diff_category'] = 1
                if _could_be_derivative(L, R) or _could_be_derivative(R, L):
                    feats['sig_mul_uprime_gu'] = 1
                else:
                    feats['sig_mul_ibp_candidate'] = 1

    feats['sig_frac_root']          = 1 if isinstance(body, FracExprNode) else 0
    feats['sig_frac_num_is_one']    = 0
    feats['sig_frac_den_poly_deg1'] = 0
    feats['sig_frac_den_poly_degN'] = 0
    feats['sig_frac_both_poly']     = 0
    feats['sig_frac_has_sqrt']      = 0
    feats['sig_frac_diff_func']     = 0

    if isinstance(body, FracExprNode) and body.left is not None and body.right is not None:
        num, den = body.left, body.right
        num_is_one   = _is_const_node(num)
        num_is_poly  = _is_polynomial_sum(num)
        den_is_poly  = _is_polynomial_sum(den)
        den_degree   = _get_poly_degree(den) if den_is_poly else -1
        num_has_sqrt = isinstance(num, SqrtExprNode) or (hasattr(num, 'has_function') and num.has_function(SqrtExprNode))
        den_has_sqrt = isinstance(den, SqrtExprNode) or (hasattr(den, 'has_function') and den.has_function(SqrtExprNode))

        feats['sig_frac_num_is_one']    = 1 if num_is_one else 0

        if den_is_poly:
            if den_degree == 1:
                feats['sig_frac_den_poly_deg1'] = 1   
            elif den_degree > 1:
                feats['sig_frac_den_poly_degN'] = 1   

        if num_is_poly and den_is_poly and not num_is_one:
            feats['sig_frac_both_poly'] = 1            

        if num_has_sqrt or den_has_sqrt:
            feats['sig_frac_has_sqrt'] = 1             

        cat_num = _func_category(num)
        cat_den = _func_category(den)
        if cat_num not in ('poly','const','var','mul') and \\
           cat_den not in ('poly','const','var','mul') and \\
           cat_num != cat_den:
            feats['sig_frac_diff_func'] = 1             

    feats['sig_has_power_exp']      = 0
    feats['sig_exp_root']           = 1 if isinstance(body, ExpExprNode) else 0
    feats['sig_power_root']         = 1 if isinstance(body, PowerExprNode) else 0
    feats['sig_exp_f_const_g_deg1'] = 0
    feats['sig_exp_f_is_derivative']= 0
    feats['sig_exp_ibp_candidate']  = 0

    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        exp_side  = R if isinstance(R, (ExpExprNode, PowerExprNode)) else \\
                    (L if isinstance(L, (ExpExprNode, PowerExprNode)) else None)
        func_side = L if exp_side is R else (R if exp_side is L else None)

        if exp_side is not None:
            feats['sig_has_power_exp'] = 1
            g_inner = getattr(exp_side, 'left', None)
            g_deg   = _get_poly_degree(g_inner) if g_inner is not None else -1

            if _is_const_node(func_side) and g_deg == 1:
                feats['sig_exp_f_const_g_deg1'] = 1    
            elif func_side is not None and g_inner is not None and \\
                 _could_be_derivative(func_side, g_inner):
                feats['sig_exp_f_is_derivative'] = 1   
            elif func_side is not None and not _is_const_node(func_side):
                feats['sig_exp_ibp_candidate'] = 1     

    feats['sig_sqrt_root']           = 1 if isinstance(body, SqrtExprNode) else 0
    feats['sig_sqrt_f_one_g_deg1']   = 0
    feats['sig_sqrt_g_is_exp']       = 0
    feats['sig_sqrt_g_is_monom']     = 0
    feats['sig_sqrt_f_is_derivative']= 0

    if isinstance(body, SqrtExprNode):
        g_inner = getattr(body, 'left', None)
        if g_inner is not None:
            g_deg = _get_poly_degree(g_inner)
            if g_deg == 1:
                feats['sig_sqrt_f_one_g_deg1'] = 1     
            elif isinstance(g_inner, (ExpExprNode, PowerExprNode)) and not _is_polynomial_sum(g_inner):
                feats['sig_sqrt_g_is_exp'] = 1          
            elif g_deg > 1:
                feats['sig_sqrt_g_is_monom'] = 1        

    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        sqrt_side = R if isinstance(R, SqrtExprNode) else \\
                    (L if isinstance(L, SqrtExprNode) else None)
        func_side = L if sqrt_side is R else (R if sqrt_side is L else None)

        if sqrt_side is not None and func_side is not None:
            feats['sig_sqrt_root'] = 1
            g_inner = getattr(sqrt_side, 'left', None)
            if g_inner is not None and _could_be_derivative(func_side, g_inner):
                feats['sig_sqrt_f_is_derivative'] = 1  

    feats['sig_action0_direct'] = 1 if (
        feats['sig_is_pure_polynomial'] and feats['sig_poly_degree'] <= 1 and
        not feats['sig_poly_multi_terms']
    ) else 0

    feats['sig_action1_const'] = 1 if feats['sig_mul_f_is_const'] else 0

    feats['sig_action1_split'] = 1 if (
        feats['sig_is_pure_polynomial'] and feats['sig_poly_multi_terms']
    ) else 0

    feats['sig_action2_split'] = feats['sig_action1_split']  

    feats['sig_action3_special'] = 1 if any([
        feats['sig_mul_same_category'],
        feats['sig_frac_den_poly_degN'],
        feats['sig_frac_both_poly'],
        feats['sig_sqrt_g_is_exp'],
        feats['sig_sqrt_g_is_monom'],
    ]) else 0

    feats['sig_action4_usub'] = 1 if any([
        feats['sig_mul_uprime_gu'],
        feats['sig_frac_den_poly_deg1'],
        feats['sig_frac_has_sqrt'],
        feats['sig_exp_f_const_g_deg1'],
        feats['sig_exp_f_is_derivative'],
        feats['sig_sqrt_f_one_g_deg1'],
        feats['sig_sqrt_f_is_derivative'],
    ]) else 0

    feats['sig_action5_byparts'] = 1 if any([
        feats['sig_mul_ibp_candidate'],
        feats['sig_frac_diff_func'],
        feats['sig_exp_ibp_candidate'],
    ]) else 0

    return feats
"""

with open("ai/model/features/utils.py", "w", encoding="utf-8") as f:
    f.write(utils_content)
with open("ai/model/features/add_sub.py", "w", encoding="utf-8") as f:
    f.write(add_sub_content)
with open("ai/model/features/const_func.py", "w", encoding="utf-8") as f:
    f.write(const_func_content)
with open("ai/model/features/basic.py", "w", encoding="utf-8") as f:
    f.write(basic_content)
with open("ai/model/features/func_counts.py", "w", encoding="utf-8") as f:
    f.write(func_counts_content)
with open("ai/model/features/ibp.py", "w", encoding="utf-8") as f:
    f.write(ibp_content)
with open("ai/model/features/usub.py", "w", encoding="utf-8") as f:
    f.write(usub_content)
with open("ai/model/features/inner_type.py", "w", encoding="utf-8") as f:
    f.write(inner_type_content)
with open("ai/model/features/action_signals.py", "w", encoding="utf-8") as f:
    f.write(action_signals_content)

print("Successfully recovered files!")
