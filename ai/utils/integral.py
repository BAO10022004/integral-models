import re
from utils.action_data import ActionData
from utils.printer import Printer

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
        from utils.parse import Parse
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
  

  def calculate(self , var_values = None):
        if not self.antiderivative:
            return None
        r = self.integrand.calculate(self.right)
        l = self.integrand.calculate(self.left)
        print(r, l)
        if r is None or l is None:
            raise ValueError("Không thể evaluate tích phân tại cận")

        return float(r) - float(l)
