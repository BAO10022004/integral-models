"""
rule_var.py
-----------
∫ x dx = x²/2 + C  =  (1/2)·x²
"""

from ai.utils.expr.value.expr_const  import ConstExprNode
from ai.utils.expr.value.expr_var    import VarExprNode
from ai.utils.expr.Power.expr_mono   import MonoExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode


def rule_var(expr: VarExprNode, dee: str):
    """
    Nguyên hàm của biến đơn x:
        ∫ x dx  =  (1/2) · x²

    Parameters
    ----------
    expr : VarExprNode   — node biến (left = tên biến)
    dee  : str           — biến tích phân

    Returns
    -------
    MulExprNode — (1/2)·x²
    """
    if not isinstance(expr, VarExprNode) or expr.left != dee:
        return expr
    var_node  = VarExprNode(left=dee, var=dee)
    mono_node = MonoExprNode(
        left  = var_node,
        right = ConstExprNode(left=2),
        var   = dee,
    )
    return MulExprNode(
        left  = ConstExprNode(left=0.5),
        right = mono_node,
        var   = dee,
    )
