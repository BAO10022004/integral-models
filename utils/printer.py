from integral_models.utils.method import Method

class Printer:
    @staticmethod
    def print_tree(expr, indent="", last=True):
        if expr is None:
            return

        connector = "└── " if last else "├── "
        print(indent + connector + f"{expr.type}")

        indent += "    " if last else "│   "

        children = []
        if isinstance(expr.left, Method):
            children.append(expr.left)
        elif expr.left is not None:
            print(indent + "└── " + f"atom({expr.left})")

        if isinstance(expr.right, Method):
            children.append(expr.right)
        elif expr.right is not None:
            print(indent + "└── " + f"atom({expr.right})")

        for i, child in enumerate(children):
            Printer.print_tree(child, indent, i == len(children) - 1)
