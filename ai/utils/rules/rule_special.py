

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

SpecialFormulaRegistry.register(FracDecompositionFormula())
