"""
rule_power.py
-------------
∫ aˣ dx  =  aˣ / ln(a) + C

Dạng tổng quát:
    ∫ a^{f(x)} dx  — chỉ giải đúng khi f(x) = x đơn (action 0).
    Nếu f(x) = ax → cần u-sub (rule_usub).
"""

import math
from ai.utils.expr.Power.expr_power import PowerExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.value.expr_var   import VarExprNode
from ai.utils.expr.expr_log         import LogExprNode
from ai.utils.expr.operation.expr_frac import FracExprNode
from ai.utils.expr.expr_exp         import ExpExprNode


def rule_power(expr: PowerExprNode, dee: str):
    """
    Nguyên hàm của a^x:
        ∫ aˣ dx  =  aˣ / ln(a)

    Parameters
    ----------
    expr : PowerExprNode  — node a^{inner}
    dee  : str            — biến tích phân

    Returns
    -------
    ExprNode — aˣ / ln(a)
    """
    if not isinstance(expr, PowerExprNode):
        return expr
    if not (isinstance(expr.right, VarExprNode) and expr.right.left == dee):
        return expr
    if expr.left is None or not isinstance(expr.left, ConstExprNode):
        return expr

    base = float(expr.left.left)
    
    # Điều kiện để hàm mũ a^x tồn tại và có nghĩa: a > 0 và a != 1
    if base <= 0 or base == 1:
        return expr

    # Nếu cơ số xấp xỉ e, chuyển đổi thành e^x (ExpExprNode) để tối ưu hiển thị
    if abs(base - math.e) < 1e-9:
        return ExpExprNode(left=expr.right, var=dee)

    # a^x / ln(a)
    return FracExprNode(
        left=expr,
        right=LogExprNode(left=expr.left, var=dee),
        var=dee
    )
