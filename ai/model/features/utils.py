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
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, VarExprNode)) or \
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, VarExprNode)):
            return True
    if isinstance(node, (AddExprNode, SubExprNode)):
        if isinstance(node.left, VarExprNode) and isinstance(node.right, ConstExprNode):
            return True
        if isinstance(node.right, VarExprNode) and isinstance(node.left, ConstExprNode):
            return True
        if isinstance(node.left, MulExprNode) and isinstance(node.right, ConstExprNode):
            L = node.left
            if (isinstance(L.left, ConstExprNode) and isinstance(L.right, VarExprNode)) or \
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
            if (isinstance(LL, ConstExprNode) and isinstance(LR, VarExprNode)) or \
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

__all__ = [
    '_FUNC_TYPES', '_NONTRIVIAL_FUNC_TYPES', '_FUNC_CATEGORY_MAP', 
    '_POLY_TYPES', '_TRIG_TYPES', 'is_pure_var_or_const', 
    'is_linear_expr', 'is_monomial', 'has_non_trivial_inner', 
    'count_nodes', 'get_depth', '_has_mono_add_inner', 
    '_check_trig_nontrivial', '_check_sqrt_nontrivial', '_is_ax_plus_b', 
    '_is_nonlinear_inner', '_is_pure_x', '_inner_has_offset', 
    '_inner_has_coeff_only', '_is_polynomial_sum', '_get_poly_degree', 
    '_func_category', '_is_const_node', '_could_be_derivative',
    'ExprNode', 'SinExprNode', 'CosExprNode', 'TanExprNode', 
    'AddExprNode', 'SubExprNode', 'MulExprNode', 'FracExprNode', 
    'VarExprNode', 'ConstExprNode', 'MonoExprNode', 'LogExprNode', 
    'SqrtExprNode', 'PowerExprNode', 'ExpExprNode'
]
