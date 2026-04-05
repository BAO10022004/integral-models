import math
import re

from sympy import latex

from integral_models.utils.helper import Helper
from integral_models.utils.method import Method

class Parse :
    @staticmethod
    def parse_latex(latex: str, dee: str):
        latex = latex.strip()
        latex = latex.replace("(", "{").replace(")", "}")
        var = dee[1:]
    
        for parser in(
        Parse.parse_add,     # +
        Parse.parse_sub,     # -
        Parse.parse_mul,     # *
        Parse.parse_div,     # /
        Parse.parse_frac,    # \frac

        # # function (phải TRƯỚC power)
        # parse_log,
        Parse.parse_sqrt,
        Parse.parse_trig,
        # parse_abs,
        # parse_exp,     # e^{...}

        # parse_power,   # ^

        Parse.parse_atom     
        ):
            node = parser(latex, dee, var)
            if node is not None:
                return node

        raise ValueError(f"Cannot parse: {latex}")
    
    @staticmethod
    def parse_atom(latex, dee, var):
        if Helper.is_integer(latex):
            return Method(type="const", left=int(latex), var=var)
    
        if latex == var:
            return Method(type="var", left=latex, var=var)

        return Method(type="atom", left=latex, var=var)
    @staticmethod
    def parse_add(latex, dee, var):
        add = Helper.split_top(latex, '+')
        if not add:
            return None
        return Method(
            type="add",
            left= Parse.parse_latex(add[0], dee),
            right=Parse.parse_latex(add[1], dee),
            var=var
        )
    @staticmethod
    def parse_sub(latex, dee, var):
        sub = Helper.split_top(latex, '-')
        if not sub:
            return None

        return Method(
            type="sub",
            left= Parse.parse_latex(sub[0], dee) ,
            right= Parse.parse_latex(sub[1], dee),
            var=var
        )
    @staticmethod
    def parse_div(latex, dee, var):
        div = Helper.split_top(latex, '/')
        if div:
            return Method(
                type="frac",
                left=Parse.parse_latex(div[0], dee),
                right=Parse.parse_latex(div[1], dee),
                var=var
            )
        return None
    @staticmethod
    def parse_mul(latex, dee, var):
        mul = Helper.split_top(latex, '*')
        if not mul:
            return None
        m = Method(
            type="mul",
            left=Parse.parse_latex(mul[0], dee),
            right=Parse.parse_latex(mul[1], dee),
            var=var
        )
        if m.left. m.right:
            m = Method(
                type="mono",
                left=m.left,
                right=Method(type="const", left=2, var=var),
                var=var
            )

        return m
    @staticmethod
    def parse_frac(latex, dee, var):
        frac = re.fullmatch(r'\\frac\{(.+)\}\{(.+)\}', latex)
        if not frac:
            return None
        method = Method(
            type="frac",
            left=Parse.parse_latex(frac.group(1), dee),
            right=Parse.parse_latex(frac.group(2), dee),
            var=var
        )
        if (method.left.type == "const" or method.left.type == "atom") and (method.right.type == "const" or method.right.type == "atom"):
            method = Method(
                type="div",
                left=method.left,
                right=method.right,
                var=var
            )
        return method
    @staticmethod
    def parse_trig(latex, dee, var):
        trig = re.fullmatch(r'\\(sin|cos|tan|cot)\{(.+)\}', latex)
        if trig:
            return Method(
                type=trig.group(1),
                left=Parse.parse_latex(trig.group(2), dee),
                right=None,
                var=var
            )
        return None

    @staticmethod
    def parse_sqrt(latex, dee, var):
        # căn bậc n
        sqrt_n = re.fullmatch(r'\\sqrt\[(.+)\]\{(.+)\}', latex)
        if sqrt_n:
            n = sqrt_n.group(1)
            inside = Parse.parse_latex(sqrt_n.group(2), dee)

            return Method(
                type="mono",
                left=inside,
                right=Method(type="const", left=float((1/int(n)))),
                var=var
                )

        # căn bậc 2
        sqrt = re.fullmatch(r'\\sqrt\{(.+)\}', latex)
        if sqrt:
            inside = Parse.parse_latex(sqrt.group(1).replace('\\', ''), dee)

            return Method(
                type="mono",
                left=inside,
                right=Method(type="const", left=0.5),
                var=var
            )

        return None


