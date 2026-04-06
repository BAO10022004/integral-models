


# from utils.method import Method





class CutterAdd :
    @staticmethod
    def cutter(method: Method):
        from utils.method import Method
        if method is None:
            return None

        # Đệ quy xuống trước
        if isinstance(method.left, Method):
            method.left = CutterAdd.cutter(method.left)

        if isinstance(method.right, Method):
            method.right = CutterAdd.cutter(method.right)

        # Xử lý node hiện tại
        if method.type == "add":
            method = CutterAdd.balance(method)
            method = CutterAdd.same(method)
        if method.type == "sub":
            # x - a → x + (-1 * a)
            return Method(
                type="add",
                left=method.left,
                right=Method(
                    type="mul",
                    left=Method(type="const", left=-1),
                    right=method.right
                )
            )
        return method
    @staticmethod
    def same(method : Method):
        if method.left.equals(method.right):
            if method.left.type == "const":
                method =  Method(
                    type="const",
                    left=method.left.left + method.right.left,
                    var=method.var 
                )
            else :
                method = Method(
                    type="mul",
                    left=Method(type="const", left=2, var=method.var),
                    right= method.left,
                    var=method.var 
                )    
        return method
    @staticmethod
    def balance(method : Method):
        from utils.method import Method    
        if method.type != "add":
            return method

        left = method.left
        right = method.right

        # Helper: tách (hệ số, biến)
        def extract(node):
            # x → (1, x)
            if node.type == "var":
                return Method(type="const", left=1), node

            # a*x → (a, x)
            if node.type == "mul":
                if node.left.type == "const" and node.right.type == "var":
                    return node.left, node.right
                if node.right.type == "const" and node.left.type == "var":
                    return node.right, node.left

            return None, None

        a1, var1 = extract(left)
        a2, var2 = extract(right)

        # Nếu cùng biến → đặt nhân tử chung
        if var1 is not None and var2 is not None and var1.left == var2.left:

            # (a + b)
            new_coef = Method(
                type="add",
                left=a1,
                right=a2
            ).simplify()

            # x*(a+b)
            return Method(
                type="mul",
                left=var1,
                right=new_coef
            )

        return method
            
    # @staticmethod
    # def permutation(method : Method):
    #     ################### 2x + (3x + 1)  | 2x + (3x - 1) ###################
    #     if (add.left.type == "mul" or add.left.type == "add") and (add.right.type == "mul" or add.right.type == "add") :
    #         l =0
    #         if add.left.type =="mul" and add.right.type == "add":
    #             if add.right.left.type == "mul" :
                               


    #         if add.left.type =="var":
    #             if add.right.type == "mul":
    #                     l = add.right.left + 1
    #             else :
    #                     l = 2 
    #         add = Method(
    #                 type="mul",
    #                 left=Method(type="const", left=l, var=add.var),
    #                 right= add.left if add.left.type == "mul" else add.right,
    #                 var=add.var
    #             )        
