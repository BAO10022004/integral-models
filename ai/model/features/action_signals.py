from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.trig.expr_sin import SinExprNode
from ai.utils.expr.trig.expr_cos import CosExprNode
from ai.utils.expr.trig.expr_tan import TanExprNode
from ai.utils.expr.operation.expr_add import AddExprNode
from ai.utils.expr.operation.expr_sub import SubExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode
from ai.utils.expr.operation.expr_frac import FracExprNode
from ai.utils.expr.value.expr_var import VarExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.utils.expr.expr_log import LogExprNode
from ai.utils.expr.Power.expr_sqrt import SqrtExprNode
from ai.utils.expr.Power.expr_power import PowerExprNode
from ai.utils.expr.expr_exp import ExpExprNode
from ai.model.features.utils import *
def detect_action_signals(body):
    feats = {}

    feats['sig_is_pure_polynomial'] = 1 if _is_polynomial_sum(body) else 0
    feats['sig_poly_degree']        = max(0, _get_poly_degree(body)) if feats['sig_is_pure_polynomial'] else 0
    feats['sig_poly_multi_terms']   = 0
    if feats['sig_is_pure_polynomial'] and isinstance(body, (AddExprNode, SubExprNode)):
        feats['sig_poly_multi_terms'] = 1

    feats['sig_mul_root']           = 1 if isinstance(body, MulExprNode) else 0
    feats['sig_mul_f_is_const']     = 0
    feats['sig_mul_same_category']  = 0
    feats['sig_mul_diff_category']  = 0
    feats['sig_mul_uprime_gu']      = 0
    feats['sig_mul_ibp_candidate']  = 0

    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        cat_L = _func_category(L)
        cat_R = _func_category(R)

        if _is_const_node(L) or _is_const_node(R):
            feats['sig_mul_f_is_const'] = 1
        else:
            if cat_L == cat_R:
                feats['sig_mul_same_category'] = 1
            else:
                feats['sig_mul_diff_category'] = 1
                if _could_be_derivative(L, R) or _could_be_derivative(R, L):
                    feats['sig_mul_uprime_gu'] = 1
                else:
                    feats['sig_mul_ibp_candidate'] = 1

    feats['sig_frac_root']          = 1 if isinstance(body, FracExprNode) else 0
    feats['sig_frac_num_is_one']    = 0
    feats['sig_frac_den_poly_deg1'] = 0
    feats['sig_frac_den_poly_degN'] = 0
    feats['sig_frac_both_poly']     = 0
    feats['sig_frac_has_sqrt']      = 0
    feats['sig_frac_diff_func']     = 0

    if isinstance(body, FracExprNode) and body.left is not None and body.right is not None:
        num, den = body.left, body.right
        num_is_one   = _is_const_node(num)
        num_is_poly  = _is_polynomial_sum(num)
        den_is_poly  = _is_polynomial_sum(den)
        den_degree   = _get_poly_degree(den) if den_is_poly else -1
        num_has_sqrt = isinstance(num, SqrtExprNode) or (hasattr(num, 'has_function') and num.has_function(SqrtExprNode))
        den_has_sqrt = isinstance(den, SqrtExprNode) or (hasattr(den, 'has_function') and den.has_function(SqrtExprNode))

        feats['sig_frac_num_is_one']    = 1 if num_is_one else 0

        if den_is_poly:
            if den_degree == 1:
                feats['sig_frac_den_poly_deg1'] = 1   
            elif den_degree > 1:
                feats['sig_frac_den_poly_degN'] = 1   

        if num_is_poly and den_is_poly and not num_is_one:
            feats['sig_frac_both_poly'] = 1            

        if num_has_sqrt or den_has_sqrt:
            feats['sig_frac_has_sqrt'] = 1             

        cat_num = _func_category(num)
        cat_den = _func_category(den)
        if cat_num not in ('poly','const','var','mul') and \
           cat_den not in ('poly','const','var','mul') and \
           cat_num != cat_den:
            feats['sig_frac_diff_func'] = 1             

    feats['sig_has_power_exp']      = 0
    feats['sig_exp_root']           = 1 if isinstance(body, ExpExprNode) else 0
    feats['sig_power_root']         = 1 if isinstance(body, PowerExprNode) else 0
    feats['sig_exp_f_const_g_deg1'] = 0
    feats['sig_exp_f_is_derivative']= 0
    feats['sig_exp_ibp_candidate']  = 0

    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        exp_side  = R if isinstance(R, (ExpExprNode, PowerExprNode)) else \
                    (L if isinstance(L, (ExpExprNode, PowerExprNode)) else None)
        func_side = L if exp_side is R else (R if exp_side is L else None)

        if exp_side is not None:
            feats['sig_has_power_exp'] = 1
            g_inner = getattr(exp_side, 'left', None)
            g_deg   = _get_poly_degree(g_inner) if g_inner is not None else -1

            if _is_const_node(func_side) and g_deg == 1:
                feats['sig_exp_f_const_g_deg1'] = 1    
            elif func_side is not None and g_inner is not None and \
                 _could_be_derivative(func_side, g_inner):
                feats['sig_exp_f_is_derivative'] = 1   
            elif func_side is not None and not _is_const_node(func_side):
                feats['sig_exp_ibp_candidate'] = 1     

    feats['sig_sqrt_root']           = 1 if isinstance(body, SqrtExprNode) else 0
    feats['sig_sqrt_f_one_g_deg1']   = 0
    feats['sig_sqrt_g_is_exp']       = 0
    feats['sig_sqrt_g_is_monom']     = 0
    feats['sig_sqrt_f_is_derivative']= 0

    if isinstance(body, SqrtExprNode):
        g_inner = getattr(body, 'left', None)
        if g_inner is not None:
            g_deg = _get_poly_degree(g_inner)
            if g_deg == 1:
                feats['sig_sqrt_f_one_g_deg1'] = 1     
            elif isinstance(g_inner, (ExpExprNode, PowerExprNode)) and not _is_polynomial_sum(g_inner):
                feats['sig_sqrt_g_is_exp'] = 1          
            elif g_deg > 1:
                feats['sig_sqrt_g_is_monom'] = 1        

    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        sqrt_side = R if isinstance(R, SqrtExprNode) else \
                    (L if isinstance(L, SqrtExprNode) else None)
        func_side = L if sqrt_side is R else (R if sqrt_side is L else None)

        if sqrt_side is not None and func_side is not None:
            feats['sig_sqrt_root'] = 1
            g_inner = getattr(sqrt_side, 'left', None)
            if g_inner is not None and _could_be_derivative(func_side, g_inner):
                feats['sig_sqrt_f_is_derivative'] = 1  

    feats['sig_action0_direct'] = 1 if (
        feats['sig_is_pure_polynomial'] and feats['sig_poly_degree'] <= 1 and
        not feats['sig_poly_multi_terms']
    ) else 0

    feats['sig_action1_const'] = 1 if feats['sig_mul_f_is_const'] else 0

    feats['sig_action1_split'] = 1 if (
        feats['sig_is_pure_polynomial'] and feats['sig_poly_multi_terms']
    ) else 0

    feats['sig_action2_split'] = feats['sig_action1_split']  

    # Check for trigonometric squared (e.g. sin(x)^2, cos(x)^2)
    sig_trig_squared = 0
    if isinstance(body, (MonoExprNode, PowerExprNode)):
        base, exponent = body.left, body.right
        if isinstance(base, (SinExprNode, CosExprNode)) and isinstance(exponent, ConstExprNode) and abs(exponent.left - 2) < 1e-9:
            sig_trig_squared = 1

    # Check for trigonometric double angle product (e.g. sin(x)*cos(x))
    sig_trig_double_angle_product = 0
    if isinstance(body, MulExprNode) and body.left is not None and body.right is not None:
        L, R = body.left, body.right
        if isinstance(L, SinExprNode) and isinstance(R, CosExprNode) and L.left._equals(R.left):
            sig_trig_double_angle_product = 1
        elif isinstance(L, CosExprNode) and isinstance(R, SinExprNode) and L.left._equals(R.left):
            sig_trig_double_angle_product = 1

    feats['sig_action3_special'] = 1 if any([
        feats['sig_mul_same_category'],
        feats['sig_frac_den_poly_degN'],
        feats['sig_frac_both_poly'],
        feats['sig_sqrt_g_is_exp'],
        feats['sig_sqrt_g_is_monom'],
        sig_trig_squared,
        sig_trig_double_angle_product,
    ]) else 0

    feats['sig_action4_usub'] = 1 if any([
        feats['sig_mul_uprime_gu'],
        feats['sig_frac_den_poly_deg1'],
        feats['sig_frac_has_sqrt'],
        feats['sig_exp_f_const_g_deg1'],
        feats['sig_exp_f_is_derivative'],
        feats['sig_sqrt_f_one_g_deg1'],
        feats['sig_sqrt_f_is_derivative'],
    ]) else 0

    feats['sig_action5_byparts'] = 1 if any([
        feats['sig_mul_ibp_candidate'],
        feats['sig_frac_diff_func'],
        feats['sig_exp_ibp_candidate'],
    ]) else 0

    return feats
