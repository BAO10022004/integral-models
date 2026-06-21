from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.value.expr_var import VarExprNode
from ai.utils.expr.operation.expr_add import AddExprNode
from ai.utils.expr.operation.expr_sub import SubExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode
from ai.utils.expr.operation.expr_frac import FracExprNode
from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.utils.expr.Power.expr_sqrt import SqrtExprNode
from ai.utils.expr.Power.expr_power import PowerExprNode
from ai.utils.expr.trig.expr_sin import SinExprNode
from ai.utils.expr.trig.expr_cos import CosExprNode
from ai.utils.expr.trig.expr_tan import TanExprNode
from ai.utils.expr.expr_log import LogExprNode
from ai.utils.expr.expr_exp import ExpExprNode
from ai.utils.expr.value.expr_pi import PiExprNode
from ai.utils.expr.value.expr_e import EExprNode

def derivative(expr: ExprNode, wrt: str = "x") -> ExprNode:

    if expr is None:
        return ConstExprNode(left=0.0)

    # 1. Hằng số / Pi -> 0
    if isinstance(expr, (ConstExprNode, PiExprNode, EExprNode)):
        return ConstExprNode(left=0.0)

    # 2. Biến số
    if isinstance(expr, VarExprNode):
        if expr.left == wrt:
            return ConstExprNode(left=1.0)
        else:
            return ConstExprNode(left=0.0)

    # 3. Phép cộng: (f + g)' = f' + g'
    if isinstance(expr, AddExprNode):
        df = derivative(expr.left, wrt)
        dg = derivative(expr.right, wrt)
        if isinstance(df, ConstExprNode) and df.left == 0.0:
            return dg
        if isinstance(dg, ConstExprNode) and dg.left == 0.0:
            return df
        return AddExprNode(left=df, right=dg, var=wrt)

    # 4. Phép trừ: (f - g)' = f' - g'
    if isinstance(expr, SubExprNode):
        df = derivative(expr.left, wrt)
        dg = derivative(expr.right, wrt)
        if isinstance(df, ConstExprNode) and df.left == 0.0:
            return MulExprNode(left=ConstExprNode(left=-1.0), right=dg, var=wrt)
        if isinstance(dg, ConstExprNode) and dg.left == 0.0:
            return df
        return SubExprNode(left=df, right=dg, var=wrt)

    # 5. Phép nhân: (f * g)' = f' * g + f * g'
    if isinstance(expr, MulExprNode):
        f = expr.left
        g = expr.right
        
        # Tối ưu (a * f(x))' = a * f'(x)
        if isinstance(f, ConstExprNode):
            return MulExprNode(left=f, right=derivative(g, wrt), var=wrt)
        if isinstance(g, ConstExprNode):
            return MulExprNode(left=derivative(f, wrt), right=g, var=wrt)
            
        df = derivative(f, wrt)
        dg = derivative(g, wrt)
        return AddExprNode(
            left=MulExprNode(left=df, right=g, var=wrt),
            right=MulExprNode(left=f, right=dg, var=wrt),
            var=wrt
        )

    # 6. Phép chia: (f / g)' = (f' * g - f * g') / g²
    if isinstance(expr, FracExprNode):
        f = expr.left
        g = expr.right
        df = derivative(f, wrt)
        dg = derivative(g, wrt)
        numerator = SubExprNode(
            left=MulExprNode(left=df, right=g, var=wrt),
            right=MulExprNode(left=f, right=dg, var=wrt),
            var=wrt
        )
        denominator = MonoExprNode(left=g, right=ConstExprNode(left=2.0), var=wrt)
        return FracExprNode(left=numerator, right=denominator, var=wrt)

    # 7. Hàm lũy thừa (Monomial): (u^n)' = n * u^(n-1) * u'
    if isinstance(expr, MonoExprNode):
        base = expr.left
        exp = expr.right
        if isinstance(exp, ConstExprNode):
            n = float(exp.left)
            dbase = derivative(base, wrt)
            
            if n == 0.0:
                return ConstExprNode(left=0.0)
            if n == 1.0:
                return dbase
                
            coeff = ConstExprNode(left=n)
            new_exp = ConstExprNode(left=n - 1.0)
            
            if n - 1.0 == 1.0:
                power_part = base
            else:
                power_part = MonoExprNode(left=base, right=new_exp, var=wrt)
                
            mul1 = MulExprNode(left=coeff, right=power_part, var=wrt)
            return MulExprNode(left=mul1, right=dbase, var=wrt)

    if isinstance(expr, SqrtExprNode):
        inner = expr.left
        d_inner = derivative(inner, wrt)
        denom = MulExprNode(
            left=ConstExprNode(left=2.0),
            right=expr,
            var=wrt
        )
        return FracExprNode(left=d_inner, right=denom, var=wrt)

    # 9. Hàm e^u: (e^u)' = u' * e^u
    if isinstance(expr, ExpExprNode):
        inner = expr.left
        d_inner = derivative(inner, wrt)
        return MulExprNode(left=d_inner, right=expr, var=wrt)

    # 10. Hàm ln(u): (ln u)' = u' / u
    if isinstance(expr, LogExprNode):
        inner = expr.left
        d_inner = derivative(inner, wrt)
        return FracExprNode(left=d_inner, right=inner, var=wrt)

    # 11. Hàm sin(u): (sin u)' = u' * cos(u)
    if isinstance(expr, SinExprNode):
        inner = expr.left
        d_inner = derivative(inner, wrt)
        return MulExprNode(
            left=d_inner,
            right=CosExprNode(left=inner, var=wrt),
            var=wrt
        )

    # 12. Hàm cos(u): (cos u)' = -u' * sin(u)
    if isinstance(expr, CosExprNode):
        inner = expr.left
        d_inner = derivative(inner, wrt)
        return MulExprNode(
            left=MulExprNode(left=ConstExprNode(left=-1.0), right=d_inner, var=wrt),
            right=SinExprNode(left=inner, var=wrt),
            var=wrt
        )

    # 13. Hàm tan(u): (tan u)' = u' * (1 + tan²u)
    if isinstance(expr, TanExprNode):
        inner = expr.left
        d_inner = derivative(inner, wrt)
        tan_sq = MonoExprNode(left=expr, right=ConstExprNode(left=2.0), var=wrt)
        one_plus_tan_sq = AddExprNode(left=ConstExprNode(left=1.0), right=tan_sq, var=wrt)
        return MulExprNode(left=d_inner, right=one_plus_tan_sq, var=wrt)

    # 14. Hàm a^u: (a^u)' = u' * a^u * ln(a)
    if isinstance(expr, PowerExprNode):
        base = expr.left
        exponent = expr.right
        d_exp = derivative(exponent, wrt)
        ln_base = LogExprNode(left=base, var=wrt)
        mul1 = MulExprNode(left=d_exp, right=expr, var=wrt)
        return MulExprNode(left=mul1, right=ln_base, var=wrt)

    return ConstExprNode(left=0.0)
