import copy
from utils.expr.operation.expr_add import AddExprNode
from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.operation.expr_sub import SubExprNode
from utils.expr.value.expr_const import ConstExprNode
from utils.integral import Integral


class IntegralRuleBase:
    @staticmethod
    def _clone(integral: Integral, new_integrand):
        """Tạo bản sao Integral với integrand mới."""
        new = copy.deepcopy(integral)
        new.integrand = new_integrand
        return new

    @staticmethod
    def apply(integral: Integral):
        if isinstance(integral.integrand, AddExprNode):
            return IntegralRuleBase.integral_rule_add(integral)
        if isinstance(integral.integrand, SubExprNode):
            return IntegralRuleBase.integral_rule_sub(integral)
        if isinstance(integral.integrand, MulExprNode):
            if isinstance(integral.integrand.left, ConstExprNode) or \
               isinstance(integral.integrand.right, ConstExprNode):
                return IntegralRuleBase.integral_rule_mul(integral)
        if isinstance(integral.integrand, ConstExprNode):
            return IntegralRuleBase.integral_rule_const(integral)
        return integral

    @staticmethod
    def integral_rule_add(integral: Integral):
        left  = IntegralRuleBase._clone(integral, integral.integrand.left)
        right = IntegralRuleBase._clone(integral, integral.integrand.right)
        return AddExprNode(left=left, right=right)

    @staticmethod
    def integral_rule_sub(integral: Integral):
        left  = IntegralRuleBase._clone(integral, integral.integrand.left)
        right = IntegralRuleBase._clone(integral, integral.integrand.right)
        return SubExprNode(left=left, right=right)

    @staticmethod
    def integral_rule_mul(integral: Integral):
        left  = IntegralRuleBase._clone(integral, integral.integrand.left)
        right = IntegralRuleBase._clone(integral, integral.integrand.right)
        return MulExprNode(left=left, right=right)

    @staticmethod
    def integral_rule_const(integral: Integral):
        left  = IntegralRuleBase._clone(integral, integral.integrand.left)
        right = IntegralRuleBase._clone(integral, integral.integrand.right)
        return MulExprNode(left=left, right=right)