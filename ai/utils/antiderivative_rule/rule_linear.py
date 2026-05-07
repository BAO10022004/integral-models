"""
rule_linear.py
--------------
Quy tắc tuyến tính (Linearity Rule):
    ∫ [f(x) + g(x)] dx  =  ∫f(x)dx + ∫g(x)dx
    ∫ [f(x) - g(x)] dx  =  ∫f(x)dx - ∫g(x)dx
    ∫ c·f(x) dx         =  c · ∫f(x)dx

Rule này xử lý AddExprNode / SubExprNode / MulExprNode(const, func) tại root,
đệ quy gọi apply_basic_rule() cho từng nhánh.
"""

from ai.utils.expr.expr_node            import ExprNode
from ai.utils.expr.value.expr_const     import ConstExprNode
from ai.utils.expr.value.expr_var       import VarExprNode
from ai.utils.expr.operation.expr_add   import AddExprNode
from ai.utils.expr.operation.expr_sub   import SubExprNode
from ai.utils.expr.operation.expr_mul   import MulExprNode
from ai.utils.expr.trig.expr_sin        import SinExprNode
from ai.utils.expr.trig.expr_cos        import CosExprNode
from ai.utils.expr.trig.expr_tan        import TanExprNode
from ai.utils.expr.Power.expr_mono      import MonoExprNode
from ai.utils.expr.Power.expr_sqrt      import SqrtExprNode
from ai.utils.expr.operation.expr_frac  import FracExprNode
from ai.utils.expr.expr_log             import LogExprNode
from ai.utils.expr.expr_exp             import ExpExprNode


def apply_basic_rule(expr: ExprNode, dee: str) -> ExprNode:
    """
    Áp dụng nguyên hàm cơ bản cho một node đơn lẻ.
    Import lazy để tránh circular.
    """
    from ai.utils.antiderivative_rule.rule_const  import rule_const
    from ai.utils.antiderivative_rule.rule_var    import rule_var
    from ai.utils.antiderivative_rule.rule_mono   import rule_mono
    from ai.utils.antiderivative_rule.rule_frac   import rule_frac
    from ai.utils.antiderivative_rule.rule_sin    import rule_sin
    from ai.utils.antiderivative_rule.rule_cos    import rule_cos
    from ai.utils.antiderivative_rule.rule_tan    import rule_tan
    from ai.utils.antiderivative_rule.rule_exp    import rule_exp
    from ai.utils.antiderivative_rule.rule_log    import rule_log
    from ai.utils.antiderivative_rule.rule_sqrt   import rule_sqrt

    if isinstance(expr, ConstExprNode):
        return rule_const(expr, dee)
    if isinstance(expr, VarExprNode):
        return rule_var(expr, dee)
    if isinstance(expr, MonoExprNode):
        return rule_mono(expr, dee)
    if isinstance(expr, FracExprNode):
        return rule_frac(expr, dee)
    if isinstance(expr, SinExprNode):
        return rule_sin(expr, dee)
    if isinstance(expr, CosExprNode):
        return rule_cos(expr, dee)
    if isinstance(expr, TanExprNode):
        return rule_tan(expr, dee)
    if isinstance(expr, ExpExprNode):
        return rule_exp(expr, dee)
    if isinstance(expr, LogExprNode):
        return rule_log(expr, dee)
    if isinstance(expr, SqrtExprNode):
        return rule_sqrt(expr, dee)
    
    return expr 
