from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.value.expr_var import VarExprNode

RESET  = "\033[0m"
BOLD   = "\033[1m"
GRAY   = "\033[90m"
CYAN   = "\033[96m"
YELLOW = "\033[93m"
GREEN  = "\033[92m"
PINK   = "\033[95m"

KIND_COLOR = {
    "add": "\033[92m",
    "sub": "\033[91m",
    "mul": "\033[93m",
    "div": "\033[94m",
    "frac": "\033[94m",
    "mono": "\033[95m",
    "sin": "\033[96m",
    "cos": "\033[96m",
    "tan": "\033[96m",
    "log": "\033[96m",
    "ln":  "\033[96m",
}

class Printer:

    @staticmethod
    def expr_to_str(expr) -> str:
        if expr is None:
            return "?"

        from ai.utils.expr.value.expr_const import ConstExprNode
        from ai.utils.expr.value.expr_var import VarExprNode
        from ai.utils.expr.operation.expr_add import AddExprNode
        from ai.utils.expr.operation.expr_sub import SubExprNode
        from ai.utils.expr.operation.expr_mul import MulExprNode
        from ai.utils.expr.operation.expr_frac import FracExprNode
        from ai.utils.expr.Power.expr_mono import MonoExprNode
        from ai.utils.expr.trig.expr_sin import SinExprNode
        from ai.utils.expr.trig.expr_cos import CosExprNode
        from ai.utils.expr.trig.expr_tan import TanExprNode

        if isinstance(expr, ConstExprNode):
            v = expr.left
            return str(int(v)) if isinstance(v, float) and v == int(v) else str(v)

        if isinstance(expr, VarExprNode):
            return str(expr.left)

        if isinstance(expr, SinExprNode):
            return f"sin({Printer.expr_to_str(expr.left)})"
        if isinstance(expr, CosExprNode):
            return f"cos({Printer.expr_to_str(expr.left)})"
        if isinstance(expr, TanExprNode):
            return f"tan({Printer.expr_to_str(expr.left)})"

        if isinstance(expr, MonoExprNode):
            base = Printer.expr_to_str(expr.left)
            exp  = Printer.expr_to_str(expr.right)
            try:
                e = float(exp)
                if e == 0.5:
                    return f"√({base})"
                if 0 < e < 1:
                    n = int(round(1 / e))
                    return f"{n}√({base})"
            except (ValueError, TypeError):
                pass
            base_s = f"({base})" if any(op in base for op in ["+", "-", "*", "/"]) else base
            return f"{base_s}^{exp}"

        if isinstance(expr, FracExprNode):
            num = Printer.expr_to_str(expr.left)
            den = Printer.expr_to_str(expr.right)
            return f"({num})/({den})"

        if isinstance(expr, MulExprNode):
            l = Printer.expr_to_str(expr.left)
            r = Printer.expr_to_str(expr.right)
            l_s = f"({l})" if isinstance(expr.left,  (AddExprNode, SubExprNode)) else l
            r_s = f"({r})" if isinstance(expr.right, (AddExprNode, SubExprNode)) else r
            return f"{l_s} * {r_s}"

        if isinstance(expr, AddExprNode):
            return f"{Printer.expr_to_str(expr.left)} + {Printer.expr_to_str(expr.right)}"

        if isinstance(expr, SubExprNode):
            r = Printer.expr_to_str(expr.right)
            r_s = f"({r})" if isinstance(expr.right, (AddExprNode, SubExprNode)) else r
            return f"{Printer.expr_to_str(expr.left)} - {r_s}"

        return f"[{type(expr).__name__}]"

    @staticmethod
    def print_expr(expr, indent="", last=True):
        if expr is None:
            return

        connector    = "└── " if last else "├── "
        child_indent = indent + ("    " if last else "│   ")

        # Lá: chuỗi thô (vd: left/right của Integral là str)
        if isinstance(expr, str):
            print(f"{indent}{GRAY}{connector}{RESET}{CYAN}\"{expr}\"{RESET}")
            return

        # Lá: số thô
        if isinstance(expr, (int, float)):
            print(f"{indent}{GRAY}{connector}{RESET}{YELLOW}{expr}{RESET}")
            return

        if isinstance(expr, ConstExprNode):
            print(f"{indent}{GRAY}{connector}{RESET}{YELLOW}{expr.left}{RESET}")
            return

        if isinstance(expr, VarExprNode):
            print(f"{indent}{GRAY}{connector}{RESET}{GREEN}{expr.left}{RESET}")
            return

        from ai.utils.integral import Integral
        if isinstance(expr, Integral):
            print(f"{indent}{GRAY}{connector}{RESET}{BOLD}{CYAN}[Integral]{RESET}")
            
            # in lower, upper, dee
            meta = [
                ("lower", expr.left),
                ("upper", expr.right),
                ("dee",   expr.dee),
            ]
            for label, child in meta:
                print(f"{child_indent}{GRAY}├── {RESET}{GRAY}{label}:{RESET}")
                Printer.print_expr(child, child_indent + "│   ", True)

            # in integrand
            print(f"{child_indent}{GRAY}└── {RESET}{GRAY}integrand:{RESET}")
            
            # DEBUG
            
            Printer.print_expr(expr.integrand, child_indent + "    ", True)
            return

        kind  = type(expr).__name__
        color = KIND_COLOR.get(kind, PINK)
        print(f"{indent}{GRAY}{connector}{RESET}{BOLD}{color}[{kind}]{RESET}")

        children = []
        if hasattr(expr, 'left')  and expr.left  is not None:
            children.append(("left",  expr.left))
        if hasattr(expr, 'right') and expr.right is not None:
            children.append(("right", expr.right))
        if hasattr(expr, 'inner') and expr.inner is not None:
            children.append(("inner", expr.inner))

        for i, (label, child) in enumerate(children):
            is_last    = (i == len(children) - 1)
            sub_indent = child_indent + ("    " if is_last else "│   ")
            sub_conn   = "└── " if is_last else "├── "
            print(f"{child_indent}{GRAY}{sub_conn}{RESET}{GRAY}{label}:{RESET}")
            Printer.print_expr(child, sub_indent, True)

    @staticmethod
    def print_integral(integral):
        lo   = integral.left  or "?"
        hi   = integral.right or "?"
        dee  = f"d{integral.dee}" if integral.dee else "d?"
        body = Printer.expr_to_str(integral.integrand)

        width = max(len(body) + 6, 30)
        line  = "─" * width

        print(f"\n{BOLD}{line}{RESET}")
        print(f"  {CYAN}{hi}{RESET}")
        print(f"  {BOLD}∫{RESET}  {YELLOW}{body}{RESET}  {GREEN}{dee}{RESET}")
        print(f"  {CYAN}{lo}{RESET}")
        print(f"{BOLD}{line}{RESET}")
        antideriv = "có" if integral.antiderivative else "chưa"
        print(f"  {GRAY}Biến: {integral.dee}   Nguyên hàm: {antideriv}{RESET}")
        print(f"{BOLD}{line}{RESET}\n")

    @staticmethod
    def print(expr):
        from ai.utils.integral import Integral
        if expr is None:
            print("Biểu thức: ?")
            return
        if isinstance(expr, Integral):
            Printer.print_integral(expr)
        else:
            print(f"\n{BOLD}{'─'*40}{RESET}")
            print(f"{BOLD}  AST Tree{RESET}")
            print(f"{BOLD}{'─'*40}{RESET}")
            Printer.print_expr(expr)
            print(f"{BOLD}{'─'*40}{RESET}\n")