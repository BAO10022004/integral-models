from sympy import false
import math

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
    if isinstance(node, PowerExprNode):
        inner = node.right
    else:
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
        inner = node.right if isinstance(node, PowerExprNode) else node.left
        if inner is not None and isinstance(inner, (AddExprNode, SubExprNode)):
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
        return inner is None or isinstance(inner, VarExprNode) or _is_polynomial_sum(inner)
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

def _extract_a(inner: ExprNode, dee: str):
    if isinstance(inner, MulExprNode):
        L, R = inner.left, inner.right
        if isinstance(L, ConstExprNode) and isinstance(R, VarExprNode) and R.left == dee:
            return float(L.left)
        if isinstance(R, ConstExprNode) and isinstance(L, VarExprNode) and L.left == dee:
            return float(R.left)
            
        if isinstance(L, ConstExprNode) and isinstance(R, VarExprNode):
            return float(L.left)
        if isinstance(R, ConstExprNode) and isinstance(L, VarExprNode):
            return float(R.left)

    if isinstance(inner, (AddExprNode, SubExprNode)):
        L, R = inner.left, inner.right
        if isinstance(L, VarExprNode) and getattr(L, 'left', None) == dee and isinstance(R, ConstExprNode):
            return 1.0
        if isinstance(R, VarExprNode) and getattr(R, 'left', None) == dee and isinstance(L, ConstExprNode):
            return 1.0
            
        if isinstance(L, VarExprNode) and isinstance(R, ConstExprNode):
            return 1.0
        if isinstance(L, ConstExprNode) and isinstance(R, VarExprNode):
            return 1.0
            
        if isinstance(L, MulExprNode) and isinstance(R, ConstExprNode):
            LL, LR = L.left, L.right
            if isinstance(LL, ConstExprNode) and isinstance(LR, VarExprNode) and getattr(LR, 'left', None) == dee:
                return float(LL.left)
            if isinstance(LR, ConstExprNode) and isinstance(LL, VarExprNode) and getattr(LL, 'left', None) == dee:
                return float(LR.left)
            
            if isinstance(LL, ConstExprNode) and isinstance(LR, VarExprNode):
                return float(LL.left)
            if isinstance(LR, ConstExprNode) and isinstance(LL, VarExprNode):
                return float(LR.left)
                
    if isinstance(inner, VarExprNode) and getattr(inner, 'left', None) == dee:
        return 1.0
    if isinstance(inner, VarExprNode):
        return 1.0
    return None

def _scale(coeff: float, node: ExprNode, dee: str) -> ExprNode:
    if coeff == 1.0:
        return node
    return MulExprNode(
        left  = ConstExprNode(left=coeff),
        right = node,
        var   = dee,
    )

def get_liate_score(node: ExprNode) -> int:
    if isinstance(node, LogExprNode):
        return 1  
    if isinstance(node, (VarExprNode, MonoExprNode, ConstExprNode)):
        return 2  
    if isinstance(node, (AddExprNode, SubExprNode, FracExprNode)):
        return 2  
    if isinstance(node, (SinExprNode, CosExprNode, TanExprNode)):
        return 3  
    if isinstance(node, (ExpExprNode, PowerExprNode)):
        return 4  
    return 5

def solve_quadratic(a: float, b: float, c: float) -> list[float]:
    if a == 0:
        if b == 0:
            return [] if c != 0 else [] 
        return [-c / b]
    delta = b**2 - 4 * a * c
    if delta < 0:
        return []
    elif delta == 0:
        return [-b / (2 * a)]
    else:
        return [(-b - math.sqrt(delta)) / (2 * a), (-b + math.sqrt(delta)) / (2 * a)]

def count_quadratic_roots(a: float, b: float, c: float) -> int:
    if a == 0:
        if b == 0:
            return 0
        return 1
    delta = b**2 - 4 * a * c
    if delta < 0:
        return 0
    elif delta == 0:
        return 1
    else:
        return 2

def factor_quadratic(a: float, b: float, c: float) -> tuple[tuple[float, float], tuple[float, float]] | None:
    roots = solve_quadratic(a, b, c)
    if not roots:
        return None
    
    if a == 0:
        return ((0.0, 1.0), (b, c))
        
    if len(roots) == 1:
        x1 = roots[0]
        return ((1.0, -x1), (a, -a * x1))
    
    x1, x2 = roots
    return ((1.0, -x1), (a, -a * x2))

