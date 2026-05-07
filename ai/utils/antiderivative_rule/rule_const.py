"""
rule_const.py
-------------
∫ c dx = c·x + C

SinExprNode.calculate(var) trả về giá trị số,
nên nguyên hàm phải là node có thể .calculate() được.
"""

from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.value.expr_var   import VarExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode


def rule_const(expr: ConstExprNode, dee: str):
    """
    Nguyên hàm của hằng số c:
        ∫ c dx  =  c·x

    Parameters
    ----------
    expr : ConstExprNode   — node hằng số (left = giá trị số)
    dee  : str             — biến tích phân ('x', 'y', ...)

    Returns
    -------
    ExprNode — node biểu diễn c·x
    """
    c = expr.left
    var_node = VarExprNode(left=dee, var=dee)

    if c == 0:
        return ConstExprNode(left=0)
    if c == 1:
        return var_node

    return MulExprNode(left=expr, right=var_node, var=dee)
