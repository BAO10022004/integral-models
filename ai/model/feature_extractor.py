"""
feature_extractor.py
--------------------
Tối ưu features phát hiện dấu hiệu tích phân:
  1. Root ADD / SUB  →  action 8 (basic sum)
  2. const * function  →  action -1 / 8
  3. Nguyên hàm cơ bản 1 bước  →  action -1
  4. Đếm số lượng hàm (không tính ADD/SUB) → nhận biết độ phức tạp
  5. Nhận biết tích phân từng phần (integration by parts)
"""

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

# ── Kiểu hàm "đơn" (không phải phép toán 2 ngôi) ────────────────────────────
_FUNC_TYPES = (
    SinExprNode, CosExprNode, TanExprNode,
    SqrtExprNode, LogExprNode, ExpExprNode,
    MonoExprNode, PowerExprNode,
    VarExprNode, ConstExprNode,
    FracExprNode,
)

# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def is_pure_var_or_const(node):
    """Node là biến đơn (x) hoặc hằng số."""
    return isinstance(node, (VarExprNode, ConstExprNode))


def is_linear_expr(node):
    """Biểu thức tuyến tính: ax, ax+b, ax-b, x+b, ..."""
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
    """Đơn thức: x^n hoặc c*x^n."""
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
    """Hàm lượng giác / sqrt có inner phức tạp hơn x đơn?"""
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


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 1: Phát hiện ROOT là ADD hoặc SUB
# ─────────────────────────────────────────────────────────────────────────────

def detect_root_add_sub(body):
    """
    Trả về dict features phát hiện nút gốc là ADD hoặc SUB.
    → Dấu hiệu mạnh của action 8 (basic sum/linearity rule).
    """
    feats = {}
    feats["root_is_add"] = 1 if isinstance(body, AddExprNode) else 0
    feats["root_is_sub"] = 1 if isinstance(body, SubExprNode) else 0
    feats["root_is_add_or_sub"] = 1 if isinstance(body, (AddExprNode, SubExprNode)) else 0

    # Chiều sâu 2: root là +/- và cả hai con đều là hàm đơn (không phức tạp)
    feats["root_add_both_simple"] = 0
    if feats["root_is_add_or_sub"]:
        L, R = body.left, body.right
        if L is not None and R is not None:
            left_simple = isinstance(L, _FUNC_TYPES) or is_monomial(L)
            right_simple = isinstance(R, _FUNC_TYPES) or is_monomial(R)
            if left_simple and right_simple:
                feats["root_add_both_simple"] = 1

    # Số node +/- ở mọi cấp (đếm bao nhiêu hạng tử trong tổng)
    feats["has_add"] = 1 if body.has_function(AddExprNode) else 0
    feats["has_sub"] = 1 if body.has_function(SubExprNode) else 0
    feats["count_add"] = body.cont_function(AddExprNode)
    feats["count_sub"] = body.cont_function(SubExprNode)
    feats["count_terms"] = feats["count_add"] + feats["count_sub"] + 1
    return feats


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 2: Phát hiện const * function (c·f(x))
# ─────────────────────────────────────────────────────────────────────────────

def _is_single_func(node):
    """Node là một hàm đơn (trig, sqrt, log, mono, var, frac)."""
    return isinstance(node, _FUNC_TYPES)


def _is_const_times_func(node):
    """
    Kiểm tra node có dạng  const * f(x)  hoặc  f(x) * const  không.
    """
    if not isinstance(node, MulExprNode):
        return False
    L, R = node.left, node.right
    if L is None or R is None:
        return False
    return (isinstance(L, ConstExprNode) and _is_single_func(R)) or \
           (isinstance(R, ConstExprNode) and _is_single_func(L))


