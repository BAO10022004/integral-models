"""
expr_to_latex.py
----------------
Chuyển đổi ExprNode → chuỗi LaTeX để có thể parse lại bằng Integral().

Dùng trong solver_engine khi cần tạo integral con (recursive step).
"""

from ai.utils.expr.expr_node            import ExprNode
from ai.utils.expr.value.expr_const     import ConstExprNode
from ai.utils.expr.value.expr_var       import VarExprNode
from ai.utils.expr.operation.expr_add   import AddExprNode
from ai.utils.expr.operation.expr_sub   import SubExprNode
from ai.utils.expr.operation.expr_mul   import MulExprNode
from ai.utils.expr.operation.expr_frac  import FracExprNode
from ai.utils.expr.Power.expr_mono      import MonoExprNode
from ai.utils.expr.Power.expr_sqrt      import SqrtExprNode
from ai.utils.expr.Power.expr_power     import PowerExprNode
from ai.utils.expr.trig.expr_sin        import SinExprNode
from ai.utils.expr.trig.expr_cos        import CosExprNode
from ai.utils.expr.trig.expr_tan        import TanExprNode
from ai.utils.expr.expr_log             import LogExprNode
from ai.utils.expr.expr_exp             import ExpExprNode
from ai.utils.expr.value.expr_pi        import PiExprNode
from ai.utils.expr.value.expr_e         import EExprNode


def expr_to_latex(expr: ExprNode, dee: str = "x") -> str:
    """
    Chuyển ExprNode thành chuỗi LaTeX tương thích với parse.py.

    Parameters
    ----------
    expr : ExprNode — node cần chuyển đổi
    dee  : str      — tên biến tích phân (mặc định "x")

    Returns
    -------
    str — chuỗi LaTeX, ví dụ: "{x}^{2}", "\\sin{x}", "3*{x}^{2}", ...
    """
    if expr is None:
        return "0"

    e = expr  # alias ngắn

    # ── Lá ──────────────────────────────────────────────────────────────────
    if isinstance(e, ConstExprNode):
        v = e.left
        if isinstance(v, float) and v == int(v):
            return str(int(v))
        # Làm tròn hợp lý để tránh float noise
        return str(round(float(v), 8)).rstrip("0").rstrip(".")

    if isinstance(e, PiExprNode):
        return r"\pi"

    if isinstance(e, EExprNode):
        return "e"

    if isinstance(e, VarExprNode):
        return str(e.left)

    # ── Lũy thừa ────────────────────────────────────────────────────────────
    if isinstance(e, MonoExprNode):
        base = expr_to_latex(e.left, dee)
        exp  = expr_to_latex(e.right, dee)
        return f"{{{base}}}^{{{exp}}}"

    if isinstance(e, PowerExprNode):
        base = expr_to_latex(e.left, dee)
        exp  = expr_to_latex(e.right, dee)
        return f"{{{base}}}^{{{exp}}}"

    if isinstance(e, SqrtExprNode):
        inner = expr_to_latex(e.left, dee)
        n_str = expr_to_latex(e.right, dee) if e.right else "2"
        return rf"\sqrt[{n_str}]{{{inner}}}"

    # ── Lượng giác ──────────────────────────────────────────────────────────
    if isinstance(e, SinExprNode):
        inner = expr_to_latex(e.left, dee)
        return rf"\sin{{{inner}}}"

    if isinstance(e, CosExprNode):
        inner = expr_to_latex(e.left, dee)
        return rf"\cos{{{inner}}}"

    if isinstance(e, TanExprNode):
        inner = expr_to_latex(e.left, dee)
        return rf"\tan{{{inner}}}"

    # ── Hàm mũ / log ────────────────────────────────────────────────────────
    if isinstance(e, ExpExprNode):
        exp = expr_to_latex(e.left, dee)
        return f"e^{{{exp}}}"

    if isinstance(e, LogExprNode):
        inner = expr_to_latex(e.left, dee)
        return rf"\ln{{{inner}}}"

    # ── Phép toán 2 ngôi ────────────────────────────────────────────────────
    if isinstance(e, FracExprNode):
        num = expr_to_latex(e.left, dee)
        den = expr_to_latex(e.right, dee)
        return rf"\frac{{{num}}}{{{den}}}"

    if isinstance(e, MulExprNode):
        l = expr_to_latex(e.left, dee)
        r = expr_to_latex(e.right, dee)
        # Wrap nếu bên trong có +/-
        if isinstance(e.left, (AddExprNode, SubExprNode)):
            l = f"({l})"
        if isinstance(e.right, (AddExprNode, SubExprNode)):
            r = f"({r})"
        return f"{l}*{r}"

    if isinstance(e, AddExprNode):
        l = expr_to_latex(e.left, dee)
        r = expr_to_latex(e.right, dee)
        return f"{l}+{r}"

    if isinstance(e, SubExprNode):
        l = expr_to_latex(e.left, dee)
        r = expr_to_latex(e.right, dee)
        # Wrap bên phải nếu có +/-
        if isinstance(e.right, (AddExprNode, SubExprNode)):
            r = f"({r})"
        return f"{l}-{r}"

    # Fallback
    return f"[{type(e).__name__}]"
