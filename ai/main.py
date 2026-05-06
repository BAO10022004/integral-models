from solver.rules.const_rule import const_rule
from solver.rules.mono_rule import mono_rule
from utils.action_data import ActionData
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
    latex = r"\int_{0}^{1}{x}^{2}*\ln{x}dx"
    
    message = []
    Integrand = []

    message.append("=== Biểu thức khởi tạo ===")
    I = Integral(latex)
    message, Integrand, I.integrand = I.integrand.simplify(message, Integrand)

    for m in message:
        print(m)
        Printer.print(I.integrand)

    # # I.integrand = EqualityRule.apply(I.integrand)
    # Step = MulExprNode(left=ConstExprNode(left=1), right=I)
    # # Step.right = IntegralRuleBase.apply(Step.right)
    # Printer.print(Step)
    # # print(Step.calculate())

    # action = ActionData(integral=latex)
    # action.save()