
import sys
import os
import json

# Đảm bảo root project trong sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/.."))

# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify
from flask_cors import CORS
# pyrefly: ignore [missing-import]
import joblib

from ai.model.feature_extractor import extract_features
import pandas as pd

app = Flask(__name__)
CORS(app)  # Cho phép React gọi từ localhost:5173

# ── Paths ──────────────────────────────────────────────────────────────────
_DIR        = os.path.dirname(__file__)
_ROOT_DIR   = os.path.abspath(os.path.join(_DIR, ".."))  # integral_models/
_MODEL_PATH = os.path.join(_ROOT_DIR, "saved_models", "best_model.pkl")
_META_PATH  = os.path.join(_ROOT_DIR, "saved_models", "model_meta.json")

# ── Load model một lần khi khởi động ──────────────────────────────────────
print("🔄 Loading GNN model...")
try:
    from ai.model.predict_gnn import IntegralGNNPredictor
    _GNN_MODEL_PATH = os.path.join(_ROOT_DIR, "saved_models", "best_gnn_model.pth")
    MODEL = IntegralGNNPredictor(model_path=_GNN_MODEL_PATH)
    print(f"✅ GNN Model loaded: {_GNN_MODEL_PATH}")
except Exception as e:
    MODEL = None
    print(f"❌ Không thể load GNN model: {e}")

# Load meta
META = {}
if os.path.exists(_META_PATH):
    with open(_META_PATH, "r", encoding="utf-8") as f:
        META = json.load(f)

# ── Action metadata ────────────────────────────────────────────────────────
ACTION_INFO = {
    0: {
        "name": "Áp dụng công thức trực tiếp",
        "name_en": "apply integral",
        "icon": "⚡",
        "color": "#00f2ff",
        "description": "Biểu thức có thể tích phân trực tiếp bằng công thức cơ bản.",
        "steps": [
            "Nhận dạng dạng tích phân cơ bản (xⁿ, sin, cos, 1/x, eˣ, ...)",
            "Áp dụng công thức tích phân tương ứng",
            "Thêm hằng số tích phân C (nếu là tích phân bất định)",
            "Thay cận và tính giá trị (nếu là tích phân xác định)",
        ],
        "formulas": [
            "∫xⁿ dx = xⁿ⁺¹/(n+1) + C",
            "∫sin(x) dx = -cos(x) + C",
            "∫cos(x) dx = sin(x) + C",
            "∫eˣ dx = eˣ + C",
            "∫(1/x) dx = ln|x| + C",
        ]
    },
    1: {
        "name": "Quy tắc tuyến tính",
        "name_en": "linear basic",
        "icon": "📐",
        "color": "#7000ff",
        "description": "Nhân hằng số ra ngoài dấu tích phân, rồi áp dụng công thức cơ bản.",
        "steps": [
            "Nhận dạng dạng c·f(x) (hằng số nhân hàm số)",
            "Áp dụng quy tắc: ∫c·f(x) dx = c·∫f(x) dx",
            "Tính tích phân ∫f(x) dx theo công thức cơ bản",
            "Nhân kết quả với hằng số c",
        ],
        "formulas": [
            "∫c·f(x) dx = c·∫f(x) dx",
            "∫c dx = cx + C",
            "∫c·xⁿ dx = c·xⁿ⁺¹/(n+1) + C",
        ]
    },
    2: {
        "name": "Tách thành tổng",
        "name_en": "split sum",
        "icon": "➕",
        "color": "#ff00c8",
        "description": "Tách tích phân của tổng thành tổng các tích phân.",
        "steps": [
            "Nhận dạng biểu thức có dạng f(x) + g(x) hoặc f(x) - g(x)",
            "Áp dụng quy tắc tuyến tính: ∫[f(x)±g(x)]dx = ∫f(x)dx ± ∫g(x)dx",
            "Tính riêng từng tích phân thành phần",
            "Cộng/trừ kết quả lại",
        ],
        "formulas": [
            "∫[f(x) + g(x)] dx = ∫f(x)dx + ∫g(x)dx",
            "∫[f(x) - g(x)] dx = ∫f(x)dx - ∫g(x)dx",
        ]
    },
    3: {
        "name": "Công thức đặc trưng",
        "name_en": "special formula",
        "icon": "✨",
        "color": "#ffd700",
        "description": "Áp dụng công thức đặc trưng (khai triển, đồng nhất thức, ...).",
        "steps": [
            "Nhận dạng dạng đặc biệt của biểu thức",
            "Áp dụng công thức biến đổi đại số (khai triển, rút gọn)",
            "Đưa về dạng tích phân cơ bản",
            "Tính tích phân",
        ],
        "formulas": [
            "(a+b)² = a² + 2ab + b²",
            "(a-b)² = a² - 2ab + b²",
            "(a+b)(a-b) = a² - b²",
            "sin²x + cos²x = 1",
        ]
    },
    4: {
        "name": "Đổi biến u = ax + b",
        "name_en": "u-substitution",
        "icon": "🔄",
        "color": "#00ff88",
        "description": "Dùng đổi biến u = ax+b để đơn giản hoá biểu thức.",
        "steps": [
            "Nhận dạng inner expression là ax+b (tuyến tính)",
            "Đặt u = ax + b",
            "Tính du: du = a·dx  →  dx = du/a",
            "Thay vào tích phân: biểu thức trở thành hàm của u",
            "Tính tích phân theo u",
            "Thay lại u = ax + b",
        ],
        "formulas": [
            "u = ax + b",
            "du = a dx  →  dx = (1/a)du",
            "∫f(ax+b)dx = (1/a)·F(ax+b) + C",
        ]
    },
    5: {
        "name": "Tích phân từng phần",
        "name_en": "integration by parts",
        "icon": "🔁",
        "color": "#ff6b35",
        "description": "Dùng công thức tích phân từng phần: ∫u·dv = u·v - ∫v·du",
        "steps": [
            "Xác định u và dv theo nguyên tắc LIATE (Log, Inverse, Algebraic, Trig, Exp)",
            "Tính du (đạo hàm của u) và v (nguyên hàm của dv)",
            "Áp dụng công thức: ∫u·dv = u·v - ∫v·du",
            "Tính tích phân còn lại ∫v·du",
            "Tổng hợp kết quả",
        ],
        "formulas": [
            "∫u dv = uv - ∫v du",
            "LIATE: ưu tiên u = Log > Inverse trig > Algebraic > Trig > Exp",
            "∫xeˣdx: u=x, dv=eˣdx → v=eˣ, du=dx → xeˣ - eˣ + C",
        ]
    },
}