def get_poly_coeffs(node: ExprNode, dee: str = 'x') -> dict:
    if node is None:
        return {}
    if isinstance(node, ConstExprNode):
        return {0: float(node.left)}
    if isinstance(node, VarExprNode) and getattr(node, 'left', dee) == dee:
        return {1: 1.0}
    if isinstance(node, (MonoExprNode, PowerExprNode)):
        if isinstance(node.left, VarExprNode) and getattr(node.left, 'left', dee) == dee:
            if getattr(node, 'right', None) is not None and isinstance(node.right, ConstExprNode):
                return {int(float(node.right.left)): 1.0}
    if isinstance(node, MulExprNode):
        if isinstance(node.left, ConstExprNode):
            c = float(node.left.left)
            inner_coeffs = get_poly_coeffs(node.right, dee)
            return {k: v * c for k, v in inner_coeffs.items()}
        if isinstance(node.right, ConstExprNode):
            c = float(node.right.left)
            inner_coeffs = get_poly_coeffs(node.left, dee)
            return {k: v * c for k, v in inner_coeffs.items()}
        left_coeffs = get_poly_coeffs(node.left, dee)
        right_coeffs = get_poly_coeffs(node.right, dee)
        res = {}
        for k1, v1 in left_coeffs.items():
            for k2, v2 in right_coeffs.items():
                res[k1+k2] = res.get(k1+k2, 0.0) + v1*v2
        return res
    if isinstance(node, (AddExprNode, SubExprNode)):
        left_coeffs = get_poly_coeffs(node.left, dee)
        right_coeffs = get_poly_coeffs(node.right, dee)
        res = dict(left_coeffs)
        for k, v in right_coeffs.items():
            if isinstance(node, SubExprNode):
                res[k] = res.get(k, 0.0) - v
            else:
                res[k] = res.get(k, 0.0) + v
        return res
    return {}

def factor_quadratic_expr(node: ExprNode, dee: str = 'x') -> ExprNode | None:
    coeffs = get_poly_coeffs(node, dee)
    if not coeffs:
        return None
    if any(k > 2 for k in coeffs.keys()):
        return None
        
    a = coeffs.get(2, 0.0)
    b = coeffs.get(1, 0.0)
    c = coeffs.get(0, 0.0)
    
    factors = factor_quadratic(a, b, c)
    if factors is None:
        return None
        
    (a1, b1), (a2, b2) = factors
    
    def make_linear(a_val, b_val):
        if a_val == 0:
            return ConstExprNode(left=b_val)
        var_node = VarExprNode(left=dee)
        if a_val != 1 and a_val != 1.0:
            var_node = MulExprNode(left=ConstExprNode(left=a_val), right=var_node)
        if b_val == 0:
            return var_node
        if b_val > 0:
            return AddExprNode(left=var_node, right=ConstExprNode(left=b_val))
        return SubExprNode(left=var_node, right=ConstExprNode(left=-b_val))
        
    left_node = make_linear(a1, b1)
    right_node = make_linear(a2, b2)
    return MulExprNode(left=left_node, right=right_node)
#######################                    Da thuc bac 1                ####################
def create_linear_expr(a: float, b: float, dee: str = 'x') -> ExprNode:
    if a == 0:
        return ConstExprNode(left=b)
    var_node = VarExprNode(left=dee, var=dee)
    if a != 1 and a != 1.0:
        var_node = MulExprNode(left=ConstExprNode(left=a), right=var_node, var=dee)
    if b == 0:
        return var_node
    if b > 0:
        return AddExprNode(left=var_node, right=ConstExprNode(left=b), var=dee)
    return SubExprNode(left=var_node, right=ConstExprNode(left=-b), var=dee)

## check f(x) = a*x
def check_linear_basic(node : ExprNode):
    left = node.left
    right = node.right
    if left == None and right == None:
        return False
    if  isinstance(node,MulExprNode):
        if (isinstance(left, VarExprNode) and isinstance(right, ConstExprNode)) or (isinstance(right, VarExprNode) and isinstance(left, ConstExprNode)):
            return True
    return False
## check f(x) = a*x + b
def check_linear(node: ExprNode, dee: str = 'x') -> bool:
    return _is_polynomial_sum(node) and _get_poly_degree(node) == 1

## get coef a, b of ax+b
def get_coef_linear(node: ExprNode, dee: str = 'x'):
    if not check_linear(node, dee):
        if isinstance(node, ConstExprNode):
            return (0.0, float(node.left))
        return None
    coeffs = get_poly_coeffs(node, dee)
    a = coeffs.get(1, 0.0)
    b = coeffs.get(0, 0.0)
    return (float(a), float(b))
## check f(x) = (ax+b)(cx+d)
def check_double_linner(node:ExprNode):
    left = node.left
    right = node.right
    if isinstance(node, MonoExprNode):
        return check_linear(left) and check_linear(right)
    return False
#######################                    Da thuc bac 2                ####################
def check_parabola(node: ExprNode, dee: str = 'x') -> bool:
    if not _is_polynomial_sum(node):
        return False
    coeffs = get_poly_coeffs(node, dee)
    if not coeffs:
        return False
    non_zero_coeffs = {d: c for d, c in coeffs.items() if c != 0}
    if not non_zero_coeffs:
        return False
    if max(non_zero_coeffs.keys()) == 2:
        return True
    return False

