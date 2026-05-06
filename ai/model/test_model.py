"""
test_model.py
─────────────
File test mô hình phân loại hành động tích phân.
Cung cấp các hàm để:
  1. Load mô hình đã lưu (best_model.pkl)
  2. Trích xuất features từ biểu thức LaTeX
  3. Dự đoán hành động (action) cho biểu thức tích phân
  4. Đánh giá mô hình trên tập dữ liệu
  5. Test từng biểu thức riêng lẻ qua CLI
"""

import sys
import os
import json
import joblib
import pandas as pd
import numpy as np
from collections import Counter

# Đảm bảo root project nằm trên sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from ai.model.feature_extractor import extract_features
from ai.model.config import ACTION_MAP

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

# Đường dẫn mặc định
_MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'saved_models')
_MODEL_PATH = os.path.join(_MODEL_DIR, 'best_model.pkl')
_META_PATH = os.path.join(_MODEL_DIR, 'model_meta.json')
_DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'integral_dataset.csv')

# Ánh xạ ngược từ action id sang tên hành động
ACTION_NAMES = {
    0: "apply integral",
    1: "unknown / gộp",
    2: "equality",
    3: "expand / u-sub",
    4: "frac rule",
    5: "power rule (unused)",
    6: "trig rule",
    7: "simplify",
    8: "basic",
}


# ─────────────────────────────────────────────────────────────────────────────
# HÀM LOAD MODEL
# ─────────────────────────────────────────────────────────────────────────────

def load_model(model_path=None):
    """
    Load mô hình đã lưu từ file .pkl.
    
    Parameters
    ----------
    model_path : str, optional
        Đường dẫn tới file model. Mặc định dùng best_model.pkl.
    
    Returns
    -------
    model : sklearn Pipeline hoặc estimator
        Mô hình đã được train.
    """
    path = model_path or _MODEL_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"❌ Không tìm thấy model tại: {path}")
    
    model = joblib.load(path)
    print(f"✅ Đã load model từ: {path}")
    return model


def load_meta(meta_path=None):
    """
    Load metadata của model (tên model, F1, classes, ...).
    
    Returns
    -------
    dict : metadata
    """
    path = meta_path or _META_PATH
    if not os.path.exists(path):
        return None
    
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


# ─────────────────────────────────────────────────────────────────────────────
# HÀM TRÍCH XUẤT FEATURES
# ─────────────────────────────────────────────────────────────────────────────

def extract_features_from_latex(latex_str):
    """
    Trích xuất features từ một biểu thức tích phân LaTeX.
    
    Parameters
    ----------
    latex_str : str
        Biểu thức LaTeX, ví dụ: \\int_{0}^{1}{x}^{2}dx
    
    Returns
    -------
    pd.DataFrame hoặc None
        DataFrame 1 hàng chứa các features, hoặc None nếu parse lỗi.
    """
    feats = extract_features(latex_str)
    if feats is None:
        print(f"⚠️  Không thể parse biểu thức: {latex_str[:80]}...")
        return None
    
    return pd.DataFrame([feats])


# ─────────────────────────────────────────────────────────────────────────────
# HÀM DỰ ĐOÁN
# ─────────────────────────────────────────────────────────────────────────────

def predict_action(model, latex_str):
    """
    Dự đoán hành động (action) cho một biểu thức tích phân.
    
    Parameters
    ----------
    model : sklearn estimator
        Mô hình đã load.
    latex_str : str
        Biểu thức LaTeX.
    
    Returns
    -------
    dict : Kết quả dự đoán gồm:
        - 'latex': biểu thức gốc
        - 'predicted_action': action id dự đoán
        - 'action_name': tên hành động
        - 'probabilities': dict {action: probability} (nếu model hỗ trợ)
    """
    features_df = extract_features_from_latex(latex_str)
    if features_df is None:
        return {
            'latex': latex_str,
            'predicted_action': None,
            'action_name': 'PARSE_ERROR',
            'probabilities': None,
        }
    
    # Dự đoán
    pred = model.predict(features_df)[0]
    
    # Xác suất (nếu model hỗ trợ predict_proba)
    probabilities = None
    if hasattr(model, 'predict_proba'):
        try:
            proba = model.predict_proba(features_df)[0]
            classes = model.classes_ if hasattr(model, 'classes_') else range(len(proba))
            probabilities = {int(c): round(float(p), 4) for c, p in zip(classes, proba)}
        except Exception:
            pass
    
    action_name = ACTION_NAMES.get(int(pred), f"unknown({pred})")
    
    return {
        'latex': latex_str,
        'predicted_action': int(pred),
        'action_name': action_name,
        'probabilities': probabilities,
    }


