from ai.utils import expr_utils
from ai.utils.expr.expr_node            import ExprNode
from ai.utils.expr.operation.expr_frac  import FracExprNode
from ai.utils.expr.value.expr_const     import ConstExprNode
from ai.utils.expr.value.expr_var       import VarExprNode
from ai.utils.expr.Power.expr_mono      import MonoExprNode
from ai.utils.expr.Power.expr_power     import PowerExprNode
from ai.utils.expr.operation.expr_add   import AddExprNode
from ai.utils.expr.operation.expr_sub   import SubExprNode
from ai.utils.expr.operation.expr_mul   import MulExprNode
from ai.utils.expr.expr_log             import LogExprNode
from ai.utils.expr_utils                import _extract_a, _is_polynomial_sum, _get_poly_degree,factor_quadratic_expr, check_double_linner, get_coef_linear, check_linear, check_parabola, get_coef_parabola,create_linear_expr, count_parabola_roots, get_parabola_roots
from ai.utils.antiderivative_rule.rule_usub import rule_usub
from ai.utils.derivative_rule          import derivative
class RuleFracFunction:

    @staticmethod
    def get_type(node: ExprNode) -> int:
        if not isinstance(node, FracExprNode):
            return 2
        denom = node.right
        if _is_polynomial_sum(denom):
            return 1
        return 2
    @staticmethod
    def check_function(node: ExprNode):
        if not isinstance(node, FracExprNode):
            return False
        dee = node.var if node.var is not None else "x"
        numer = node.left
        denom = node.right
        if isinstance(numer, (VarExprNode, MonoExprNode, ConstExprNode)):
            if isinstance(denom, (VarExprNode, MonoExprNode, ConstExprNode)):
                return True
        if isinstance(numer, ConstExprNode):
            if _extract_a(denom, dee) is not None:
                return True
            if isinstance(denom, MonoExprNode) and _extract_a(denom.left, dee) is not None:
                return True         
        return False
    @staticmethod
    def check_rule(node: ExprNode):
        if not isinstance(node, FracExprNode):
            return False
        left = node.left
        right = node.right
        if isinstance(left, ConstExprNode) and left.left == 1:
            return check_double_linner(right)
        return False
    @staticmethod
    def register(node: FracExprNode, dee: str):
        if not isinstance(node, FracExprNode):
            return None

        numer = node.left
        denom = node.right
        
        if RuleFracFunction.check_rule(node):
            return RuleFracFunction.solve_linear_denom(node, dee)
            
        if _is_polynomial_sum(numer) and _is_polynomial_sum(denom):
            from ai.utils.expr_utils import polynomial_division, _get_poly_degree
            deg_num = _get_poly_degree(numer)
            deg_den = _get_poly_degree(denom)
            ####### f'(x)/f(x) || a*f'(x)/f(x)
            left = node.left
            right = node.right
            # if derivative(node.right, dee) == node.left:
            #     return LogExprNode(left=node.right, var=dee)
            # div_result = polynomial_division(FracExprNode(left=derivative(node.right, dee), right=node.left, var=dee), dee)
            # if div_result is not None:
            #     q, r = div_result
            #     if q is not None and isinstance(q, ConstExprNode) and q.left != 0:
            #         if r is not None and isinstance(r, ConstExprNode) and abs(float(r.left)) < 1e-9:
            #             return MulExprNode(left=ConstExprNode(left=1/q.left), right=LogExprNode(left=node.right, var=dee))
            ###### bac tu >= bac mau
            if deg_num >= deg_den:
                q_node, r_node = polynomial_division(node, dee)
                if q_node is not None:
                    if isinstance(r_node, ConstExprNode) and abs(float(r_node.left)) < 1e-9:
                        return q_node
                    return AddExprNode(
                        left=q_node,
                        right=FracExprNode(left=r_node, right=denom, var=dee),
                        var=dee
                    )
            ###### bac tu < bac mau
            return RuleFracFunction.basic_register(node, dee)
        else:
            return RuleFracFunction.complex_register(node, dee)
    

    @staticmethod ## return a'/ax+b + b'/cx+d
    def solve_linear_denom(node: ExprNode, dee):
        linear_left = None ## a'/ax+b
        linear_right = None ## b'/cx+d
        if isinstance(node, FracExprNode):
            linear_left = node.right.left
            linear_right = node.right.right
        (a,b) = get_coef_linear(node.left)
        (c,d) = get_coef_linear(linear_left)
        (e,f) = get_coef_linear(linear_right)

        b_sub = ConstExprNode(left=(b*e-f*a)/(d*e-c*f))
        a_sub = ConstExprNode(left=(a-b_sub.left*c)/e)

        return AddExprNode(
            left=FracExprNode(left=a_sub, right=linear_left),
            right=FracExprNode(left=b_sub, right=linear_right),
            var=dee
        )
    @staticmethod #### return (1/a')*((ax+b)+(b'-b'))/(ax^2+bx+c)
    def uniformity_derivative(node: FracExprNode, dee: str):
        linear_left = None 
        parabol_right = None 
        if isinstance(node, FracExprNode):
            linear_left = node.left
            parabol_right = node.right
        (a,b) = get_coef_linear(linear_left)
        (c,d,e) = get_coef_parabola(parabol_right)
        
        a_sub = ConstExprNode(left=2*c/a)
        b_sub = ConstExprNode(left=d - 2*b*c/a)
        

        if abs(b_sub.left) < 1e-9 and abs(a_sub.left - 1.0) < 1e-9:
            return None
            
        return AddExprNode(
            left= MulExprNode(
                left= ConstExprNode(left=1/a_sub.left),
                right= FracExprNode(
                    left= derivative(parabol_right,dee),
                    right=parabol_right,
                    var=dee
                ),
                var=dee
            ),
            right= MulExprNode(
                left=ConstExprNode(left=-b_sub.left/a_sub.left),
                right=FracExprNode(left=ConstExprNode(left=1.0), right=parabol_right, var=dee),
                var=dee
            ),
            var=dee
        )

    @staticmethod
    def basic_register(expr: FracExprNode, dee: str):
        numer = expr.left
        denom = expr.right
        if isinstance(numer, ConstExprNode) and  numer.left != 1:
            return MonoExprNode(left=ConstExprNode(left=numer.left), right=FracExprNode(left=1, right=denom, var=dee), var=dee)
        ## dang 1/ax^n + bx^n-1 + ... + c
        if isinstance(numer, ConstExprNode):
            if _is_polynomial_sum(denom):
                if _get_poly_degree(denom) == 1:
                    return rule_usub(expr, dee)
                if _get_poly_degree(denom) == 2:
                    #### bac 2 co 2 nghiem
                    if count_parabola_roots(denom , dee)==2:
                        factored = factor_quadratic_expr(denom, dee)
                        if factored is None:
                            return None
                        return FracExprNode(
                        left=  numer,
                        right= MonoExprNode(
                            left=factored.left,
                            right=factored.right,
                            var=dee
                        ),
                        var=dee
                    ) 
                #### bậc 2 có 1 nghiệm (nghiệm kép)
                if count_parabola_roots(denom , dee)==1:
                    root = get_parabola_roots(denom , dee)[0]
                    a = get_coef_parabola(denom, dee)[0]
                    
                    # Tái cấu trúc thành: a * (x - root)^2
                    denom = MulExprNode(
                        left=ConstExprNode(left=a),
                        right=PowerExprNode(
                            left=create_linear_expr(1.0, -root, dee),
                            right=ConstExprNode(left=2.0)
                        )
                    )
                    return FracExprNode(left=numer, right=denom, var=dee)
                    
                #### bậc 2 vô nghiệm (Delta < 0)
                if count_parabola_roots(denom , dee)==0:
                    a, b, c = get_coef_parabola(denom, dee)
                    # Hoàn thành bình phương: a(x + b/2a)^2 + (c - b^2/4a)
                    b_sub = b / (2 * a)
                    k_sub = c - (b**2) / (4 * a)
                    
                    squared_part = MulExprNode(
                        left=ConstExprNode(left=a),
                        right=MonoExprNode(
                            left=create_linear_expr(1.0, b_sub, dee),
                            right=ConstExprNode(left=2.0),
                            var=dee
                        ),
                        var=dee
                    )
                    denom = AddExprNode(
                        left=squared_part,
                        right=ConstExprNode(left=k_sub),
                        var=dee
                    )
                    return FracExprNode(left=numer, right=denom, var=dee)
                        
        ## dang ax+b/ax^n + bx^n-1 + ... + c
        if check_linear(numer):
             if _is_polynomial_sum(denom):
                if _get_poly_degree(denom) == 2:
                    ####### ép kiểu thành dạng f'(x)/f(x)
                    return RuleFracFunction.uniformity_derivative(expr, dee)
        return None

    @staticmethod
    def complex_register(expr: FracExprNode, dee: str):
        return None