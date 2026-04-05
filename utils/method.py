import math
from integral_models.utils import helper

class Method:
    def __init__(self, type=None, left=None, right=None, var=None):
        self.type = type
        self.left = left
        self.right = right
        self.var = var
    def __repr__(self):
        return f"Expr(type={self.type}, left={self.left}, right={self.right}, var={self.var})"

    def is_method_basic(self):
        """
        Nhận diện hàm đơn giản

        Args:
            không có
        Returns:
            boolean: True nếu hàm đơn gainr và ngược lại
        Example:
            >>> parse_const(e) , e =  Expr(type=const, left=e, right=None, var=x)
            true
            >>> parse_const(f) , f =  Expr(type=log, left=Expr(type=const, left=10, right=None, var=None), right=Expr(type=var, left=x, right=None, var=x), var=x)
            false
        """
        helper = Helper()
        return (
            (helper.is_atom_var(self.left, self.var) or helper.is_atom_number(self.left)) and
            (helper.is_atom_var(self.right, self.var) or helper.is_atom_number(self.right))
        )
    
    def simplify(self):
        from integral_models.utils.helper import Helper
        helper = Helper()
        """
        Hàm rút gọn đa thức
        Args:
            không có
        Returns:
            Method : Hàm rút gọn
        Example:
            >>> parse_const(e) , e = Expr(type=mono,
                                            left=Expr(type=mono,
                                                    left=Expr(type=var, left=x, right=None, var=x),
                                                    right=ExprExpr(type=const, left=2, right=None, var=x),
                                                    var=x),
                                            right=Expr(type=const, left=5, right=None, var=x),
                                            var=x)
            Expr(type=mono,
                left=Expr(type=const, left=2, right=None, var=x),
                right=Expr(type=const, left=10, right=None, var=x),
                var=x)
        """
        if self.type == "div" or self.type == "frac":
            self = self.simplify_fraction()
        
        if isinstance(self.left, Method):
            self.left = self.left.simplify()
        if isinstance(self.right, Method):
            self.right = self.right.simplify()
        if self.type in ("add", "sub", "mul"):
            if self.type  == "sub":
                if self.left.left == "" and self.left.right.type == "const":

                    Method(type="const", left= self.left.right * -1 , var=self.var)
            if helper.is_const(self.left) and helper.is_const(self.right):

                result = self.calculate()
                return Method(type="const", left=result, var=self.var)
        # ======== (x^a)^b = x^(a*b) =========
        if self.type == "mono":
            if isinstance(self.left, Method) and self.left.type == "mono":
                new_exp = self.left.right *  self.right.left if isinstance(self.right, Method) else self.right
                return Method(
                    type="mono",
                    left=self.left.left,
                    right=new_exp,
                    var=self.var
                )
        return self
            
    def simplify_fraction(self):
        from integral_models.utils.helper import Helper
        helper = Helper()
        if helper.is_const(self.left) and helper.is_const(self.right):
                result = self.calculate()
                return Method(type="const", left=result, var=self.var)
        # chỉ xử lý khi là phân số
        if self.type != "frac":
            return self

        left = self.left
        right = self.right

        # (a/b) / c → a / (b*c)
        if isinstance(left, Method) and left.type == "frac":
            return Method(
                type="frac",
                left=left.left,
                right=Method(
                    type="mul",
                    left=left.right,
                    right=right,
                    var=self.var
                ),
                var=self.var
            )

        # a / (b/c) → (a*c) / b
        if isinstance(right, Method) and right.type == "frac":
            return Method(
                type="frac",
                left=Method(
                    type="mul",
                    left=left,
                    right=right.right,
                    var=self.var
                ),
                right=right.left,
                var=self.var
            )

        # (a/b) / (c/d) → (a*d) / (b*c)
        if isinstance(left, Method) and left.type == "frac" and \
        isinstance(right, Method) and right.type == "frac":

            return Method(
                type="frac",
                left=Method(
                    type="mul",
                    left=left.left,
                    right=right.right,
                    var=self.var
                ),
                right=Method(
                    type="mul",
                    left=left.right,
                    right=right.left,
                    var=self.var
                ),
                var=self.var
            )

        return self
    
    def calculate(self):
      from integral_models.utils.helper import Helper
      """
      Hàm tính đa thức cơ bản
      Args:
          không có
      Returns:
          float : giá trị float của hàm cơ bản
      Example:
          >>> parse_const(e) , e = Expr(type=mono,
                                        left=Expr(type=const, left=2, right=None, var=x),
                                        right=Expr(type=const, left=5, right=None, var=x),
                                        var=x)
          25
      """
      helper = Helper()
      # ===== CONST =====
      if self.type == "const":
          return helper.parse_const(self.left)
      # ===== VAR =====
      if self.type == "var":
          return None
      # ===== BASIC =====
      left_val = helper.parse_const(self.left)
      right_val = helper.parse_const(self.right)
      if left_val is None or right_val is None:
          return None
      if self.type == "add":
              return left_val + right_val
      if self.type == "sub":
              return left_val - right_val
      if self.type == "mul":
              return left_val * right_val
      if self.type == "div":
              return left_val / right_val if right_val != 0 else None
      if self.type in ("frac") and right_val != 0:
              return left_val / right_val
      # ===== POWER =====
      if self.type == "mono" or self.type == "log":
          if left_val is None or right_val is None:
              return None
          return right_val ** left_val

      return None
