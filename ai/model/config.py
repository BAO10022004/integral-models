# config.py

# ──────────────────────────────────────────────────────────────────────────────
# ACTION MAP  (nhãn mới 0-5 — dùng trong model và solver)
# ──────────────────────────────────────────────────────────────────────────────
#   0 — apply_direct  : áp dụng công thức tích phân cơ bản trực tiếp
#   1 — apply_const   : rút hằng số ra ngoài   ∫ c·f(x) dx = c·∫ f(x) dx
#   2 — apply_split   : tách tổng / hiệu        ∫ (f±g) dx = ∫f dx ± ∫g dx
#   3 — apply_special : công thức đặc trưng     (khai triển, lượng giác, …)
#   4 — apply_usub    : đổi biến u = ax + b
#   5 — apply_byparts : tích phân từng phần     (IBP)
# ──────────────────────────────────────────────────────────────────────────────
ACTION_MAP = {
    0: 0,  # apply_direct
    1: 1,  # apply_const   — c * f(x)
    2: 2,  # apply_split   — f(x) ± g(x)
    3: 3,  # apply_special — công thức đặc trưng
    4: 4,  # apply_usub    — đổi biến u = ax + b
    5: 5,  # apply_byparts — tích phân từng phần (IBP)
}

# ──────────────────────────────────────────────────────────────────────────────
# LABEL REMAP  (nhãn cũ trong dataset.csv → nhãn mới)
# ──────────────────────────────────────────────────────────────────────────────
LABEL_REMAP = {
    0: 0,  # apply_direct  (old 0  → new 0)
    1: 1,  # apply_const   (old 1  → new 1)
    3: 2,  # apply_split   (old 3  → new 2)
    6: 3,  # apply_special (old 6  → new 3)
    7: 4,  # apply_usub    (old 7  → new 4)
    8: 5,  # apply_byparts (old 8  → new 5)
}

# Các nhãn cũ được giữ lại (loại bỏ nhãn ngoài danh sách này)
VALID_OLD_LABELS = set(LABEL_REMAP.keys())

NUM_ACTIONS = len(ACTION_MAP)   # = 6

EMBED_SIZE  = 128
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