"""
rule_log.py
-----------
∫ ln(x) dx  =  x·ln(x) - x + C

Đây là trường hợp tích phân từng phần đặc biệt:
    u = ln(x)  →  du = 1/x dx
    dv = dx    →  v  = x
    ∫ ln(x) dx = x·ln(x) − ∫ x·(1/x) dx = x·ln(x) − x
"""

from ai.utils.expr.expr_log             import LogExprNode
from ai.utils.expr.value.expr_var       import VarExprNode
from ai.utils.expr.operation.expr_mul   import MulExprNode
from ai.utils.expr.operation.expr_sub   import SubExprNode


def rule_log(expr: LogExprNode, dee: str):
    """
    Nguyên hàm của ln(x):
        ∫ ln(x) dx  =  x·ln(x) − x

    Parameters
    ----------
    expr : LogExprNode  — node ln(inner)
    dee  : str          — biến tích phân

    Returns
    -------
    SubExprNode — x·ln(x) − x
    """
    if not isinstance(expr, LogExprNode):
        return expr

    var_node = VarExprNode(left=dee, var=dee)
    log_node = LogExprNode(left=expr.left, var=dee)

    # x · ln(x)
    x_times_lnx = MulExprNode(left=var_node, right=log_node, var=dee)

    # x·ln(x) − x
    return SubExprNode(left=x_times_lnx, right=var_node, var=dee)