def get_coef_parabola(node: ExprNode, dee: str = 'x'):
    if not check_parabola(node, dee):
        return None
    coeffs = get_poly_coeffs(node, dee)
    return (coeffs.get(2, 0.0), coeffs.get(1, 0.0), coeffs.get(0, 0.0))
def count_parabola_roots(node: ExprNode, dee: str = 'x') -> int:
    coeffs = get_coef_parabola(node, dee)
    if not coeffs:
        return -1
    a, b, c = coeffs
    delta = b**2 - 4*a*c
    if delta > 1e-9:
        return 2
    elif abs(delta) <= 1e-9:
        return 1
    else:
        return 0

import math

def get_parabola_roots(node: ExprNode, dee: str = 'x'):

    coeffs = get_coef_parabola(node, dee)
    if not coeffs:
        return None
    a, b, c = coeffs
    if abs(a) < 1e-9:
        return None
        
    delta = b**2 - 4*a*c
    if delta > 1e-9:
        x1 = (-b - math.sqrt(delta)) / (2*a)
        x2 = (-b + math.sqrt(delta)) / (2*a)
        return (x1, x2)
    elif abs(delta) <= 1e-9:
        x0 = -b / (2*a)
        return (x0,)
    else:
        return None

#################################################################################################
def sort_poly_descending(node: ExprNode, dee: str = 'x') -> ExprNode:

    if node is None:
        return None
        
    coeffs = get_poly_coeffs(node, dee)
    if not coeffs:
        return node
        
    sorted_degrees = sorted([d for d, c in coeffs.items() if c != 0], reverse=True)
    if not sorted_degrees:
        return ConstExprNode(left=0.0)
        
    def make_term(degree, coeff):
        if degree == 0:
            return ConstExprNode(left=coeff)
        
        if degree == 1:
            var_part = VarExprNode(left=dee)
        else:
            var_part = PowerExprNode(left=VarExprNode(left=dee), right=ConstExprNode(left=degree))
            
        if coeff == 1.0:
            return var_part
            
        return MulExprNode(left=ConstExprNode(left=coeff), right=var_part)

    result = None
    for deg in sorted_degrees:
        coeff = coeffs[deg]
        if result is None:
            result = make_term(deg, coeff)
        else:
            if coeff > 0:
                result = AddExprNode(left=result, right=make_term(deg, coeff))
            else:
                result = SubExprNode(left=result, right=make_term(deg, abs(coeff)))
                
    return result




def coeffs_to_poly_expr(coeffs: dict, dee: str = 'x') -> ExprNode:
    sorted_degrees = sorted([d for d, c in coeffs.items() if c is not None and abs(c) > 1e-9], reverse=True)
    if not sorted_degrees:
        return ConstExprNode(left=0.0)
        
    def make_term(degree, coeff):
        if degree == 0:
            return ConstExprNode(left=coeff)
        if degree == 1:
            var_part = VarExprNode(left=dee)
        else:
            var_part = PowerExprNode(left=VarExprNode(left=dee), right=ConstExprNode(left=degree))
            
        if coeff == 1.0:
            return var_part
        return MulExprNode(left=ConstExprNode(left=coeff), right=var_part)

    res = None
    for deg in sorted_degrees:
        coeff = coeffs[deg]
        if res is None:
            res = make_term(deg, coeff)
        else:
            if coeff > 0:
                res = AddExprNode(left=res, right=make_term(deg, coeff))
            else:
                res = SubExprNode(left=res, right=make_term(deg, abs(coeff)))
                
    return res

def polynomial_division(node: ExprNode, dee:str):
    #### dk: bac tu > bac mau
    if node is None or not isinstance(node, FracExprNode):
        return node
    
    coeffs1 = get_poly_coeffs(node.left, dee)
    coeffs2 = get_poly_coeffs(node.right, dee)
    n = max(coeffs1.keys(), default=0)
    m = max(coeffs2.keys(), default=0)
    d = n - m 
    # Term to subtract from numerator
    result = {}  
    # lead_coeff
    for i in range(0, d+1):
        result[i] = None
    if n < m:
        return None
    while (m<=n):
        lead_coeff1 = coeffs1[n]
        lead_coeff2 = coeffs2[m]
        c_d = lead_coeff1 / lead_coeff2
        result[n-m] = c_d
        coeffs1_sub = {}  
        for i in range(0, n+1):
            coeffs1_sub[i] = 0
        for i in coeffs2.keys():
            coeffs1_sub[i + (n-m)] = coeffs2[i]*c_d
        for i in range(0, n+1):
            coeffs1[i] = coeffs1.get(i, 0) - coeffs1_sub.get(i, 0)
        coeffs1 = {k: v for k, v in coeffs1.items() if abs(v) > 1e-9}
        n = max(coeffs1.keys(), default=-1)
        if n == -1:
            break
    
    return coeffs_to_poly_expr(result, dee), coeffs_to_poly_expr(coeffs1, dee)