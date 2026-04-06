from utils.expr.value.expr_const import ConstExprNode
from utils.expr.value.expr_var import VarExprNode

# Màu ANSI
RESET  = "\033[0m"
BOLD   = "\033[1m"
GRAY   = "\033[90m"
CYAN   = "\033[96m"
YELLOW = "\033[93m"
GREEN  = "\033[92m"
PINK   = "\033[95m"

KIND_COLOR = {
    "add": "\033[92m",   # xanh lá
    "sub": "\033[91m",   # đỏ
    "mul": "\033[93m",   # vàng
    "div": "\033[94m",   # xanh dương
    "frac": "\033[94m",
    "mono": "\033[95m",  # tím
    "sin": "\033[96m",   # cyan
    "cos": "\033[96m",
    "tan": "\033[96m",
    "log": "\033[96m",
    "ln":  "\033[96m",
}

class Printer:
    @staticmethod
    def print_tree(expr, indent="", last=True):
        if expr is None:
            return
        kind = type(expr).__name__
        connector = "└── " if last else "├── "
        child_indent = indent + ("    " if last else "│   ")

        # ── Lá: ConstExpr ──
        if isinstance(expr, ConstExprNode):
            print(f"{indent}{GRAY}{connector}{RESET}{YELLOW}{expr.left}{RESET}")
            return

        # ── Lá: VarExprNode ──
        if isinstance(expr, VarExprNode):
            print(f"{indent}{GRAY}{connector}{RESET}{GREEN}{expr.left}{RESET}")
            return

        # ── Node: có kind ──
        kind = type(expr).__name__
        color = KIND_COLOR.get(kind, PINK)
        print(f"{indent}{GRAY}{connector}{RESET}{BOLD}{color}[{kind}]{RESET}")

        children = []
        if hasattr(expr, 'left') and expr.left is not None:
            children.append(("left", expr.left))
        if hasattr(expr, 'right') and expr.right is not None:
            children.append(("right", expr.right))
        # node 1 con như sin, cos, ln
        if hasattr(expr, 'inner') and expr.inner is not None:
            children.append(("inner", expr.inner))

        for i, (label, child) in enumerate(children):
            is_last = (i == len(children) - 1)
            sub_connector = "└── " if is_last else "├── "
            sub_indent = child_indent + ("    " if is_last else "│   ")
            print(f"{child_indent}{GRAY}{sub_connector}{RESET}{GRAY}{label}:{RESET}")
            Printer.print_tree(child, sub_indent, True)

    @staticmethod
    def print(expr):
        print(f"\n{BOLD}{'─'*40}{RESET}")
        print(f"{BOLD}  AST Tree{RESET}")
        print(f"{BOLD}{'─'*40}{RESET}")
        Printer.print_tree(expr)
        print(f"{BOLD}{'─'*40}{RESET}\n")