def predict_batch(model, latex_list):
    """
    Dự đoán hành động cho nhiều biểu thức cùng lúc.
    
    Parameters
    ----------
    model : sklearn estimator
    latex_list : list[str]
        Danh sách biểu thức LaTeX.
    
    Returns
    -------
    list[dict] : Danh sách kết quả dự đoán.
    """
    results = []
    for latex in latex_list:
        result = predict_action(model, latex)
        results.append(result)
    return results


# ─────────────────────────────────────────────────────────────────────────────
# HÀM ĐÁNH GIÁ TRÊN DATASET
# ─────────────────────────────────────────────────────────────────────────────

def evaluate_on_dataset(model, dataset_path=None, verbose=True):
    """
    Đánh giá mô hình trên toàn bộ dataset (hoặc tập test).
    
    Parameters
    ----------
    model : sklearn estimator
    dataset_path : str, optional
        Đường dẫn CSV. Mặc định dùng integral_dataset.csv.
    verbose : bool
        In chi tiết classification report.
    
    Returns
    -------
    dict : Kết quả đánh giá gồm accuracy, f1_macro, classification_report.
    """
    from sklearn.metrics import classification_report, f1_score, accuracy_score, confusion_matrix

    path = dataset_path or _DATASET_PATH
    if not os.path.exists(path):
        raise FileNotFoundError(f"❌ Không tìm thấy dataset tại: {path}")
    
    df = pd.read_csv(path)
    df['label'] = pd.to_numeric(df['label'], errors='coerce').astype('Int64')
    df = df.dropna(subset=['label'])
    
    y_true = df['label'].astype(int)
    X = df.drop(columns=['label'])
    
    # Dự đoán
    y_pred = model.predict(X)
    
    # Tính metrics
    acc = accuracy_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred, average='macro', zero_division=0)
    report = classification_report(y_true, y_pred, zero_division=0)
    cm = confusion_matrix(y_true, y_pred)
    
    if verbose:
        print("=" * 60)
        print("📊 KẾT QUẢ ĐÁNH GIÁ MÔ HÌNH")
        print("=" * 60)
        print(f"  Dataset: {path}")
        print(f"  Số mẫu: {len(y_true)}")
        print(f"  Accuracy: {acc:.4f}")
        print(f"  F1-macro: {f1:.4f}")
        print("-" * 60)
        print("📋 Classification Report:")
        print(report)
        print("-" * 60)
        print("📊 Confusion Matrix:")
        print(cm)
        print("=" * 60)
    
    return {
        'accuracy': acc,
        'f1_macro': f1,
        'classification_report': report,
        'confusion_matrix': cm,
        'n_samples': len(y_true),
    }


# ─────────────────────────────────────────────────────────────────────────────
# HÀM TEST TƯƠNG TÁC
# ─────────────────────────────────────────────────────────────────────────────

