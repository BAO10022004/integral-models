import re
from integral_models.utils.action_data import ActionData
from integral_models.utils.helper import Helper
from integral_models.utils.printer import Printer

class Integral:
  def __init__(self, latex: str):
        self.latex = latex.strip()

        self.left = None
        self.right = None
        self.dee = None
        self.integrand = None
        self.antiderivative =False
        self._parse_latex()
  def to_dict(self):
        return {
            "lower": self.left,
            "upper": self.right,
            "integrand": self.integrand.to_dict(),
            "dee": self.dee,
            "Antiderivative": self.antiderivative
        }
  def _parse_latex(self):
        from integral_models.utils.parse import Parse
            # parse cận dưới & cận trên
        # parse cận dưới & cận trên
        limits = re.search(r'\\int_{(.*?)}\^{(.*?)}', self.latex)
        if limits:
            self.left = limits.group(1)
            self.right = limits.group(2)
        body, dee = re.split(r'(d[a-zA-Z])$', self.latex)[0:2]
        integrand = re.sub(r'\\int_{.*?}\^{.*?}', '', body)
        self.integrand = Parse.parse_latex(integrand, dee)
        self.dee = dee[1:]

  def __repr__(self):
        return (
            f"Integral(lower={self.left}, "
            f"upper={self.right}, "
            f"integrand={self.integrand}, "
            f"dee={self.dee}), "
            f"Antiderivative={self.antiderivative})")
  def integral_to_dict(self):
    return {
        "left": self.left,
        "right": self.right,
        "dee": self.dee,
        "integrand": expr_to_dict(self.integrand),
        "Antiderivative": self.antiderivative
    }
#   def calculate(self):
#     if not self.antiderivative:
#       return self.calculate_antiderivative()
#     else:
#       return self.calculate_integral()
#   def calculate_antiderivative(self):
#       if self.integrand.type == "const":
#           self.integrand = integral_const(self.integrand)
#           self.antiderivative = True
#           return self
#       if self.integrand.type == "var":
#           self.integrand = integral_var(self.integrand)
#           self.antiderivative = True
#           return self
#       if self.integrand.type == "mono":
#           self.integrand = integral_mono(self.integrand, self.dee[1:])
#           self.antiderivative = True
#           return self
#       if self.integrand.type == "frac":
#           self.integrand = integral_frac(self.integrand, self.dee[1:])
#           self.antiderivative = True
#           return self
#       if self.integrand.type == "frac":
#           self.integrand = integral_frac(self.integrand, self.dee[1:])
#           self.antiderivative = True
#           return self

#   def calculate_integral(self):
#     print(self)
#     if not self.antiderivative:
#         return None
#     r = evaluate_at(self.integrand, self.dee, self.right).calculate()
#     l = evaluate_at(self.integrand, self.dee, self.left).calculate()
#     print(r, l)
#     if r is None or l is None:
#         raise ValueError("Không thể evaluate tích phân tại cận")

#     return float(r) - float(l)
def expr_to_dict(e):
    if e is None:
        return None

    # hằng số
    if isinstance(e, (int, float, str)):
        return e

    # Expr / Method
    data = {
        "type": e.type
    }

    if e.type == "var":
        data["name"] = e.left
        return data

    if e.type == "const":
        data["value"] = e.left
        return data

    # node tổng quát
    data["left"] = expr_to_dict(e.left)
    data["right"] = expr_to_dict(e.right)
    data["var"] = e.var

    return data

if __name__ == "__main__":
    latex = r"\int_{4}^{2}x+\sqrt[3]{x*x}dx"
    I = Integral(latex)
    I.integrand = I.integrand.simplify()
    Printer.print_tree(I.integrand)
    action = ActionData(integral=latex)
    action.save()