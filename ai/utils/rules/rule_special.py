

from abc import ABC, abstractmethod
from typing import Optional
from ai.utils.expr.expr_node import ExprNode

class SpecialFormula(ABC):

    
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def is_match(self, expr: ExprNode, dee: str) -> bool:

        pass

    @abstractmethod
    def apply(self, expr: ExprNode, dee: str) -> ExprNode:

        pass


class SpecialFormulaRegistry:

    _formulas: list[SpecialFormula] = []

    @classmethod
    def register(cls, formula: SpecialFormula):
        cls._formulas.append(formula)

    @classmethod
    def get_formulas(cls) -> list[SpecialFormula]:
        return cls._formulas

    @classmethod
    def apply_first_match(cls, expr: ExprNode, dee: str) -> tuple[Optional[ExprNode], Optional[str]]:
        for formula in cls._formulas:
            if formula.is_match(expr, dee):
                new_expr = formula.apply(expr, dee)
                return new_expr, formula.name
        return None, None


from ai.utils.expr.operation.expr_frac import FracExprNode

class FracDecompositionFormula(SpecialFormula):
    @property
    def name(self) -> str:
        return "Tách phân thức (Partial Fractions)"

    def is_match(self, expr: ExprNode, dee: str) -> bool:
        if not isinstance(expr, FracExprNode):
            return False
        from ai.utils.antiderivative_rule.rule_frac_func import RuleFracFunction
        res = RuleFracFunction.register(expr, dee)
        return res is not None and not res._equals(expr)

    def apply(self, expr: ExprNode, dee: str) -> ExprNode:
        from ai.utils.antiderivative_rule.rule_frac_func import RuleFracFunction
        return RuleFracFunction.register(expr, dee)


class TrigDoubleAngleFormula(SpecialFormula):
    @property
    def name(self) -> str:
        return "Công thức lượng giác nhân đôi"

    def is_match(self, expr: ExprNode, dee: str) -> bool:
        from ai.utils.expr.operation.expr_mul import MulExprNode
        from ai.utils.expr.trig.expr_sin import SinExprNode
        from ai.utils.expr.trig.expr_cos import CosExprNode
        
        if not isinstance(expr, MulExprNode):
            return False
        L, R = expr.left, expr.right
        if isinstance(L, SinExprNode) and isinstance(R, CosExprNode):
            return L.left._equals(R.left)
        if isinstance(L, CosExprNode) and isinstance(R, SinExprNode):
            return L.left._equals(R.left)
        return False

    def apply(self, expr: ExprNode, dee: str) -> ExprNode:
        from ai.utils.expr.operation.expr_mul import MulExprNode
        from ai.utils.expr.trig.expr_sin import SinExprNode
        from ai.utils.expr.value.expr_const import ConstExprNode
        
        L, R = expr.left, expr.right
        u = L.left
        two = ConstExprNode(left=2)
        two_u = MulExprNode(left=two, right=u, var=dee)
        sin_2u = SinExprNode(left=two_u, var=dee)
        return FracExprNode(left=sin_2u, right=two, var=dee)


class TrigSquaredFormula(SpecialFormula):
    @property
    def name(self) -> str:
        return "Công thức hạ bậc lượng giác (bình phương)"

    def is_match(self, expr: ExprNode, dee: str) -> bool:
        from ai.utils.expr.Power.expr_mono import MonoExprNode
        from ai.utils.expr.Power.expr_power import PowerExprNode
        from ai.utils.expr.trig.expr_sin import SinExprNode
        from ai.utils.expr.trig.expr_cos import CosExprNode
        from ai.utils.expr.value.expr_const import ConstExprNode
        
        if not isinstance(expr, (MonoExprNode, PowerExprNode)):
            return False
        base, exponent = expr.left, expr.right
        if not isinstance(exponent, ConstExprNode) or abs(exponent.left - 2) > 1e-9:
            return False
        return isinstance(base, (SinExprNode, CosExprNode))

    def apply(self, expr: ExprNode, dee: str) -> ExprNode:
        from ai.utils.expr.operation.expr_add import AddExprNode
        from ai.utils.expr.operation.expr_sub import SubExprNode
        from ai.utils.expr.operation.expr_mul import MulExprNode
        from ai.utils.expr.trig.expr_cos import CosExprNode
        from ai.utils.expr.trig.expr_sin import SinExprNode
        from ai.utils.expr.value.expr_const import ConstExprNode
        
        base = expr.left
        u = base.left
        two = ConstExprNode(left=2)
        two_u = MulExprNode(left=two, right=u, var=dee)
        cos_2u = CosExprNode(left=two_u, var=dee)
        
        if isinstance(base, SinExprNode):
            numerator = SubExprNode(left=ConstExprNode(left=1), right=cos_2u, var=dee)
        else:
            numerator = AddExprNode(left=ConstExprNode(left=1), right=cos_2u, var=dee)
            
        return FracExprNode(left=numerator, right=two, var=dee)


SpecialFormulaRegistry.register(FracDecompositionFormula())
SpecialFormulaRegistry.register(TrigDoubleAngleFormula())
SpecialFormulaRegistry.register(TrigSquaredFormula())

