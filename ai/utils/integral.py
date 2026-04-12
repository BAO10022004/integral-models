import re
from utils.printer import Printer
from utils.expr.value.expr_var import VarExprNode
from solver.rules.mono_rule import mono_rule
from utils.expr.expr_mono import MonoExprNode
from solver.rules.const_rule import const_rule
from utils.expr.value.expr_const import ConstExprNode


class Integral:
    def __init__(self, latex: str):
            self.latex = latex.strip()

            self.left = None
            self.right = None
            self.dee = None
            self.integrand = None
            self.antiderivative =False
            self._parse_latex()
    def to_dict(self):
            return {
                "lower": self.left,
                "upper": self.right,
                "integrand": self.integrand.to_dict(),
                "dee": self.dee,
                "Antiderivative": self.antiderivative
            }
    
    def _parse_latex(self):
            from utils.parse import Parse
            limits = re.search(r'\\int_{(.*?)}\^{(.*?)}', self.latex)
            if limits:
                self.left = limits.group(1)
                self.right = limits.group(2)
            body, dee = re.split(r'(d[a-zA-Z])$', self.latex)[0:2]
            integrand = re.sub(r'\\int_{.*?}\^{.*?}', '', body)
            self.integrand = Parse.parse_latex(integrand, dee)
            self.dee = dee[1:]

    def __repr__(self):
            return (
                f"Integral(lower={self.left}, "
                f"upper={self.right}, "
                f"integrand={self.integrand}, "
                f"dee={self.dee}), "
                f"Antiderivative={self.antiderivative})")
  

    def calculate(self , var_values = None):
            Printer.print(self)
            if self.antiderivative == False :
                self.antiderivative_action()
                return self.calculate()
            else:
                r = self.integrand.calculate(self.right)
                l = self.integrand.calculate(self.left)
                if r is None or l is None:
                    raise ValueError("Không thể evaluate tích phân tại cận")
                print(float(r) - float(l))
                return float(r) - float(l)
    def antiderivative_action(self):
        expr = self.integrand
        value = self.can_antiderivative()
        if value == 0:
            return 
        self.antiderivative = True
        if value == 1:
            self.integrand = const_rule(expr, self.dee)
        if value == 2:
            self.integrand = var_rule(expr, self.dee)
        if value == 3:
            self.integrand = mono_rule(expr, self.dee)
    
    def can_antiderivative(self):
        expr = self.integrand
        if isinstance(expr, ConstExprNode):
            return 1
        if isinstance(expr , VarExprNode):
            return 2
        if isinstance(expr, MonoExprNode):
            if isinstance(expr.left, VarExprNode) and isinstance(expr.right, ConstExprNode):
                 return 3
        
        return 0