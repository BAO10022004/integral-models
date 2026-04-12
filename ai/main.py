from solver.rules.const_rule import const_rule
from solver.rules.mono_rule import mono_rule
from utils.action_data import ActionData
from utils.cutter_function.cutter_add import CutterAdd
from utils.expr.operation.expr_add import AddExprNode
from utils.expr.operation.expr_mul import MulExprNode
from utils.expr.operation.expr_sub import SubExprNode
from utils.expr.value.expr_const import ConstExprNode
from utils.integral import Integral
from utils.printer import Printer
from utils.rules.equality import EqualityRule
from utils.rules.exponential import Exponential
from utils.rules.factor import Factor
from solver.rules.linearity_rule import IntegralRuleBase
if __name__ == "__main__":
    latex = r"\int_{0}^{1}2*{x}^{1}dx"
    
    message = []
    Integrand = []

    message.append("=== Biểu thức khởi tạo ===")
    I = Integral(latex)
    message, Integrand, I.integrand = I.integrand.simplify(message, Integrand)

    for m in message:
        print(m)
        Printer.print(I.integrand)

    # I.integrand = EqualityRule.apply(I.integrand)
    Step = MulExprNode(left=ConstExprNode(left=1), right=I)
    Step.right = IntegralRuleBase.apply(Step.right)
    Printer.print(Step)
    Step.right.left = const_rule(Step.right.left)
    Step.right.right = mono_rule(Step.right.right )
    Printer.print(Step)


    i = Step.calculate()
    print(i)

    action = ActionData(integral=latex)
    action.save()