def interactive_test(model):
    """
    Chế độ test tương tác: nhập biểu thức LaTeX, nhận kết quả dự đoán.
    Gõ 'q' hoặc 'quit' để thoát.
    """
    print("\n" + "=" * 60)
    print("🧪 CHẾ ĐỘ TEST TƯƠNG TÁC")
    print("=" * 60)
    print("Nhập biểu thức tích phân (LaTeX), ví dụ:")
    print("  \\int_{0}^{1}{x}^{2}dx")
    print("  \\int_{0}^{1}\\sin{x}dx")
    print("  \\int_{0}^{1}{x}^{2}+\\cos{x}dx")
    print("Gõ 'q' để thoát.\n")
    
    while True:
        try:
            latex = input("📝 LaTeX > ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        
        if latex.lower() in ('q', 'quit', 'exit', ''):
            break
        
        result = predict_action(model, latex)
        
        print(f"\n  📌 Biểu thức: {result['latex']}")
        if result['predicted_action'] is not None:
            print(f"  🎯 Action dự đoán: {result['predicted_action']} ({result['action_name']})")
            if result['probabilities']:
                print(f"  📊 Xác suất:")
                for action, prob in sorted(result['probabilities'].items(), key=lambda x: -x[1]):
                    name = ACTION_NAMES.get(action, f"?{action}")
                    bar = '█' * int(prob * 30)
                    print(f"      action={action:2d} ({name:15s}): {prob:.4f} {bar}")
        else:
            print(f"  ❌ Không thể parse biểu thức!")
        print()
    
    print("👋 Thoát chế độ test.")


# ─────────────────────────────────────────────────────────────────────────────
# HÀM TEST VỚI CÁC MẪU CỐ ĐỊNH
# ─────────────────────────────────────────────────────────────────────────────

def run_predefined_tests(model):
    """
    Chạy test với một số biểu thức mẫu cố định để kiểm tra nhanh.
    """
    test_cases = [
        # (biểu thức LaTeX, mô tả)
        (r"\int_{0}^{1}{x}^{2}dx", "Đơn thức x^2 → power rule / basic"),
        (r"\int_{0}^{1}\sin{x}dx", "sin(x) → trig / apply integral"),
        (r"\int_{0}^{1}\cos{x}dx", "cos(x) → trig / apply integral"),
        (r"\int_{0}^{1}{x}^{2}+\cos{x}dx", "x^2 + cos(x) → basic sum (linearity)"),
        (r"\int_{0}^{1}3*{x}^{2}dx", "3*x^2 → const * mono"),
        (r"\int_{0}^{1}\frac{1}{x}dx", "1/x → frac rule / apply integral"),
        (r"\int_{0}^{1}xdx", "x → basic / apply integral"),
        (r"\int_{0}^{1}5dx", "Hằng số 5 → basic / apply integral"),
        (r"\int_{0}^{1}\sqrt[2]{x}dx", "sqrt(x) → sqrt rule"),
        (r"\int_{0}^{1}{x}^{3}*\sin{x}dx", "x^3 * sin(x) → phức tạp"),
    ]
    
    print("\n" + "=" * 70)
    print("🧪 TEST VỚI CÁC MẪU CỐ ĐỊNH")
    print("=" * 70)
    
    for i, (latex, description) in enumerate(test_cases, 1):
        result = predict_action(model, latex)
        
        print(f"\n  [{i:2d}] {description}")
        print(f"       LaTeX: {latex}")
        
        if result['predicted_action'] is not None:
            print(f"       → Action: {result['predicted_action']} ({result['action_name']})")
            if result['probabilities']:
                # Chỉ hiển thị top-3 xác suất
                top3 = sorted(result['probabilities'].items(), key=lambda x: -x[1])[:3]
                proba_str = ", ".join(
                    f"a{a}={p:.2f}" for a, p in top3
                )
                print(f"       → Top-3: {proba_str}")
        else:
            print(f"       → ❌ PARSE ERROR")
    
    print("\n" + "=" * 70)
    print(f"✅ Đã test {len(test_cases)} mẫu.")
    print("=" * 70)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN – CLI
# ─────────────────────────────────────────────────────────────────────────────

def main():
    """
    CLI chính để test mô hình.
    
    Usage:
        python test_model.py                    → Chạy test mẫu cố định
        python test_model.py --interactive      → Chế độ test tương tác
        python test_model.py --evaluate         → Đánh giá trên dataset
        python test_model.py --predict "LaTeX"  → Dự đoán 1 biểu thức
        python test_model.py --all              → Chạy tất cả các test
    """
    import argparse
    
    parser = argparse.ArgumentParser(
        description="🧪 Test mô hình phân loại hành động tích phân"
    )
    parser.add_argument(
        '--model', type=str, default=None,
        help='Đường dẫn tới file model .pkl'
    )
    parser.add_argument(
        '--interactive', '-i', action='store_true',
        help='Chế độ test tương tác (nhập LaTeX thủ công)'
    )
    parser.add_argument(
        '--evaluate', '-e', action='store_true',
        help='Đánh giá mô hình trên dataset'
    )
    parser.add_argument(
        '--predict', '-p', type=str, default=None,
        help='Dự đoán action cho 1 biểu thức LaTeX'
    )
    parser.add_argument(
        '--all', '-a', action='store_true',
        help='Chạy tất cả: test mẫu + đánh giá dataset'
    )
    parser.add_argument(
        '--dataset', type=str, default=None,
        help='Đường dẫn tới dataset CSV (cho --evaluate)'
    )
    
    args = parser.parse_args()
    
    # ── Load model ──
    print("\n" + "─" * 60)
    print("🔄 Đang load model...")
    model = load_model(args.model)
    
    # ── Load meta ──
    meta = load_meta()
    if meta:
        print(f"📋 Model: {meta.get('best_model', '?')}")
        print(f"   F1-macro (test khi train): {meta.get('f1_macro_test', '?'):.4f}")
        print(f"   Classes: {meta.get('classes', '?')}")
    print("─" * 60)
    
    # ── Xử lý theo mode ──
    if args.predict:
        result = predict_action(model, args.predict)
        print(f"\n📌 Biểu thức: {result['latex']}")
        if result['predicted_action'] is not None:
            print(f"🎯 Action: {result['predicted_action']} ({result['action_name']})")
            if result['probabilities']:
                print("📊 Xác suất:")
                for action, prob in sorted(result['probabilities'].items(), key=lambda x: -x[1]):
                    name = ACTION_NAMES.get(action, f"?{action}")
                    print(f"    action={action}: {prob:.4f} ({name})")
        else:
            print("❌ Không thể parse biểu thức!")
    
    elif args.interactive:
        interactive_test(model)
    
    elif args.evaluate:
        evaluate_on_dataset(model, args.dataset)
    
    elif args.all:
        run_predefined_tests(model)
        print()
        evaluate_on_dataset(model, args.dataset)
    
    else:
        # Mặc định: chạy test mẫu cố định
        run_predefined_tests(model)


if __name__ == '__main__':
    main()
