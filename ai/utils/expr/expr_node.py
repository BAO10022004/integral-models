


################## Lớp trừu tượng để biểu diễn các hàm toán học##################

class ExprNode:
    def __init__(self,left=None, right=None, var=None):
        self.left = left
        self.right = right
        self.var = var
    
    def __repr__(self):
        return f"ExprNode(left={self.left}, right={self.right}, var={self.var})"
    
    def _equals(self, e):
        raise NotImplementedError("Subclasses must implement _equals method")
    
    def simplify(self, message = [], integral = []  ):
        raise NotImplementedError("Subclasses must implement simplify method")
    def is_leaf (self):
        raise NotImplementedError("Subclasses must implement is_end method")
    def calculate(self, var_values = None):
        raise NotImplementedError("Subclasses must implement calculate method")
    def has_function(self, func_name):
        raise NotImplementedError("Subclasses must implement has_function method")
    def cont_function(self, func_name):
        raise NotImplementedError("Subclasses must implement cont_function method")
    def is_function(self):
        raise NotImplementedError("Subclasses must implement is_function method")