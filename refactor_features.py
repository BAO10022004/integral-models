import os
import ast

os.makedirs("ai/model/features", exist_ok=True)

with open("ai/model/feature_extractor.py", "r", encoding="utf-8") as f:
    source = f.read()

def get_node_source(name):
    tree = ast.parse(source)
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == name:
            return ast.get_source_segment(source, node)
    return ""

def write_module(filename, imports, functions, extra=""):
    content = imports + "\n\n" + extra + "\n"
    for func in functions:
        src = get_node_source(func)
        if src:
            content += src + "\n\n"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

base_imports = """from ai.utils.expr.expr_node import ExprNode
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
from ai.utils.expr.expr_exp import ExpExprNode"""

utils_extra = """_FUNC_TYPES = (
    SinExprNode, CosExprNode, TanExprNode,
    SqrtExprNode, LogExprNode, ExpExprNode,
    MonoExprNode, PowerExprNode,
    VarExprNode, ConstExprNode,
    FracExprNode,
)

_NONTRIVIAL_FUNC_TYPES = (
    SinExprNode, CosExprNode, TanExprNode,
    SqrtExprNode, LogExprNode, ExpExprNode,
    MonoExprNode, PowerExprNode,
    FracExprNode, MulExprNode,
)

_FUNC_CATEGORY_MAP = {
    SinExprNode:   'trig',
    CosExprNode:   'trig',
    TanExprNode:   'trig',
    SqrtExprNode:  'sqrt',
    LogExprNode:   'log',
    ExpExprNode:   'exp',
    MonoExprNode:  'poly',
    PowerExprNode: 'poly',
    FracExprNode:  'frac',
    MulExprNode:   'mul',
    VarExprNode:   'poly',
}

_POLY_TYPES = (VarExprNode, MonoExprNode, PowerExprNode)
_TRIG_TYPES = (SinExprNode, CosExprNode, TanExprNode)"""

utils_funcs = [
    "is_pure_var_or_const", "is_linear_expr", "is_monomial", "has_non_trivial_inner", 
    "count_nodes", "get_depth", "_has_mono_add_inner", "_check_trig_nontrivial", 
    "_check_sqrt_nontrivial", "_is_ax_plus_b", "_is_nonlinear_inner", "_is_pure_x", 
    "_inner_has_offset", "_inner_has_coeff_only", "_is_polynomial_sum", "_get_poly_degree", 
    "_func_category", "_is_const_node", "_could_be_derivative"
]

write_module("ai/model/features/utils.py", base_imports, utils_funcs, utils_extra)

add_sub_funcs = ["detect_root_add_sub"]
write_module("ai/model/features/add_sub.py", base_imports + "\nfrom ai.model.features.utils import *", add_sub_funcs)

const_func_funcs = ["_is_single_func", "_is_const_times_func", "_find_const_times_func_any", "detect_const_times_func"]
write_module("ai/model/features/const_func.py", base_imports + "\nfrom ai.model.features.utils import *", const_func_funcs)

basic_funcs = ["_trig_simple_inner", "detect_basic_antiderivative"]
write_module("ai/model/features/basic.py", base_imports + "\nfrom ai.model.features.utils import *", basic_funcs)

counts_funcs = ["_collect_func_types", "_count_nontrivial_funcs", "detect_func_counts"]
write_module("ai/model/features/func_counts.py", base_imports + "\nfrom ai.model.features.utils import *", counts_funcs)

ibp_funcs = ["_is_poly_like", "_is_trig_like", "_is_exp_like", "_is_log_like", "_check_mul_pattern", "_find_ibp_pattern_any", "detect_integration_by_parts"]
write_module("ai/model/features/ibp.py", base_imports + "\nfrom ai.model.features.utils import *", ibp_funcs)

usub_funcs = ["detect_u_sub_linear"]
write_module("ai/model/features/usub.py", base_imports + "\nfrom ai.model.features.utils import *", usub_funcs)

inner_funcs = ["detect_inner_type_precise"]
write_module("ai/model/features/inner_type.py", base_imports + "\nfrom ai.model.features.utils import *", inner_funcs)

signals_funcs = ["detect_action_signals"]
write_module("ai/model/features/action_signals.py", base_imports + "\nfrom ai.model.features.utils import *", signals_funcs)

extractor_imports = """import sys
import os
sys.path.append(os.path.abspath("../.."))

from ai.utils.integral import Integral
""" + base_imports + """
from ai.model.features.add_sub import detect_root_add_sub
from ai.model.features.const_func import detect_const_times_func
from ai.model.features.basic import detect_basic_antiderivative
from ai.model.features.func_counts import detect_func_counts
from ai.model.features.ibp import detect_integration_by_parts
from ai.model.features.usub import detect_u_sub_linear
from ai.model.features.inner_type import detect_inner_type_precise
from ai.model.features.action_signals import detect_action_signals
from ai.model.features.utils import _has_mono_add_inner, _check_trig_nontrivial, _check_sqrt_nontrivial, is_linear_expr
"""

write_module("ai/model/feature_extractor.py", extractor_imports, ["extract_features"])

with open("ai/model/features/__init__.py", "w", encoding="utf-8") as f:
    f.write("")

print("Successfully split feature_extractor.py into ai/model/features/ module.")