def _find_const_times_func_any(node):
    """Tìm bất kỳ node con nào có dạng const*func."""
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
    """
    Trả về dict features cho pattern  const * function.
    Gồm: root level và bất kỳ cấp nào.
    """
    feats = {}

    # root_is_mul
    feats["root_is_mul"] = 1 if isinstance(body, MulExprNode) else 0

    # const * func ngay tại root
    feats["root_const_times_func"] = 1 if _is_const_times_func(body) else 0

    # const * var ngay tại root (c·x – tích phân x^1)
    feats["is_mul_const_var"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        if (isinstance(body.left, ConstExprNode) and isinstance(body.right, VarExprNode)) or \
           (isinstance(body.right, ConstExprNode) and isinstance(body.left, VarExprNode)):
            feats["is_mul_const_var"] = 1

    # const * trig ngay tại root (c·sin/cos/tan(x))
    feats["root_const_times_trig"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, (SinExprNode, CosExprNode, TanExprNode))) or \
           (isinstance(R, ConstExprNode) and isinstance(L, (SinExprNode, CosExprNode, TanExprNode))):
            feats["root_const_times_trig"] = 1

    # const * sqrt ngay tại root
    feats["root_const_times_sqrt"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, SqrtExprNode)) or \
           (isinstance(R, ConstExprNode) and isinstance(L, SqrtExprNode)):
            feats["root_const_times_sqrt"] = 1

    # const * frac  (e.g. 2 * 1/x)
    feats["root_const_times_frac"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, FracExprNode)) or \
           (isinstance(R, ConstExprNode) and isinstance(L, FracExprNode)):
            feats["root_const_times_frac"] = 1

    # Bất kỳ cấp nào có const*func
    feats["any_const_times_func"] = 1 if _find_const_times_func_any(body) else 0

    feats["has_mul"] = 1 if body.has_function(MulExprNode) else 0
    feats["count_mul"] = body.cont_function(MulExprNode)
    return feats


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 3: Phát hiện nguyên hàm cơ bản 1 bước (action -1)
# ─────────────────────────────────────────────────────────────────────────────

def _trig_simple_inner(node):
    """True nếu inner của trig là x đơn (không phức tạp)."""
    return isinstance(node, (SinExprNode, CosExprNode)) and not has_non_trivial_inner(node)


