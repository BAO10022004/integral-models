"""
rule_cos.py
-----------
∫ cos(x) dx  =  sin(x) + C
"""

from ai.utils.expr.trig.expr_cos   import CosExprNode
from ai.utils.expr.trig.expr_sin   import SinExprNode


def rule_cos(expr: CosExprNode, dee: str):
    """
    Nguyên hàm của cos(x):
        ∫ cos(x) dx  =  sin(x)

    Parameters
    ----------
    expr : CosExprNode  — node cos(inner)
    dee  : str          — biến tích phân

    Returns
    -------
    SinExprNode — sin(inner)
    """
    if not isinstance(expr, CosExprNode):
        return expr

    return SinExprNode(left=expr.left, var=dee)
