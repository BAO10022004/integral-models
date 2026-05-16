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
def detect_inner_type_precise(body):
    feats = {}

    feats['trig_inner_pure_x']    = 0
    feats['trig_inner_ax_plus_b'] = 0
    feats['trig_inner_offset']    = 0
    feats['trig_inner_coeff']     = 0
    if isinstance(body, (SinExprNode, CosExprNode, TanExprNode)):
        inner = getattr(body, 'left', None)
        if inner is not None:
            if _is_pure_x(inner):
                feats['trig_inner_pure_x'] = 1
            elif _inner_has_offset(inner):
                feats['trig_inner_ax_plus_b'] = 1
                feats['trig_inner_offset']    = 1
            elif _inner_has_coeff_only(inner):
                feats['trig_inner_ax_plus_b'] = 1
                feats['trig_inner_coeff']     = 1

    feats['mono_inner_pure_x']    = 0
    feats['mono_inner_ax_plus_b'] = 0
    feats['mono_inner_offset']    = 0
    if isinstance(body, (MonoExprNode, PowerExprNode)):
        inner = getattr(body, 'left', None)
        if inner is not None:
            if _is_pure_x(inner):
                feats['mono_inner_pure_x'] = 1
            elif _inner_has_offset(inner):
                feats['mono_inner_ax_plus_b'] = 1
                feats['mono_inner_offset']    = 1
            elif _inner_has_coeff_only(inner):
                feats['mono_inner_ax_plus_b'] = 1

    feats['sqrt_inner_pure_x']    = 0
    feats['sqrt_inner_ax_plus_b'] = 0
    if isinstance(body, SqrtExprNode):
        inner = getattr(body, 'left', None)
        if inner is not None:
            if _is_pure_x(inner):
                feats['sqrt_inner_pure_x'] = 1
            elif _is_ax_plus_b(inner):
                feats['sqrt_inner_ax_plus_b'] = 1

    feats['log_inner_pure_x']    = 0
    feats['log_inner_ax_plus_b'] = 0
    if isinstance(body, LogExprNode):
        inner = getattr(body, 'left', None)
        if inner is not None:
            if _is_pure_x(inner):
                feats['log_inner_pure_x'] = 1
            elif _is_ax_plus_b(inner):
                feats['log_inner_ax_plus_b'] = 1

    feats['exp_inner_pure_x']    = 0
    feats['exp_inner_ax_plus_b'] = 0
    if isinstance(body, ExpExprNode):
        inner = getattr(body, 'left', None)
        if inner is not None:
            if _is_pure_x(inner):
                feats['exp_inner_pure_x'] = 1
            elif _is_ax_plus_b(inner):
                feats['exp_inner_ax_plus_b'] = 1

    feats['any_func_inner_pure_x'] = 1 if any([
        feats['trig_inner_pure_x'],
        feats['mono_inner_pure_x'],
        feats['sqrt_inner_pure_x'],
        feats['log_inner_pure_x'],
        feats['exp_inner_pure_x'],
    ]) else 0

    feats['any_func_inner_ax_plus_b'] = 1 if any([
        feats['trig_inner_ax_plus_b'],
        feats['mono_inner_ax_plus_b'],
        feats['sqrt_inner_ax_plus_b'],
        feats['log_inner_ax_plus_b'],
        feats['exp_inner_ax_plus_b'],
    ]) else 0

    feats['inner_is_x_plus_const'] = 1 if any([
        feats['trig_inner_offset'],
        feats['mono_inner_offset'],
    ]) else 0

    feats['inner_offset_not_zero'] = feats['inner_is_x_plus_const']

    root_is_func = isinstance(body, (
        SinExprNode, CosExprNode, TanExprNode,
        MonoExprNode, PowerExprNode, SqrtExprNode,
        LogExprNode, ExpExprNode
    ))
    feats['root_func_class0_signal'] = 1 if (root_is_func and feats['any_func_inner_pure_x']) else 0
    feats['root_func_class4_signal'] = 1 if (root_is_func and feats['any_func_inner_ax_plus_b']) else 0

    return feats