def detect_basic_antiderivative(body):
    """
    Phát hiện biểu thức có thể tích phân trong đúng 1 bước (action = -1).

    Các dạng cơ bản:
      - x^n  (n ≠ -1)   → dùng power rule
      - 1/x (frac 1 over x)
      - sin(x), cos(x)  (inner đơn giản)
      - sqrt(x)  (= x^(1/2))
      - sqrt[n]{x}
      - c  (hằng số)
      - x  (biến đơn)
      - c * x^n
      - c * 1/x
      - c * sin(x) / cos(x)
    """
    feats = {}

    # — 3a. Chỉ là biến hoặc hằng số —
    feats["is_pure_var"] = 1 if isinstance(body, VarExprNode) else 0
    feats["is_pure_const"] = 1 if isinstance(body, ConstExprNode) else 0

    # — 3b. Đơn thức x^n tại root —
    feats["root_is_mono"] = 1 if isinstance(body, (MonoExprNode, PowerExprNode)) else 0

    # — 3c. Trig đơn tại root (sin/cos với inner = x) —
    feats["is_single_trig_simple"] = 0
    if isinstance(body, (SinExprNode, CosExprNode)) and not has_non_trivial_inner(body):
        feats["is_single_trig_simple"] = 1

    # — 3d. sqrt đơn tại root (sqrt(x) hoặc sqrt(ax+b)) —
    feats["root_is_sqrt"] = 1 if isinstance(body, SqrtExprNode) else 0
    feats["root_is_sqrt_simple"] = 0
    if isinstance(body, SqrtExprNode):
        if not has_non_trivial_inner(body):
            feats["root_is_sqrt_simple"] = 1   # sqrt(x)
        elif is_linear_expr(body.left):
            feats["root_is_sqrt_simple"] = 1   # sqrt(ax+b)

    # — 3e. 1/x tại root —
    feats["root_is_inv_x"] = 0
    if isinstance(body, FracExprNode) and body.left is not None and body.right is not None:
        if isinstance(body.left, ConstExprNode) and isinstance(body.right, VarExprNode):
            feats["root_is_inv_x"] = 1          # c/x

    # — 3f. c * x^n tại root —
    feats["root_const_times_mono"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if (isinstance(L, ConstExprNode) and isinstance(R, (MonoExprNode, PowerExprNode, VarExprNode))) or \
           (isinstance(R, ConstExprNode) and isinstance(L, (MonoExprNode, PowerExprNode, VarExprNode))):
            feats["root_const_times_mono"] = 1

    # — 3g. c * 1/x tại root —
    feats["root_const_times_inv_x"] = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        inv_x_R = isinstance(R, FracExprNode) and isinstance(getattr(R, "left", None), ConstExprNode) \
                  and isinstance(getattr(R, "right", None), VarExprNode)
        inv_x_L = isinstance(L, FracExprNode) and isinstance(getattr(L, "left", None), ConstExprNode) \
                  and isinstance(getattr(L, "right", None), VarExprNode)
        if (isinstance(L, ConstExprNode) and inv_x_R) or (isinstance(R, ConstExprNode) and inv_x_L):
            feats["root_const_times_inv_x"] = 1

    # — 3h. Tổng hợp: "one_step_basic" – TRUE khi thuộc bất kỳ dạng cơ bản nào ở trên —
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


# ─────────────────────────────────────────────────────────────────────────────
# FEATURES PHỤ (giữ nguyên từ phiên bản cũ)
# ─────────────────────────────────────────────────────────────────────────────

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


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 4: Đếm số lượng hàm (không tính ADD / SUB)
# ─────────────────────────────────────────────────────────────────────────────

# Các kiểu hàm "thực sự" (không phải phép cộng/trừ, không phải hằng/biến đơn)
_NONTRIVIAL_FUNC_TYPES = (
    SinExprNode, CosExprNode, TanExprNode,
    SqrtExprNode, LogExprNode, ExpExprNode,
    MonoExprNode, PowerExprNode,
    FracExprNode, MulExprNode,
)

# Phân loại hàm theo nhóm để đếm distinct
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


def _collect_func_types(node, result_set=None):
    """Thu thập tất cả các loại hàm (category) xuất hiện trong cây biểu thức,
    không tính AddExprNode / SubExprNode."""
    if node is None:
        return set() if result_set is None else result_set
    if result_set is None:
        result_set = set()

    # Nếu node thuộc một category → thêm vào set
    cat = _FUNC_CATEGORY_MAP.get(type(node))
    if cat is not None:
        result_set.add(cat)

    # Đệ quy vào con
    if hasattr(node, 'left') and node.left is not None:
        _collect_func_types(node.left, result_set)
    if hasattr(node, 'right') and node.right is not None:
        _collect_func_types(node.right, result_set)
    return result_set


def _count_nontrivial_funcs(node):
    """Đếm tổng số node hàm (không tính ADD/SUB, không tính Const đơn)."""
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
    """
    Trả về dict features đếm số lượng hàm trong biểu thức
    (không tính ADD / SUB).

    Features:
      - count_nontrivial_funcs : tổng số node hàm (trừ +/-)
      - count_distinct_func_types : số loại hàm khác nhau
      - has_multi_func_types : 1 nếu có >= 2 loại hàm khác nhau
    """
    feats = {}
    func_types = _collect_func_types(body)
    feats['count_nontrivial_funcs'] = _count_nontrivial_funcs(body)
    feats['count_distinct_func_types'] = len(func_types)
    feats['has_multi_func_types'] = 1 if len(func_types) >= 2 else 0
    return feats


# ─────────────────────────────────────────────────────────────────────────────
# NHÓM 5: Nhận biết tích phân từng phần (Integration by Parts)
# ─────────────────────────────────────────────────────────────────────────────
#
# Tích phân từng phần ∫ u dv = uv − ∫ v du
# Các dạng thường gặp:
#   - poly × trig      (x·sin(x), x²·cos(x), ...)
#   - poly × exp       (x·eˣ, x²·eˣ, ...)
#   - poly × log       (x·ln(x), x²·ln(x), ...)
#   - trig × exp       (eˣ·sin(x), eˣ·cos(x), ...)
#   - log  đơn         (ln(x)  → u=ln(x), dv=dx)
#

# Kiểu "đa thức" (polynomial-like)
_POLY_TYPES = (VarExprNode, MonoExprNode, PowerExprNode)
# Kiểu lượng giác
_TRIG_TYPES = (SinExprNode, CosExprNode, TanExprNode)


def _is_poly_like(node):
    """Node có dạng đa thức: x, x^n, c*x^n."""
    if isinstance(node, _POLY_TYPES):
        return True
    # c * x^n
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, _POLY_TYPES)) or \
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, _POLY_TYPES)):
            return True
    return False


