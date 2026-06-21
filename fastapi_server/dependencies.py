
import os
import json
import sys
from functools import lru_cache

# Đảm bảo root project trong sys.path
_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)



_MODEL = None
_SOLVER = None
_META: dict = {}

def load_resources() -> None:
    global _MODEL, _SOLVER, _META

    meta_path = os.path.join(_ROOT, "saved_models", "model_meta.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            _META = json.load(f)
    try:
        from ai.model.predict_gnn import IntegralGNNPredictor
        gnn_path = os.path.join(_ROOT, "saved_models", "best_gnn_model.pth")
        _MODEL = IntegralGNNPredictor(model_path=gnn_path)
        print(f"GNN Model loaded: {gnn_path}")
    except Exception as e:
        _MODEL = None
        print(f"Cannot load GNN model: {e}")

    # Khởi tạo solver
    if _MODEL is not None:
        from ai.solver_engine.engine import SolverEngine
        _SOLVER = SolverEngine(_MODEL)
        print("SolverEngine ready.")
    else:
        print("SolverEngine NOT ready (model missing).")


def get_model():
    return _MODEL


def get_solver():
    return _SOLVER


def get_meta() -> dict:
    return _META
