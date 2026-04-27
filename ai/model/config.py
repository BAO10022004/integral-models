# config.py

ACTION_MAP = {
    -1: 0,  # apply integral
    0: 1,   # unknown
    1: 2,   # equality
    2: 3,   # expand
    3: 4,   # factor
    4: 5,   # power
    5: 6,   # split
    6: 7,   # substitution
    7: 8,   # by parts
    8: 9    # apply bounds
}

NUM_ACTIONS = len(ACTION_MAP)

EMBED_SIZE = 128
HIDDEN_SIZE = 256


import re
import random

class LatexGenerator:

    def __init__(self):
        # regex patterns
        self.patterns = {
            "pow": re.compile(r"\{(.+)\}\^\{?(.+?)\}?"),
            "sqrt": re.compile(r"\\sqrt\[(.+)\]\{(.+)\}"),
            "trig": re.compile(r"\\(sin|cos|tan|cot)\{(.+)\}"),
            "frac": re.compile(r"\\frac\{(.+)\}\{(.+)\}")
        }

        self.vars = ['x', 'x+1', '2*x', 'x^2']
        self.funcs = ['sin', 'cos', 'tan']

    # =============================
    # SPLIT TOP LEVEL
    # =============================
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

    
    # =============================
    # GENERATE BASIC EXPRESSIONS
    # =============================
    def gen_var(self):
        return random.choice(self.vars)

    def gen_pow(self):
        base = self.gen_var()
        exp = random.randint(2, 4)
        return f"{{{base}}}^{{{exp}}}"

    def gen_trig(self):
        func = random.choice(self.funcs)
        inner = self.gen_var()
        return f"\\{func}{{{inner}}}"

    def gen_frac(self):
        a = self.gen_var()
        b = self.gen_var()
        return f"\\frac{{{a}}}{{{b}}}"

    def gen_sqrt(self):
        a = random.randint(2, 3)
        b = self.gen_var()
        return f"\\sqrt[{a}]{{{b}}}"

    # =============================
    # COMPOSE EXPRESSIONS
    # =============================
    def gen_expr(self, depth=2):
        if depth == 0:
            return self.gen_var()

        choice = random.choice([
            "add", "mul", "pow", "trig", "frac", "sqrt"
        ])

        if choice == "add":
            return f"{self.gen_expr(depth-1)}+{self.gen_expr(depth-1)}"

        if choice == "mul":
            return f"{self.gen_expr(depth-1)}*{self.gen_expr(depth-1)}"

        if choice == "pow":
            return self.gen_pow()

        if choice == "trig":
            return self.gen_trig()

        if choice == "frac":
            return self.gen_frac()

        if choice == "sqrt":
            return self.gen_sqrt()

    # =============================
    # GENERATE DATASET
    # =============================
    def generate_dataset(self, n=100):
        data = []
        for _ in range(n):
            expr = self.gen_expr(depth=3)
            data.append({
                "integrand": "\\int_{0}^{1}"+expr+"dx",
                "action": "0"
            })
        return data