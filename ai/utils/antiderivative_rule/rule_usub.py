import math

from ai.utils.expr.expr_node            import ExprNode
from ai.utils.expr.value.expr_const     import ConstExprNode
from ai.utils.expr.value.expr_var       import VarExprNode
from ai.utils.expr.operation.expr_mul   import MulExprNode
from ai.utils.expr.operation.expr_add   import AddExprNode
from ai.utils.expr.operation.expr_sub   import SubExprNode
from ai.utils.expr.operation.expr_frac  import FracExprNode
from ai.utils.expr.trig.expr_sin        import SinExprNode
from ai.utils.expr.trig.expr_cos        import CosExprNode
from ai.utils.expr.trig.expr_tan        import TanExprNode
from ai.utils.expr.Power.expr_mono      import MonoExprNode
from ai.utils.expr.Power.expr_sqrt      import SqrtExprNode
from ai.utils.expr.expr_log             import LogExprNode
from ai.utils.expr.expr_exp             import ExpExprNode


# ──────────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────────

def _extract_a(inner: ExprNode, dee: str):
    """
    Trích hệ số a từ inner dạng ax, ax+b, ax-b, x+b, x-b.
    Trả về float a, hoặc None nếu không phải dạng tuyến tính.
    """
    # ax  →  MUL(const, var)
    if isinstance(inner, MulExprNode):
        L, R = inner.left, inner.right
        if isinstance(L, ConstExprNode) and isinstance(R, VarExprNode):
            return float(L.left)
        if isinstance(R, ConstExprNode) and isinstance(L, VarExprNode):
            return float(R.left)

    # x+b  hoặc  x-b
    if isinstance(inner, (AddExprNode, SubExprNode)):
        L, R = inner.left, inner.right
        # x ± b
        if isinstance(L, VarExprNode) and isinstance(R, ConstExprNode):
            return 1.0
        if isinstance(L, ConstExprNode) and isinstance(R, VarExprNode):
            return 1.0
        # ax ± b
        if isinstance(L, MulExprNode) and isinstance(R, ConstExprNode):
            LL, LR = L.left, L.right
            if isinstance(LL, ConstExprNode) and isinstance(LR, VarExprNode):
                return float(LL.left)
            if isinstance(LR, ConstExprNode) and isinstance(LL, VarExprNode):
                return float(LR.left)

    # x đơn (a = 1)
    if isinstance(inner, VarExprNode):
        return 1.0

    return None


def _scale(coeff: float, node: ExprNode, dee: str) -> ExprNode:
    """Nhân hệ số với node. Nếu coeff = 1 trả node luôn."""
    if coeff == 1.0:
        return node
    return MulExprNode(
        left  = ConstExprNode(left=coeff),
        right = node,
        var   = dee,
    )


# ──────────────────────────────────────────────────────────────────
# MAIN RULE
# ──────────────────────────────────────────────────────────────────

def rule_usub(expr: ExprNode, dee: str) -> ExprNode:
    """
    Áp dụng đổi biến u = ax+b cho biểu thức f(ax+b).

    Quy trình:
      1. Xác định inner = ax+b và trích a.
      2. Tính nguyên hàm F(u) theo u.
      3. Thay lại u = ax+b, nhân thêm (1/a).

    Parameters
    ----------
    expr : ExprNode  — root node (sin/cos/tan/mono/sqrt/exp/log/frac)
    dee  : str       — biến tích phân

    Returns
    -------
    ExprNode — nguyên hàm (1/a)·F(ax+b)
    """

    # ── sin(ax+b) → (-1/a)·cos(ax+b) ──────────────────────
    if isinstance(expr, SinExprNode):
        inner = expr.left
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        cos_node = CosExprNode(left=inner, var=dee)
        return _scale(-1.0 / a, cos_node, dee)

    # ── cos(ax+b) → (1/a)·sin(ax+b) ───────────────────────
    if isinstance(expr, CosExprNode):
        inner = expr.left
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        sin_node = SinExprNode(left=inner, var=dee)
        return _scale(1.0 / a, sin_node, dee)

    # ── tan(ax+b) → (-1/a)·ln|cos(ax+b)| ──────────────────
    if isinstance(expr, TanExprNode):
        inner = expr.left
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        cos_node = CosExprNode(left=inner, var=dee)
        log_node = LogExprNode(left=cos_node, var=dee)
        neg_log  = MulExprNode(left=ConstExprNode(left=-1), right=log_node, var=dee)
        return _scale(1.0 / a, neg_log, dee)

    # ── (ax+b)^n → (1/a)·(ax+b)^(n+1)/(n+1) ──────────────
    if isinstance(expr, MonoExprNode):
        inner = expr.left
        if not isinstance(expr.right, ConstExprNode):
            return expr
        n = float(expr.right.left)
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        if n == -1:
            # (ax+b)^{-1} = 1/(ax+b) → (1/a)·ln|ax+b|
            log_node = LogExprNode(left=inner, var=dee)
            return _scale(1.0 / a, log_node, dee)
        new_n = n + 1
        mono  = MonoExprNode(
            left  = inner,
            right = ConstExprNode(left=new_n),
            var   = dee,
        )
        # (1/(a·new_n)) · (ax+b)^new_n
        return _scale(1.0 / (a * new_n), mono, dee)

    # ── sqrt[n](ax+b) → (1/a)·(n/(n+1))·(ax+b)^((n+1)/n) ─
    if isinstance(expr, SqrtExprNode):
        inner = expr.left
        if not isinstance(expr.right, ConstExprNode):
            return expr
        try:
            n = float(expr.right.left)
        except (TypeError, ValueError):
            return expr
        a = _extract_a(inner, dee)
        if a is None or n == 0:
            return expr
        new_power = (n + 1) / n
        coeff     = 1.0 / (a * new_power)
        mono = MonoExprNode(
            left  = inner,
            right = ConstExprNode(left=new_power),
            var   = dee,
        )
        return _scale(coeff, mono, dee)

    # ── e^(ax+b) → (1/a)·e^(ax+b) ─────────────────────────
    if isinstance(expr, ExpExprNode):
        inner = expr.left
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        exp_node = ExpExprNode(left=inner, var=dee)
        return _scale(1.0 / a, exp_node, dee)

    # ── ln(ax+b) → (1/a)·[(ax+b)·ln(ax+b) − (ax+b)] ──────
    if isinstance(expr, LogExprNode):
        inner = expr.left
        a = _extract_a(inner, dee)
        if a is None:
            return expr
        log_node   = LogExprNode(left=inner, var=dee)
        u_ln_u     = MulExprNode(left=inner, right=log_node, var=dee)
        u_ln_u_m_u = SubExprNode(left=u_ln_u, right=inner, var=dee)
        return _scale(1.0 / a, u_ln_u_m_u, dee)

    # ── 1/(ax+b) → (1/a)·ln|ax+b| ─────────────────────────
    if isinstance(expr, FracExprNode):
        numer = expr.left
        denom = expr.right
        if isinstance(numer, ConstExprNode) and numer.left == 1:
            a = _extract_a(denom, dee)
            if a is None:
                return expr
            log_node = LogExprNode(left=denom, var=dee)
            return _scale(1.0 / a, log_node, dee)

    return expr  # fallback