def _is_trig_like(node):
    """Node là hàm lượng giác (sin, cos, tan) hoặc c*trig."""
    if isinstance(node, _TRIG_TYPES):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, _TRIG_TYPES)) or \
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, _TRIG_TYPES)):
            return True
    return False


def _is_exp_like(node):
    """Node là hàm mũ e^x hoặc c*e^x."""
    if isinstance(node, ExpExprNode):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, ExpExprNode)) or \
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, ExpExprNode)):
            return True
    return False


def _is_log_like(node):
    """Node là hàm log ln(x) hoặc c*ln(x)."""
    if isinstance(node, LogExprNode):
        return True
    if isinstance(node, MulExprNode) and node.left is not None and node.right is not None:
        if (isinstance(node.left, ConstExprNode) and isinstance(node.right, LogExprNode)) or \
           (isinstance(node.right, ConstExprNode) and isinstance(node.left, LogExprNode)):
            return True
    return False


def _check_mul_pattern(node, check_left, check_right):
    """
    Kiểm tra xem node MUL có dạng: check_left(L) * check_right(R)
    hoặc check_right(L) * check_left(R).
    """
    if not isinstance(node, MulExprNode):
        return False
    if node.left is None or node.right is None:
        return False
    L, R = node.left, node.right
    return (check_left(L) and check_right(R)) or \
           (check_left(R) and check_right(L))


def _find_ibp_pattern_any(node, check_left, check_right):
    """Tìm bất kỳ node con nào có dạng MUL(check_left, check_right)."""
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
    """
    Phát hiện các pattern tích phân từng phần.

    Features:
      ── tại root ──
      - ibp_root_poly_times_trig : root là poly * trig
      - ibp_root_poly_times_exp  : root là poly * exp
      - ibp_root_poly_times_log  : root là poly * log
      - ibp_root_trig_times_exp  : root là trig * exp
      ── ở bất kỳ đâu ──
      - ibp_any_poly_times_trig  : bất kỳ node nào có poly * trig
      - ibp_any_poly_times_exp   : bất kỳ node nào có poly * exp
      - ibp_any_poly_times_log   : bất kỳ node nào có poly * log
      - ibp_any_trig_times_exp   : bất kỳ node nào có trig * exp
      ── tổng hợp ──
      - ibp_root_is_log_only     : root chỉ là ln(x) đơn (IBP đặc biệt)
      - ibp_candidate            : 1 nếu bất kỳ pattern IBP nào khớp
    """
    feats = {}

    # ── Tại root ──
    feats['ibp_root_poly_times_trig'] = 1 if _check_mul_pattern(
        body, _is_poly_like, _is_trig_like) else 0
    feats['ibp_root_poly_times_exp'] = 1 if _check_mul_pattern(
        body, _is_poly_like, _is_exp_like) else 0
    feats['ibp_root_poly_times_log'] = 1 if _check_mul_pattern(
        body, _is_poly_like, _is_log_like) else 0
    feats['ibp_root_trig_times_exp'] = 1 if _check_mul_pattern(
        body, _is_trig_like, _is_exp_like) else 0

    # ── Ở bất kỳ đâu ──
    feats['ibp_any_poly_times_trig'] = 1 if _find_ibp_pattern_any(
        body, _is_poly_like, _is_trig_like) else 0
    feats['ibp_any_poly_times_exp'] = 1 if _find_ibp_pattern_any(
        body, _is_poly_like, _is_exp_like) else 0
    feats['ibp_any_poly_times_log'] = 1 if _find_ibp_pattern_any(
        body, _is_poly_like, _is_log_like) else 0
    feats['ibp_any_trig_times_exp'] = 1 if _find_ibp_pattern_any(
        body, _is_trig_like, _is_exp_like) else 0

    # ── Log đơn (ln(x) tại root → IBP đặc biệt: u=ln(x), dv=dx) ──
    feats['ibp_root_is_log_only'] = 1 if isinstance(body, LogExprNode) else 0

    # ── Tổng hợp: có phải candidate cho IBP không ──
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


