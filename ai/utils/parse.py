import math
import re
from ai.utils.expr.Power.expr_sqrt import SqrtExprNode
from ai.utils.expr.Power.expr_power import PowerExprNode
from ai.utils.expr.trig.expr_cos import CosExprNode
from ai.utils.expr.trig.expr_sin import SinExprNode
from ai.utils.expr.operation.expr_add import AddExprNode
from ai.utils.expr.trig.expr_tan import TanExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode
from ai.utils.expr.operation.expr_sub import SubExprNode
from ai.utils.expr.value.expr_var import VarExprNode
from ai.utils.expr.operation.expr_frac import FracExprNode
from ai.utils.expr.expr_log import LogExprNode
from ai.utils.expr.expr_exp import ExpExprNode
from ai.utils.expr.value.expr_pi import PiExprNode
from ai.utils.expr.value.expr_e import EExprNode

class Parse :

    
    @staticmethod
    def split_top(expr, op):
        depth = 0
        for i, c in enumerate(expr):
            if c in "{(":
                depth += 1
            elif c in "})":
                depth -= 1
            elif c == op and depth == 0:
                return expr[:i], expr[i+1:]
        return None
    @staticmethod
    def strip_outer_brackets(latex: str) -> str:
        while True:
            if (latex.startswith('(') and latex.endswith(')')) or \
            (latex.startswith('{') and latex.endswith('}')):
                depth = 0
                paired = False
                for i, c in enumerate(latex):
                    if c in "({":
                        depth += 1
                    elif c in ")}":
                        depth -= 1
                    if depth == 0:
                        paired = (i == len(latex) - 1)
                        break
                if paired:
                    latex = latex[1:-1].strip()
                    continue
            break
        return latex
    @staticmethod
    def parse_latex(latex: str, dee: str):
        latex = latex.strip()
        latex = re.sub(r'(\d+)([a-zA-Z\\(])', r'\1*\2', latex)
        latex = Parse.strip_outer_brackets(latex)
        var = dee[1:]

        for parser in(
        Parse.parse_add,     # +
        Parse.parse_sub,     # -
        Parse.parse_mul,     # *
        Parse.parse_div,     # /
        Parse.parse_frac,    # \frac
        Parse.parse_ln,      # \ln{...}
        Parse.parse_sqrt,    # \sqrt{...}
        Parse.parse_trig,    # \sin, \cos, \tan, \cot
        Parse.parse_exp,     # e^{...}
        Parse.parse_power,   # {base}^{exp} → PowerExprNode hoặc MonoExprNode
        Parse.parse_atom
        ):
            node = parser(latex, dee, var)
            if node is not None:
                return node

        return None
    
    @staticmethod
    def parse_atom(latex, dee, var):
        latex = latex.strip().strip('{}')
        
        if latex == var:
            return VarExprNode(left=var, var=var)
        
        if latex == 'e':
            return EExprNode()
        
        if latex in ('\\pi', 'pi', 'π'):
            return PiExprNode()
        
        try:
            return ConstExprNode(left=float(latex))
        except ValueError:
            pass
        
        return None
    @staticmethod
    def parse_add(latex, dee, var):
        add = Parse.split_top(latex, '+')
        if not add:
            return None
        return AddExprNode(
            left= Parse.parse_latex(add[0], dee),
            right=Parse.parse_latex(add[1], dee),
            var=var
        )
    @staticmethod
    def parse_sub(latex, dee, var):
        sub = Parse.split_top(latex, '-')
        if not sub:
            return None
        left_str, right_str = sub
        if left_str.strip() == '':
            left_node = ConstExprNode(left=0.0)
        else:
            left_node = Parse.parse_latex(left_str, dee)
        return SubExprNode(
            left=left_node,
            right=Parse.parse_latex(right_str, dee),
            var=var
        )
    @staticmethod
    def parse_div(latex, dee, var):
        div = Parse.split_top(latex, '/')
        if div:
            return FracExprNode(
                left=Parse.parse_latex(div[0], dee),
                right=Parse.parse_latex(div[1], dee),
                var=var
            )
        return None
    @staticmethod
    def parse_mul(latex, dee, var):
        mul = Parse.split_top(latex, '*')
        if not mul:
            return None
        m = MulExprNode(
            left=Parse.parse_latex(mul[0], dee),
            right=Parse.parse_latex(mul[1], dee),
            var=var
        )
        return m
    @staticmethod
    def parse_frac(latex, dee, var):
        frac = re.fullmatch(r'\\frac\{(.+)\}\{(.+)\}', latex)
        if not frac:
            return None
        return FracExprNode(
            left=Parse.parse_latex(frac.group(1), dee),
            right=Parse.parse_latex(frac.group(2), dee),
            var=var
        )
    @staticmethod
    def parse_trig(latex, dee, var):
        trig = re.fullmatch(r'\\?(sin|cos|tan|cot)[{(](.+)[})]', latex)
        if not trig:
            return None
        if trig:
            if trig.group(1) == "sin":
                return SinExprNode(
                    left=Parse.parse_latex(trig.group(2), dee),
                    var=var
                )
            if trig.group(1) == "cos":
                return CosExprNode(
                    left=Parse.parse_latex(trig.group(2), dee),
                    var=var
                )
            if trig.group(1) == "tan":
                return TanExprNode(
                    left=Parse.parse_latex(trig.group(2), dee),
                    var=var
                )
            if trig.group(1) == "cot":
                return FracExprNode(
                    left=1,
                    right=TanExprNode(
                        left=Parse.parse_latex(trig.group(2), dee),
                        var=var
                    ),
                    var=var
                )
    @staticmethod
    def parse_sqrt(latex, dee, var):
        # căn bậc n
        sqrt_n = re.fullmatch(r'\\?sqrt\[(.+)\][{(](.+)[})]', latex)
        if sqrt_n:
            n = sqrt_n.group(1)
            inside = Parse.parse_latex(sqrt_n.group(2), dee)

            return SqrtExprNode(
                left=inside,
                right=ConstExprNode(left=n),
                var=var
                )

        # căn bậc 2
        sqrt = re.fullmatch(r'\\?sqrt[{(](.+)[})]', latex)
        if sqrt:
            inside = Parse.parse_latex(sqrt.group(1).replace('\\', ''), dee)

            return SqrtExprNode(
                left=inside,
                right=ConstExprNode(left=2),
                var=var
                )

        return None
    @staticmethod
    def parse_power(latex, dee, var):
        power = Parse.split_top(latex, '^')
        if not power:
            return None
        base_str, exp_str = power
        # Strip outer braces from base and exp
        base_str = base_str.strip().strip('{}')
        exp_str = exp_str.strip().strip('{}')
        
        base = Parse.parse_latex(base_str, dee)
        exp = Parse.parse_latex(exp_str, dee)
        if base is None or exp is None:
            return None
        # c^x → PowerExprNode (hằng mũ biến, ví dụ: e^x, 2^x)
        if isinstance(base, (ConstExprNode, PiExprNode, EExprNode)) and not isinstance(exp, (ConstExprNode, PiExprNode, EExprNode)):
            return PowerExprNode(
                left=base,
                right=exp,
                var=var
            )
        # expr^n → MonoExprNode (biến mũ số, ví dụ: x^3, (x+1)^2)
        return MonoExprNode(
            left=base,
            right=exp,
            var=var
        )
    @staticmethod
    def parse_exp(latex, dee, var):
        exp_match = re.fullmatch(r'e\^\{(.+)\}', latex)
        if not exp_match:
            exp_match = re.fullmatch(r'e\^([a-zA-Z0-9.*+-]+)', latex)
        if not exp_match:
            return None
        return ExpExprNode(
            left=Parse.parse_latex(exp_match.group(1), dee),
            var=var
        )
    @staticmethod
    def parse_ln(latex, dee, var):
        """Parse \ln{...}, \ln(...), ln{...}, ln(...) → LogExprNode."""
        ln_match = re.fullmatch(r'\\?ln[{(](.+)[})]', latex)
        if not ln_match:
            return None
        return LogExprNode(
            left=Parse.parse_latex(ln_match.group(1), dee),
            var=var
        )
