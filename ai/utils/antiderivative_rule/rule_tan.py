"""
rule_tan.py
-----------
∫ tan(x) dx  =  -ln|cos(x)| + C  =  (-1) · ln(cos(x))
"""

from ai.utils.expr.trig.expr_tan       import TanExprNode
from ai.utils.expr.trig.expr_cos       import CosExprNode
from ai.utils.expr.expr_log            import LogExprNode
from ai.utils.expr.value.expr_const    import ConstExprNode
from ai.utils.expr.operation.expr_mul  import MulExprNode


def rule_tan(expr: TanExprNode, dee: str):
    """
    Nguyên hàm của tan(x):
        ∫ tan(x) dx  =  -ln|cos(x)|  =  (-1) · ln(cos(x))

    Parameters
    ----------
    expr : TanExprNode  — node tan(inner)
    dee  : str          — biến tích phân

    Returns
    -------
    MulExprNode — (-1)·ln(cos(inner))
    """
    if not isinstance(expr, TanExprNode):
        return expr

    cos_node = CosExprNode(left=expr.left, var=dee)
    log_node = LogExprNode(left=cos_node, var=dee)

    return MulExprNode(
        left  = ConstExprNode(left=-1),
        right = log_node,
        var   = dee,
    )
