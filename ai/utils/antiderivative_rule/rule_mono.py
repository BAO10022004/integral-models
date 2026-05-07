"""
rule_mono.py
------------
Quy tắc lũy thừa (Power Rule):
    ∫ xⁿ dx = xⁿ⁺¹ / (n+1) + C   (n ≠ -1)

Xử lý các dạng:
  - MonoExprNode(x, n)        →  x đơn mũ n
  - MonoExprNode(expr, n)     →  biểu thức mũ n (cần u-sub, nhưng rule này
                                  chỉ xử lý khi base là VarExprNode)
  - c · xⁿ  (MulExprNode)    →  (c/(n+1)) · xⁿ⁺¹
"""

from ai.utils.expr.expr_node          import ExprNode
from ai.utils.expr.value.expr_const   import ConstExprNode
from ai.utils.expr.value.expr_var     import VarExprNode
from ai.utils.expr.Power.expr_mono    import MonoExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode


def rule_mono(expr: MonoExprNode, dee: str):
    """
    Nguyên hàm của xⁿ:
        ∫ xⁿ dx  =  (1/(n+1)) · xⁿ⁺¹

    Parameters
    ----------
    expr : MonoExprNode
        - expr.left  = base (phải là VarExprNode hoặc expr đơn giản)
        - expr.right = số mũ n (ConstExprNode)
    dee  : str — biến tích phân

    Returns
    -------
    ExprNode — (1/(n+1))·xⁿ⁺¹, hoặc trả nguyên expr nếu không áp dụng được.
    """
    if not isinstance(expr, MonoExprNode):
        return expr
    if expr.right is None or not isinstance(expr.right, ConstExprNode):
        return expr  # mũ không phải hằng số → không xử lý

    n = float(expr.right.left)

    # Trường hợp đặc biệt: n = -1 → ∫ x⁻¹ dx = ln|x|  (xử lý ở rule_frac)
    if n == -1:
        from ai.utils.expr.expr_log import LogExprNode
        return LogExprNode(left=VarExprNode(left=dee, var=dee), var=dee)

    new_n    = n + 1
    coeff    = 1.0 / new_n

    return MulExprNode(
        left  = ConstExprNode(left=coeff),
        right = MonoExprNode(
            left  = expr.left,
            right = ConstExprNode(left=new_n),
            var   = dee,
        ),
        var = dee,
    )
