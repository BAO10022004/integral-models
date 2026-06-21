
from ai.utils.expr.expr_node            import ExprNode
from ai.utils.expr.value.expr_const     import ConstExprNode
from ai.utils.expr.value.expr_var       import VarExprNode
from ai.utils.expr.operation.expr_frac  import FracExprNode
from ai.utils.expr.operation.expr_mul   import MulExprNode
from ai.utils.expr.expr_log             import LogExprNode
def rule_frac(expr: FracExprNode, dee: str):
    if not isinstance(expr, FracExprNode):
        return expr
    denom = expr.right
    numer = expr.left

    # Hỗ trợ tử số là hằng số
    if not isinstance(numer, ConstExprNode):
        return expr
    c = float(numer.left)

    # Trường hợp 1: mẫu số là x (VarExprNode) -> c * ln|x|
    if isinstance(denom, VarExprNode) and denom.left == dee:
        log_node = LogExprNode(
            left = VarExprNode(left=dee, var=dee),
            var  = dee,
        )
        if c == 1.0:
            return log_node
        return MulExprNode(left=numer, right=log_node, var=dee)

    # Trường hợp 2: mẫu số là x^n (MonoExprNode) -> -c / ((n-1) * x^(n-1))
    from ai.utils.expr.Power.expr_mono import MonoExprNode
    if isinstance(denom, MonoExprNode) and isinstance(denom.left, VarExprNode) and denom.left.left == dee:
        if isinstance(denom.right, ConstExprNode):
            n = float(denom.right.left)
            if n == 1.0:
                log_node = LogExprNode(
                    left = VarExprNode(left=dee, var=dee),
                    var  = dee,
                )
                if c == 1.0:
                    return log_node
                return MulExprNode(left=numer, right=log_node, var=dee)
            
            m = n - 1.0
            coeff = -c / m
            if m == 1.0:
                return FracExprNode(
                    left=ConstExprNode(left=coeff),
                    right=VarExprNode(left=dee, var=dee),
                    var=dee
                )
            else:
                return FracExprNode(
                    left=ConstExprNode(left=coeff),
                    right=MonoExprNode(
                        left=VarExprNode(left=dee, var=dee),
                        right=ConstExprNode(left=m),
                        var=dee
                    ),
                    var=dee
                )

    # Trường hợp 3: mẫu số là a(x+m)^2 + k (Delta < 0 -> Arctan)
    from ai.utils.expr.operation.expr_add import AddExprNode
    from ai.utils.expr.Power.expr_power import PowerExprNode
    from ai.utils.expr.Power.expr_mono import MonoExprNode
    if isinstance(denom, AddExprNode):
        if isinstance(denom.left, MulExprNode) and isinstance(denom.right, ConstExprNode):
            a_node = denom.left.left
            pow_node = denom.left.right
            if isinstance(a_node, ConstExprNode) and (isinstance(pow_node, PowerExprNode) or isinstance(pow_node, MonoExprNode)):
                if isinstance(pow_node.right, ConstExprNode) and pow_node.right.left == 2.0:
                    u_node = pow_node.left
                    a_val = float(a_node.left)
                    k_val = float(denom.right.left)
                    if a_val * k_val > 0: # Cùng dấu (Delta < 0)
                        import math
                        from ai.utils.expr.trig.expr_arctan import ArctanExprNode
                        K = k_val / a_val
                        sqrt_K = math.sqrt(K)
                        coeff = c / (a_val * sqrt_K)
                        
                        arctan_inner = FracExprNode(
                            left=u_node,
                            right=ConstExprNode(left=sqrt_K),
                            var=dee
                        )
                        arctan_node = ArctanExprNode(left=arctan_inner, var=dee)
                        if abs(coeff - 1.0) < 1e-9:
                            return arctan_node
                        return MulExprNode(left=ConstExprNode(left=coeff), right=arctan_node, var=dee)

    # Trường hợp 4: mẫu số là a(x+m)^2 (Nghiệm kép)
    if isinstance(denom, MulExprNode) and isinstance(denom.left, ConstExprNode) and (isinstance(denom.right, PowerExprNode) or isinstance(denom.right, MonoExprNode)):
        a_val = float(denom.left.left)
        pow_node = denom.right
        if isinstance(pow_node.right, ConstExprNode) and pow_node.right.left == 2.0:
            u_node = pow_node.left
            coeff = -c / a_val
            return FracExprNode(
                left=ConstExprNode(left=coeff),
                right=u_node,
                var=dee
            )

    return expr
