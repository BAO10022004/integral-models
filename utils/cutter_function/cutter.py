from numpy import var
from utils.method import Method

class Cutter :

    @staticmethod
    def cutter(method : Method):
        if method.type == "mul":
            return Cutter.cutter_mul(method)
        return None
    @staticmethod
    def cutter_add (add : Method):
        ################### x + x  | const + const ###################
        if add.left.equals(add.right):
            if add.left.type == "const":
                add =  Method(
                    type="const",
                    left=add.left.left + add.right.left,
                    var=add.var 
                )
            else :
                add = Method(
                    type="mul",
                    left=Method(type="const", left=2, var=add.var),
                    right= add.left,
                    var=add.var 
                )
        ################### 2x + x  | 2x + 3x ###################
        if (add.left.type == "mul" or add.left.type == "var") and (add.right.type == "mul" or add.right.type == "var") :
            l =0
            if add.left.type =="mul":
                if add.right.type == "var":
                        l = add.left.left + 1
                else :
                        l = add.left.left + add.right.left
            if add.left.type =="var":
                if add.right.type == "mul":
                        l = add.right.left + 1
                else :
                        l = 2 
            add = Method(
                    type="mul",
                    left=Method(type="const", left=l, var=add.var),
                    right= add.left if add.left.type == "mul" else add.right,
                    var=add.var
                )  
        
         ################### x + 0  | 0 + x ###################
        if  add.left.left == 0:
                return add.right
        if  add.right.left == 0:
                return add.left
        return add
    @staticmethod
    def cutter_mul (mul):
        if mul.left.equals(mul.right):
            if mul.left.type == "const":
                mul = Method(
                    type="const",
                    left=mul.left.left * mul.right.left,
                    var=mul.var 
                )
            else :
                mul = Method(
                    type="mono",
                    left=mul.left,
                    right=Method(type="const", left=2, var=mul.var),
                    var=mul.var 
                )
        if mul.left == 0 or mul.right == 0:
                mul = Method(
                    type="const",
                    left=0,
                    var=mul.var 
                )
        if mul.left == 1 or mul.right == 1:
                return mul.left if mul.right == 1 else mul.right    
        return mul
    
    @staticmethod
    def cutter_mul (mul):
        if mul.left.equals(mul.right):
            if mul.left.type == "const":
                return Method(
                    type="const",
                    left=mul.left.left * mul.right.left,
                    var=mul.var 
                )
            else :
                m = Method(
                    type="mono",
                    left=mul.left,
                    right=Method(type="const", left=2, var=mul.var),
                    var=mul.var 
                )
        return mul