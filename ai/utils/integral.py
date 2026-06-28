import re
from ai.utils.printer import Printer
from ai.utils.expr.value.expr_var     import VarExprNode
from ai.utils.expr.value.expr_const   import ConstExprNode
from ai.utils.expr.Power.expr_mono    import MonoExprNode
from ai.utils.expr.Power.expr_sqrt    import SqrtExprNode
from ai.utils.expr.operation.expr_frac import FracExprNode
from ai.utils.expr.operation.expr_add  import AddExprNode
from ai.utils.expr.operation.expr_sub  import SubExprNode
from ai.utils.expr.operation.expr_mul  import MulExprNode
from ai.utils.expr.trig.expr_sin       import SinExprNode
from ai.utils.expr.trig.expr_cos       import CosExprNode
from ai.utils.expr.trig.expr_tan       import TanExprNode
from ai.utils.expr.expr_log            import LogExprNode
from ai.utils.expr.expr_exp            import ExpExprNode
from ai.utils.expr.Power.expr_power     import PowerExprNode
from ai.utils.antiderivative_rule.rule_linear import apply_basic_rule


class Integral:
    def __init__(self, latex: str):
            if not isinstance(latex, str):
                latex = str(latex)
            latex = latex.strip()
            # Clean trailing commas and digits (like ,11 or ,action)
            latex = re.sub(r',\d+$', '', latex)
            self.latex = latex

            self.left = None
            self.right = None
            self.dee = None
            self.integrand = None
            self.antiderivative = False
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
            latex = self.latex
            
            int_pos = latex.find('\\int_')
            if int_pos == -1:
                # Support indefinite integrals (e.g. \int f(x) dx)
                int_pos = latex.find('\\int')
                if int_pos == -1:
                    return
                idx = int_pos + len('\\int')
                self.left = None
                self.right = None
                self.antiderivative = True
            else:
                idx = int_pos + len('\\int_')
                
                lower, idx = self._extract_brace_content(latex, idx)
                self.left = lower
                
                if idx < len(latex) and latex[idx] == '^':
                    idx += 1
                
                upper, idx = self._extract_brace_content(latex, idx)
                self.right = upper
            
            rest = latex[idx:]
            parts = re.split(r'(d(?:\\?[a-zA-Z]+|[a-zA-Z]))$', rest)
            if len(parts) >= 2:
                body = parts[0]
                dee = parts[1]
            else:
                body = rest
                dee = "dx"
            self.integrand = Parse.parse_latex(body, dee)
            self.dee = dee[1:]
    
    @staticmethod
    def _extract_brace_content(s, idx):
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
        expr   = self.integrand
        result = apply_basic_rule(expr, self.dee)

        if result is expr:
            print(f"⚠️  Chưa có rule cho biểu thức: {type(expr).__name__}")
            return

        self.antiderivative = True
        self.integrand = result

    def can_antiderivative(self) -> bool:
        expr = self.integrand
        return isinstance(expr, (
            ConstExprNode, VarExprNode, MonoExprNode, SqrtExprNode,
            FracExprNode, AddExprNode, SubExprNode, MulExprNode,
            SinExprNode, CosExprNode, TanExprNode,
            LogExprNode, ExpExprNode, PowerExprNode,
        ))
