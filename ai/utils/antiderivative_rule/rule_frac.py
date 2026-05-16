"""
rule_frac.py
------------
Quy tắc phân số cơ bản:
    ∫ 1/x dx  =  ln|x| + C
    ∫ c/x dx  =  c · ln|x| + C
"""

from ai.utils.expr.expr_node            import ExprNode
from ai.utils.expr.value.expr_const     import ConstExprNode
from ai.utils.expr.value.expr_var       import VarExprNode
from ai.utils.expr.operation.expr_frac  import FracExprNode
from ai.utils.expr.operation.expr_mul   import MulExprNode
from ai.utils.expr.expr_log             import LogExprNode


def rule_frac(expr: FracExprNode, dee: str):
    """
    Nguyên hàm của phân số c/x:
        ∫ 1/x dx  =  ln|x|
        ∫ c/x dx  =  c · ln|x|

    Chỉ xử lý khi mẫu là VarExprNode (x đơn thuần).
    Các dạng phức tạp hơn (1/(x²+1), ...) không thuộc rule này.

    Parameters
    ----------
    expr : FracExprNode
        - expr.left  = tử số (ConstExprNode)
        - expr.right = mẫu số (VarExprNode)
    dee  : str — biến tích phân

    Returns
    -------
    ExprNode — ln|x| hoặc c·ln|x|
    """
    if not isinstance(expr, FracExprNode):
        return expr

    denom = expr.right
    numer = expr.left

    # Chỉ xử lý mẫu là biến đơn
    if not isinstance(denom, VarExprNode) or denom.left != dee:
        return expr

    log_node = LogExprNode(
        left = VarExprNode(left=dee, var=dee),
        var  = dee,
    )

    # Tử = 1  →  ln|x|
    if isinstance(numer, ConstExprNode) and numer.left == 1:
        return log_node

    # Tử = c  →  c · ln|x|
    if isinstance(numer, ConstExprNode):
        return MulExprNode(left=numer, right=log_node, var=dee)

    # Trường hợp khác: trả nguyên
    return expr