def build_response(latex: str, pred_action: int, probabilities: dict) -> dict:
    """Xây dựng response đầy đủ từ kết quả dự đoán."""
    info = ACTION_INFO.get(pred_action, {})

    # Xếp hạng xác suất
    sorted_probs = sorted(probabilities.items(), key=lambda x: -x[1])
    top_action, confidence = sorted_probs[0]

    return {
        "latex": latex,
        "action": int(pred_action),
        "action_name": info.get("name", f"action_{pred_action}"),
        "action_name_en": info.get("name_en", ""),
        "icon": info.get("icon", "🔢"),
        "color": info.get("color", "#ffffff"),
        "description": info.get("description", ""),
        "confidence": round(float(confidence) * 100, 1),
        "steps": info.get("steps", []),
        "formulas": info.get("formulas", []),
        "probabilities": [
            {
                "action": int(a),
                "name": ACTION_INFO.get(int(a), {}).get("name", f"action_{a}"),
                "probability": round(float(p) * 100, 1),
                "color": ACTION_INFO.get(int(a), {}).get("color", "#888"),
            }
            for a, p in sorted_probs
        ],
    }


# ── Routes ─────────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "ok",
        "model": META.get("best_model", "unknown"),
        "f1_macro": META.get("f1_macro_test", None),
        "n_classes": META.get("n_classes", 6),
        "actions": list(ACTION_INFO.keys()),
    })


@app.route("/predict", methods=["POST"])
def predict():
    if MODEL is None:
        return jsonify({"error": "Model chưa được load"}), 503

    data = request.get_json(force=True, silent=True)
    if not data or "latex" not in data:
        return jsonify({"error": "Thiếu trường 'latex' trong request body"}), 400

    latex = str(data["latex"]).strip()
    if not latex:
        return jsonify({"error": "Biểu thức LaTeX không được rỗng"}), 400

    # Predict (Hỗ trợ tự động qua cả GNN hoặc Sklearn)
    from ai.solver_engine.helpers import predict_action
    pred, probs_dict = predict_action(MODEL, latex)

    if pred == -1:
        return jsonify({
            "error": "Không thể parse biểu thức LaTeX",
            "latex": latex,
            "hint": "Hãy kiểm tra cú pháp: \\int_{a}^{b}f(x)dx"
        }), 422

    # Chuyển đổi lại probs (từ % 0-100 về 0-1 để tương thích build_response)
    probabilities = {int(k): float(v)/100.0 for k, v in probs_dict.items()}

    response = build_response(latex, pred, probabilities)
    return jsonify(response)


