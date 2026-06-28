from ai.utils.expr.expr_node import ExprNode
from ai.utils.expr.trig.expr_sin import SinExprNode
from ai.utils.expr.trig.expr_cos import CosExprNode
from ai.utils.expr.trig.expr_tan import TanExprNode
from ai.utils.expr.trig.expr_arctan import ArctanExprNode
from ai.utils.expr.operation.expr_add import AddExprNode
from ai.utils.expr.operation.expr_sub import SubExprNode
from ai.utils.expr.operation.expr_mul import MulExprNode
from ai.utils.expr.operation.expr_frac import FracExprNode
from ai.utils.expr.value.expr_var import VarExprNode
from ai.utils.expr.value.expr_const import ConstExprNode
from ai.utils.expr.Power.expr_mono import MonoExprNode
from ai.utils.expr.Power.expr_power import PowerExprNode

def _scan_trig(node, feats):
    if node is None:
        return
        
    # Count & Has features
    if isinstance(node, SinExprNode):
        feats['count_sin'] += 1
        feats['has_sin'] = 1
    elif isinstance(node, CosExprNode):
        feats['count_cos'] += 1
        feats['has_cos'] = 1
    elif isinstance(node, TanExprNode):
        feats['count_tan'] += 1
        feats['has_tan'] = 1
    elif isinstance(node, ArctanExprNode):
        feats['count_arctan'] += 1
        feats['has_arctan'] = 1

    # Check for trig squared anywhere
    if isinstance(node, (MonoExprNode, PowerExprNode)):
        base, exponent = node.left, node.right
        if isinstance(base, (SinExprNode, CosExprNode, TanExprNode)) and isinstance(exponent, ConstExprNode):
            val = exponent.left
            if abs(val - 2) < 1e-9:
                if isinstance(base, TanExprNode):
                    feats['trig_tan_squared'] = 1
                else:
                    feats['trig_squared'] = 1
            elif val > 0:
                if int(val) % 2 == 1:
                    feats['trig_power_odd'] = 1
                else:
                    feats['trig_power_even'] = 1

    # Check for trig double angle product anywhere
    if isinstance(node, MulExprNode):
        L, R = node.left, node.right
        if L is not None and R is not None:
            if isinstance(L, SinExprNode) and isinstance(R, CosExprNode) and L.left is not None and R.left is not None and L.left._equals(R.left):
                feats['trig_double_angle'] = 1
            elif isinstance(L, CosExprNode) and isinstance(R, SinExprNode) and L.left is not None and R.left is not None and L.left._equals(R.left):
                feats['trig_double_angle'] = 1

    # Check for reciprocal squared (1/cos^2 or 1/sin^2)
    if isinstance(node, FracExprNode):
        num, den = node.left, node.right
        if num is not None and den is not None:
            if isinstance(den, (MonoExprNode, PowerExprNode)):
                base, exponent = den.left, den.right
                if isinstance(base, (SinExprNode, CosExprNode)) and isinstance(exponent, ConstExprNode) and abs(exponent.left - 2) < 1e-9:
                    feats['trig_reciprocal_squared'] = 1
            # Check for rational trig (fraction of trig functions)
            num_has = num.has_function(SinExprNode) or num.has_function(CosExprNode) or num.has_function(TanExprNode)
            den_has = den.has_function(SinExprNode) or den.has_function(CosExprNode) or den.has_function(TanExprNode)
            if num_has and den_has:
                feats['trig_rational_sin_cos'] = 1

    # Check for negative powers (another form of reciprocal)
    if isinstance(node, (MonoExprNode, PowerExprNode)):
        base, exponent = node.left, node.right
        if isinstance(base, (SinExprNode, CosExprNode)) and isinstance(exponent, ConstExprNode):
            if abs(exponent.left + 2) < 1e-9:
                feats['trig_reciprocal_squared'] = 1

    # Traverse left and right children
    if hasattr(node, 'left') and node.left is not None:
        _scan_trig(node.left, feats)
    if hasattr(node, 'right') and node.right is not None:
        _scan_trig(node.right, feats)

def _scan_different_angles(node, angles_set):
    if node is None:
        return
    if isinstance(node, (SinExprNode, CosExprNode, TanExprNode, ArctanExprNode)):
        if node.left is not None:
            angles_set.add(node.left)
    if hasattr(node, 'left') and node.left is not None:
        _scan_different_angles(node.left, angles_set)
    if hasattr(node, 'right') and node.right is not None:
        _scan_different_angles(node.right, angles_set)

def detect_trig_features(body):
    feats = {
        'has_trig': 0,
        'has_sin': 0,
        'has_cos': 0,
        'has_tan': 0,
        'has_arctan': 0,
        'count_sin': 0,
        'count_cos': 0,
        'count_tan': 0,
        'count_arctan': 0,
        'trig_squared': 0,
        'trig_tan_squared': 0,
        'trig_double_angle': 0,
        'trig_power_odd': 0,
        'trig_power_even': 0,
        'trig_reciprocal_squared': 0,
        'trig_rational_sin_cos': 0,
        'trig_different_angles': 0
    }
    
    _scan_trig(body, feats)
    
    feats['has_trig'] = 1 if (feats['has_sin'] or feats['has_cos'] or feats['has_tan'] or feats['has_arctan']) else 0
    
    # Check for unique angles structurally using _equals
    angles = set()
    _scan_different_angles(body, angles)
    unique_angles = []
    for a in angles:
        if not any(a._equals(ua) for ua in unique_angles):
            unique_angles.append(a)
    if len(unique_angles) >= 2:
        feats['trig_different_angles'] = 1
        
    return feats
