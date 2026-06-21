

import pandas as pd

from ai.utils.integral import Integral
from ai.utils.printer  import Printer
from ai.utils.expr.expr_node import ExprNode
from ai.model.feature_extractor import extract_features


# ─────────────────────────────────────────────────────────────────────────────

def expr_str(expr) -> str:
    return Printer.expr_to_str(expr)


def integral_str(integral: Integral) -> str:
    lo   = integral.left  or "?"
    hi   = integral.right or "?"
    dee  = integral.dee   or "x"
    body = expr_str(integral.integrand)
    return f"∫[{lo}→{hi}] ({body}) d{dee}"


_SKLEARN_MODEL = None

def _get_sklearn_model():
    global _SKLEARN_MODEL
    if _SKLEARN_MODEL is None:
        import os
        import joblib
        _DIR = os.path.dirname(os.path.abspath(__file__))
        _MODEL_PATH = os.path.abspath(os.path.join(_DIR, "..", "..", "saved_models", "best_model.pkl"))
        if os.path.exists(_MODEL_PATH):
            try:
                _SKLEARN_MODEL = joblib.load(_MODEL_PATH)
                print(f"[OK] Solver Helpers loaded Sklearn Model from: {_MODEL_PATH}")
            except Exception as e:
                print(f"[ERROR] Solver Helpers cannot load Sklearn Model: {e}")
    return _SKLEARN_MODEL


def is_action_implementable(action: int, expr: ExprNode, dee: str) -> bool:
    if expr is None:
        return False
        
    if action == 0:   # Rút hằng số: c * f(x)
        from ai.utils.expr.operation.expr_mul import MulExprNode
        from ai.utils.expr.value.expr_const import ConstExprNode
        if not isinstance(expr, MulExprNode):
            return False
        L, R = expr.left, expr.right
        return (isinstance(L, ConstExprNode) and not isinstance(R, ConstExprNode)) or \
               (isinstance(R, ConstExprNode) and not isinstance(L, ConstExprNode))

    elif action == 1: # Tách tổng/hiệu: f(x) +/- g(x)
        from ai.utils.expr.operation.expr_add import AddExprNode
        from ai.utils.expr.operation.expr_sub import SubExprNode
        return isinstance(expr, (AddExprNode, SubExprNode))

    elif action == 2: # Công thức đặc trưng
        try:
            from ai.utils.rules.rule_special import SpecialFormulaRegistry
            new_expr, _ = SpecialFormulaRegistry.apply_first_match(expr, dee)
            return new_expr is not None
        except Exception:
            return False

    elif action == 3: # Đổi biến bậc nhất u = ax + b
        try:
            from ai.utils.antiderivative_rule.rule_usub import rule_usub
            anti = rule_usub(expr, dee)
            return anti is not expr
        except Exception:
            return False

    elif action == 4: # Tích phân từng phần (chấp nhận nếu là phép nhân)
        from ai.utils.expr.operation.expr_mul import MulExprNode
        return isinstance(expr, MulExprNode)

    return False


def predict_action(model, latex: str) -> tuple[int, dict]:

    try:
        integral = Integral(latex)
        expr = integral.integrand
        dee = integral.dee
    except Exception:
        expr = None
        dee = "x"
    pred_gnn, probs_gnn = -1, {}
    if model is not None and hasattr(model, "predict_with_proba"):
        try:
            pred_gnn_raw, probs_array = model.predict_with_proba(latex)
            if pred_gnn_raw != -1:
                probs_gnn = {int(c): round(float(p) * 100, 1) for c, p in enumerate(probs_array)}
                pred_gnn = pred_gnn_raw
        except Exception as e:
            print(f"[Error] GNN predict failed: {e}")

    pred_sklearn, probs_sklearn = -1, {}
    sklearn_model = _get_sklearn_model()
    if sklearn_model is not None:
        try:
            feats = extract_features(latex)
            if feats is not None:
                X = pd.DataFrame([feats])
                if hasattr(sklearn_model, "feature_names_in_"):
                    for col in sklearn_model.feature_names_in_:
                        if col not in X.columns:
                            X[col] = 0
                    X = X[sklearn_model.feature_names_in_]
                
                pred_sk_raw = int(sklearn_model.predict(X)[0])
                
                if hasattr(sklearn_model, "predict_proba"):
                    try:
                        proba = sklearn_model.predict_proba(X)[0]
                        classes = sklearn_model.classes_ if hasattr(sklearn_model, "classes_") else range(len(proba))
                        probs_sklearn = {int(c): round(float(p) * 100, 1) for c, p in zip(classes, proba)}
                        pred_sklearn = pred_sk_raw
                    except Exception:
                        probs_sklearn = {pred_sk_raw: 100.0}
                        pred_sklearn = pred_sk_raw
                else:
                    probs_sklearn = {pred_sk_raw: 100.0}
                    pred_sklearn = pred_sk_raw
        except Exception as e:
            print(f"[Error] Sklearn predict failed: {e}")

    if not probs_gnn and not probs_sklearn:
        return -1, {}

    def apply_strict_rules(probs: dict) -> int:
        if not probs:
            return -1
        sorted_classes = sorted(probs.items(), key=lambda x: -x[1])
        implementable_actions = [
            act for act, prob in sorted_classes 
            if is_action_implementable(act, expr, dee)
        ]
        
        if implementable_actions:
            return implementable_actions[0]    
        return sorted_classes[0][0]
    final_gnn_action = apply_strict_rules(probs_gnn)
    final_sk_action = apply_strict_rules(probs_sklearn)

    gnn_ok = is_action_implementable(final_gnn_action, expr, dee) if final_gnn_action != -1 else False
    sk_ok = is_action_implementable(final_sk_action, expr, dee) if final_sk_action != -1 else False

    if gnn_ok:
        return final_gnn_action, probs_gnn
    elif sk_ok:
        return final_sk_action, probs_sklearn
    else:
        if final_gnn_action != -1:
            return final_gnn_action, probs_gnn
        return final_sk_action, probs_sklearn


def evaluate(expr: ExprNode, value: str) -> float | None:
    try:
        return float(expr.calculate(value))
    except Exception:
        return None


def rebuild_latex(integral: Integral) -> str:
    lo   = integral.left  or "0"
    hi   = integral.right or "1"
    dee  = integral.dee   or "x"
    body = expr_str(integral.integrand)
    return rf"\int_{{{lo}}}^{{{hi}}}{body}d{dee}"


def make_step(kind: str, depth: int, **kwargs) -> dict:
    return {"kind": kind, "depth": depth, **kwargs}
