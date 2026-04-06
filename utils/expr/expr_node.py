


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
    
    def simplify(self):
        raise NotImplementedError("Subclasses must implement simplify method")
    def is_leaf (self):
        raise NotImplementedError("Subclasses must implement is_end method")
    def caculate(self, var_values):
        raise NotImplementedError("Subclasses must implement calculate method")