# ─────────────────────────────────────────────────────────────────────────────
# HÀM CHÍNH
# ─────────────────────────────────────────────────────────────────────────────

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

    # ══ B. Has – sự hiện diện ══
    feats["has_trig"]  = 1 if (body.has_function(SinExprNode) or
                                body.has_function(CosExprNode) or
                                body.has_function(TanExprNode)) else 0
    feats["has_sin"]   = 1 if body.has_function(SinExprNode) else 0
    feats["has_cos"]   = 1 if body.has_function(CosExprNode) else 0
    feats["has_tan"]   = 1 if body.has_function(TanExprNode) else 0
    feats["has_sqrt"]  = 1 if body.has_function(SqrtExprNode) else 0
    feats["has_power"] = 1 if body.has_function(PowerExprNode) else 0
    feats["has_mono"]  = 1 if body.has_function(MonoExprNode) else 0
    feats["has_frac"]  = 1 if body.has_function(FracExprNode) else 0
    feats["has_exp"]   = 1 if body.has_function(ExpExprNode) else 0
    feats["has_log"]   = 1 if body.has_function(LogExprNode) else 0

    # ══ C. Count ══
    feats["count_sin"]   = body.cont_function(SinExprNode)
    feats["count_cos"]   = body.cont_function(CosExprNode)
    feats["count_tan"]   = body.cont_function(TanExprNode)
    feats["count_frac"]  = body.cont_function(FracExprNode)
    feats["count_sqrt"]  = body.cont_function(SqrtExprNode)
    feats["count_pow"]   = body.cont_function(PowerExprNode)
    feats["count_mono"]  = body.cont_function(MonoExprNode)
    feats["count_log"]   = body.cont_function(LogExprNode)
    feats["count_exp"]   = body.cont_function(ExpExprNode)
    feats["count_x"]     = body.cont_function(VarExprNode)
    feats["count_const"] = body.cont_function(ConstExprNode)

    # ══ D. Tree structure ══
    feats["tree_depth"] = get_depth(body)
    feats["tree_nodes"] = count_nodes(body)

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

    # ══ G. U-substitution (action 3) ══
    feats["trig_nontrivial_inner"] = 1 if _check_trig_nontrivial(body) else 0
    feats["sqrt_nontrivial_inner"] = 1 if _check_sqrt_nontrivial(body) else 0

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
    feats["mul_trig_poly"]  = 1 if (feats["has_trig"] and feats["has_mul"] and
                                     (feats["has_mono"] or feats["has_power"])) else 0
    feats["mul_sqrt_other"] = 1 if (feats["has_sqrt"] and feats["has_mul"]) else 0
    feats["frac_and_trig"]  = 1 if (feats["has_frac"] and feats["has_trig"]) else 0
    feats["frac_and_sqrt"]  = 1 if (feats["has_frac"] and feats["has_sqrt"]) else 0
    feats["add_and_frac"]   = 1 if (feats["has_add"] and feats["has_frac"]) else 0
    feats["add_and_trig"]   = 1 if (feats["has_add"] and feats["has_trig"]) else 0
    feats["add_and_sqrt"]   = 1 if (feats["has_add"] and feats["has_sqrt"]) else 0
    feats["trig_and_sqrt"]  = 1 if (feats["has_trig"] and feats["has_sqrt"]) else 0

    # ══ M. Complexity ══
    feats["total_ops"] = (feats["count_add"] + feats["count_sub"] +
                          feats["count_mul"] + feats["count_frac"] +
                          feats["count_pow"] + feats["count_mono"] +
                          feats["count_sqrt"])
    feats["is_simple"] = 1 if feats["total_ops"] <= 1 and feats["tree_depth"] <= 2 else 0

    return feats
