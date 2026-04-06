from utils.action_data import ActionData
from utils.cutter_function.cutter_add import CutterAdd
from utils.expr.operation.expr_add import AddExprNode
from utils.expr.operation.expr_sub import SubExprNode
from utils.integral import Integral
from utils.printer import Printer
from utils.rules.factor import Factor


if __name__ == "__main__":
    latex = r"\int_{4}^{2}3*x+4*xdx"
    I = Integral(latex)
    add = AddExprNode()
    sub = SubExprNode()
    print("=== Trước simplify ===")
    Printer.print_tree(I.integrand)
    I.integrand = I.integrand.simplify()
    Printer.print_tree(I.integrand)
    if Factor.factor_common(I.integrand.left, I.integrand.right, sub) is not None:
        I.integrand = Factor.factor_common(I.integrand.left, I.integrand.right, sub)
        print("=== Sau factor ===")
        Printer.print_tree(I.integrand)
    
    action = ActionData(integral=latex)
    action.save()