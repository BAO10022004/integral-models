"""
rule_exp.py
-----------
∫ eˣ dx  =  eˣ + C

Dạng tổng quát:
    ∫ e^{f(x)} dx  — chỉ giải đúng khi f(x) = x đơn (action 0).
    Nếu f(x) = ax → cần u-sub (rule_usub).
"""

from ai.utils.expr.expr_exp    import ExpExprNode
from ai.utils.expr.value.expr_var import VarExprNode


def rule_exp(expr: ExpExprNode, dee: str):
    """
    Nguyên hàm của e^x:
        ∫ eˣ dx  =  eˣ

    Parameters
    ----------
    expr : ExpExprNode  — node e^{inner}
    dee  : str          — biến tích phân

    Returns
    -------
    ExpExprNode — e^{inner}  (nguyên hàm trùng với hàm gốc)
    """
    if not isinstance(expr, ExpExprNode):
        return expr
    if not (isinstance(expr.left, VarExprNode) and expr.left.left == dee):
        return expr

    # Nguyên hàm của e^x là chính nó
    return ExpExprNode(left=expr.left, var=dee)
