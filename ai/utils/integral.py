import re
from ai.utils.printer import Printer
from ai.utils.expr.value.expr_var import VarExprNode
from ai.solver.rules.mono_rule import mono_rule
from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.solver.rules.const_rule import const_rule
from ai.utils.expr.value.expr_const import ConstExprNode


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
            from ai.utils.parse import Parse
            
            # Tìm cận bằng balanced brace matching thay vì regex non-greedy
            # để xử lý đúng \int_{0}^{\frac{\pi}{2}} etc.
            latex = self.latex
            
            # Tìm \int_ và parse lower bound
            int_pos = latex.find('\\int_')
            if int_pos == -1:
                return
            
            idx = int_pos + len('\\int_')
            
            # Parse lower bound: {....}
            lower, idx = self._extract_brace_content(latex, idx)
            self.left = lower
            
            # Skip ^
            if idx < len(latex) and latex[idx] == '^':
                idx += 1
            
            # Parse upper bound: {....}
            upper, idx = self._extract_brace_content(latex, idx)
            self.right = upper
            
            # Phần còn lại là body + dx
            rest = latex[idx:]
            body, dee = re.split(r'(d[a-zA-Z])$', rest)[0:2]
            self.integrand = Parse.parse_latex(body, dee)
            self.dee = dee[1:]
    
    @staticmethod
    def _extract_brace_content(s, idx):
        """Trích nội dung trong ngoặc nhọn {} với balanced matching."""
        if idx >= len(s) or s[idx] != '{':
            return '', idx
        depth = 0
        start = idx + 1
        for i in range(idx, len(s)):
            if s[i] == '{':
                depth += 1
            elif s[i] == '}':
                depth -= 1
                if depth == 0:
                    return s[start:i], i + 1
        return s[start:], len(s)

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