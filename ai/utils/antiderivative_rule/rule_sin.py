"""
rule_sin.py
-----------
∫ sin(x) dx  =  -cos(x) + C
"""

from ai.utils.expr.trig.expr_sin       import SinExprNode
from ai.utils.expr.trig.expr_cos       import CosExprNode
from ai.utils.expr.value.expr_const    import ConstExprNode
from ai.utils.expr.operation.expr_mul  import MulExprNode
from ai.utils.expr.value.expr_var      import VarExprNode


def rule_sin(expr: SinExprNode, dee: str):
    """
    Nguyên hàm của sin(x):
        ∫ sin(x) dx  =  -cos(x)  =  (-1) · cos(x)

    Parameters
    ----------
    expr : SinExprNode  — node sin(inner)
    dee  : str          — biến tích phân

    Returns
    -------
    MulExprNode — (-1)·cos(inner)
    """
    if not isinstance(expr, SinExprNode):
        return expr
    if not (isinstance(expr.left, VarExprNode) and expr.left.left == dee):
        return expr

    cos_node = CosExprNode(left=expr.left, var=dee)

    # -cos(x)  =  (-1) · cos(x)
    return MulExprNode(
        left  = ConstExprNode(left=-1),
        right = cos_node,
        var   = dee,
    )