@app.route("/examples", methods=["GET"])
def examples():
    """Trả về danh sách biểu thức mẫu theo từng action."""
    return jsonify({
        0: [
            r"\int_{0}^{1}{x}^{2}dx",
            r"\int_{0}^{1}\sin{x}dx",
            r"\int_{0}^{1}\cos{x}dx",
            r"\int_{1}^{2}\frac{1}{x}dx",
            r"\int_{0}^{1}e^{x}dx",
        ],
        1: [
            r"\int_{0}^{1}3*{x}^{2}dx",
            r"\int_{0}^{1}2*\sin{x}dx",
            r"\int_{0}^{1}5*\cos{x}dx",
        ],
        2: [
            r"\int_{0}^{1}{x}^{2}+\sin{x}dx",
            r"\int_{0}^{1}\cos{x}+{x}^{3}dx",
            r"\int_{0}^{1}{x}^{2}+{x}^{3}dx",
        ],
        4: [
            r"\int_{0}^{1}\sin{2*x}dx",
            r"\int_{0}^{1}\cos{x+1}dx",
            r"\int_{0}^{1}\sqrt[2]{2*x+1}dx",
            r"\int_{0}^{1}{x+1}^{3}dx",
        ],
        5: [
            r"\int_{0}^{1}{x}*\sin{x}dx",
            r"\int_{0}^{1}{x}*e^{x}dx",
            r"\int_{1}^{2}{x}*\ln{x}dx",
        ],
    })


# ── Solver (vòng lặp Model → Rule) ───────────────────────────────────────────
_SOLVER = None


def _get_solver():
    """Lazy-init SolverEngine khi cần (tránh import nặng khi khởi động)."""
    global _SOLVER
    if _SOLVER is None and MODEL is not None:
        from ai.solver_engine import SolverEngine
        _SOLVER = SolverEngine(MODEL)
    return _SOLVER


@app.route("/solve", methods=["POST"])
def solve():
    """
    Giải tích phân qua vòng lặp Model → Rule → kết quả số.

    Request body:
        { "latex": "\\int_{0}^{1}{x}^{2}dx" }

    Response:
        {
            "latex"   : chuỗi LaTeX gốc,
            "steps"   : list[dict],   -- các bước giải chi tiết
            "answer"  : float|null,   -- kết quả số
            "success" : bool,
            "error"   : str|null
        }
    """
    if MODEL is None:
        return jsonify({"error": "Model chưa được load"}), 503

    data = request.get_json(force=True, silent=True)
    if not data or "latex" not in data:
        return jsonify({"error": "Thiếu trường 'latex' trong request body"}), 400

    latex = str(data["latex"]).strip()
    if not latex:
        return jsonify({"error": "Biểu thức LaTeX không được rỗng"}), 400

    solver = _get_solver()
    if solver is None:
        return jsonify({"error": "Không khởi tạo được SolverEngine"}), 503

    result = solver.solve(latex)

    # Format steps cho JSON (loại bỏ các giá trị None để gọn response)
    formatted_steps = []
    for s in result.get("steps", []):
        step = {
            "kind":        s.get("kind", ""),
            "depth":       s.get("depth", 0),
            "description": s.get("description", ""),
        }
        if s.get("action") is not None:
            step["action"] = s["action"]
        if s.get("formula"):
            step["formula"] = s["formula"]
        if s.get("integral_str"):
            step["integral"] = s["integral_str"]
        if isinstance(s.get("value"), (int, float)):
            step["value"] = round(float(s["value"]), 8)
        if s.get("probabilities"):
            step["probabilities"] = s["probabilities"]
        formatted_steps.append(step)

    ans = result.get("answer")
    return jsonify({
        "latex":   latex,
        "steps":   formatted_steps,
        "answer":  round(float(ans), 8) if isinstance(ans, (int, float)) else None,
        "success": bool(result.get("success")),
        "error":   result.get("error"),
    })


if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Integral Model API Server")
    print(f"   Model: {META.get('best_model', 'unknown')}")
    print(f"   F1-macro: {META.get('f1_macro_test', '?')}")
    print("   Endpoints: POST /predict  |  POST /solve  |  GET /examples")
    print("   Listening on http://localhost:5000")
    print("=" * 50)
    app.run(host="0.0.0.0", port=5000, debug=True)
