from integral_models.utils.method import Method
class Helper:
    @staticmethod
    def is_integer(n):
        try:
            float(n)
        except ValueError:
            return False
        else:
            return float(n).is_integer
    @staticmethod
    def is_atom_var(e, var):
        return isinstance(e, Method) and e.type == "atom" and e.left == var
    @staticmethod
    def is_const(method : Method):
            return method.type == "const"
    @staticmethod
    def is_atom_number(e):
        return isinstance(e, Method) and e.type == "atom" and Helper.is_integer(e.left)
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
    @staticmethod
    def parse_const(const: Method):
        """
            Lấy ra giá trị của hằng

            Args:
                const (Method): Chiều rộng của hình chữ nhật.
                => truyền vào là một class method
            Returns:
                float: Diện tích hình chữ nhật.
            Example:
                >>> parse_const(e) , e =  Expr(type=const, left=e, right=None, var=x)
                2.71
            """
        if const.left == "pi":
                return float(math.pi)
        if const.left == "e":
                return float(math.e)
        return float(const.left)