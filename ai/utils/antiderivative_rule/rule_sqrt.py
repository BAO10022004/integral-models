"""
rule_sqrt.py
------------
∫ √x dx  =  (2/3)·x^(3/2) + C
∫ ⁿ√x dx =  n/(n+1) · x^((n+1)/n) + C

SqrtExprNode: left = inner, right = ConstExprNode(n) (bậc căn)
  - sqrt[2]{x}  →  left=x, right=2
  - sqrt[3]{x}  →  left=x, right=3

Công thức: √[n]{x} = x^(1/n)
  → nguyên hàm = x^(1/n + 1) / (1/n + 1)  =  (n/(n+1)) · x^((n+1)/n)
"""

from ai.utils.expr.Power.expr_sqrt     import SqrtExprNode
from ai.utils.expr.Power.expr_mono     import MonoExprNode
from ai.utils.expr.value.expr_const    import ConstExprNode
from ai.utils.expr.value.expr_var      import VarExprNode
from ai.utils.expr.operation.expr_mul  import MulExprNode


def rule_sqrt(expr: SqrtExprNode, dee: str):
    """
    Nguyên hàm của căn bậc n của x:
        ∫ x^(1/n) dx  =  [n/(n+1)] · x^((n+1)/n)

    Parameters
    ----------
    expr : SqrtExprNode
        - expr.left  = inner expression (biến x)
        - expr.right = ConstExprNode(n) — bậc căn
    dee  : str — biến tích phân

    Returns
    -------
    MulExprNode — coeff · x^new_power
    """
    if not isinstance(expr, SqrtExprNode):
        return expr
    if expr.right is None or not isinstance(expr.right, ConstExprNode):
        return expr

    try:
        n = float(expr.right.left)
    except (TypeError, ValueError):
        return expr

    if n == 0:
        return expr

    # Mũ mới: 1/n + 1 = (n+1)/n
    new_power = (n + 1) / n
    # Hệ số: 1 / new_power = n/(n+1)
    coeff = 1.0 / new_power

    return MulExprNode(
        left  = ConstExprNode(left=coeff),
        right = MonoExprNode(
            left  = expr.left,
            right = ConstExprNode(left=new_power),
            var   = dee,
        ),
        var = dee,
    )
