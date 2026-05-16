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
def detect_u_sub_linear(body):
    feats = {}
    feats['usub_root_trig_linear'] = 0
    if isinstance(body, (SinExprNode, CosExprNode, TanExprNode)):
        inner = getattr(body, 'left', None)
        if inner is not None and _is_ax_plus_b(inner):
            feats['usub_root_trig_linear'] = 1

    feats['usub_root_sqrt_linear'] = 0
    if isinstance(body, SqrtExprNode):
        inner = getattr(body, 'left', None)
        if inner is not None and _is_ax_plus_b(inner):
            feats['usub_root_sqrt_linear'] = 1

    feats['usub_root_power_linear'] = 0
    if isinstance(body, (MonoExprNode, PowerExprNode)):
        inner = getattr(body, 'left', None)
        if inner is not None and _is_ax_plus_b(inner):
            feats['usub_root_power_linear'] = 1

    feats['usub_root_log_linear'] = 0
    if isinstance(body, LogExprNode):
        inner = getattr(body, 'left', None)
        if inner is not None and _is_ax_plus_b(inner):
            feats['usub_root_log_linear'] = 1

    def _scan(node, lin_found, nonlin_found):
        if node is None:
            return lin_found, nonlin_found
        if isinstance(node, (SinExprNode, CosExprNode, TanExprNode, SqrtExprNode, LogExprNode)):
            inner = getattr(node, 'left', None)
            if inner is not None:
                if _is_ax_plus_b(inner):
                    lin_found = True
                elif _is_nonlinear_inner(inner):
                    nonlin_found = True
        if hasattr(node, 'left') and node.left is not None:
            lin_found, nonlin_found = _scan(node.left, lin_found, nonlin_found)
        if hasattr(node, 'right') and node.right is not None:
            lin_found, nonlin_found = _scan(node.right, lin_found, nonlin_found)
        return lin_found, nonlin_found

    lin, nonlin = _scan(body, False, False)
    feats['usub_inner_is_linear']    = 1 if lin else 0
    feats['usub_inner_is_nonlinear'] = 1 if nonlin else 0

    root_is_add_sub = isinstance(body, (AddExprNode, SubExprNode))
    any_linear_root = any([
        feats['usub_root_trig_linear'],
        feats['usub_root_sqrt_linear'],
        feats['usub_root_power_linear'],
        feats['usub_root_log_linear'],
    ])
    feats['usub_linear_candidate']   = 1 if (lin and not nonlin) else 0
    feats['usub_is_pure_linear_form'] = 1 if (not root_is_add_sub and any_linear_root) else 0

    return feats
