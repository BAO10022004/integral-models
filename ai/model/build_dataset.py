"""
build_dataset.py
────────────────
Script standalone thay thế notebook extract_features.ipynb + prepare_clean_dataset.py.

Thực hiện toàn bộ pipeline:
  1. Đọc dataset.csv
  2. Làm sạch (loại nhãn 0 mâu thuẫn với nhãn ưu tiên)
  3. Extract features từ mỗi expression
  4. Lưu integral_dataset.csv để train

Run:
    python -m ai.model.build_dataset
    python -m ai.model.build_dataset --input ai/data/processed/dataset.csv
"""

import sys
import os
import argparse
import csv
from collections import defaultdict, Counter

import pandas as pd

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from ai.model.feature_extractor import extract_features

# ── Paths ──
from ai.model.config import LABEL_REMAP, VALID_OLD_LABELS

# ― Paths ―
_DIR = os.path.dirname(__file__)
DEFAULT_INPUT  = os.path.normpath(os.path.join(_DIR, '..', 'data', 'processed', 'dataset.csv'))
DEFAULT_OUTPUT = os.path.normpath(os.path.join(_DIR, '..', 'data', 'processed', 'integral_dataset.csv'))
CLEAN_CSV      = os.path.normpath(os.path.join(_DIR, '..', 'data', 'processed', 'dataset_clean.csv'))

# Ngưỡng tối thiểu mẫu mỗi class (sau remap)
MIN_SAMPLES_PER_CLASS = 50

# Nhãn có ưu tiên hơn nhãn 0 khi mâu thuẫn (dùng nhãn cũ)
PRIORITY_OVER_ZERO = {'1', '3', '6', '7', '8'}

# Mẫu bổ sung (dùng nhãn cũ, sẽ được remap sau)
EXTRA_SAMPLES = [
    # sin/cos/tan(ax+b) → old action 7 (u-sub)
    (r"\int_{0}^{1}\sin{2*x}dx",       "7"),
    (r"\int_{0}^{1}\sin{3*x}dx",       "7"),
    (r"\int_{0}^{1}\sin{x+1}dx",       "7"),
    (r"\int_{0}^{1}\sin{2*x+1}dx",     "7"),
    (r"\int_{0}^{1}\cos{2*x}dx",       "7"),
    (r"\int_{0}^{1}\cos{3*x}dx",       "7"),
    (r"\int_{0}^{1}\cos{x+1}dx",       "7"),
    (r"\int_{0}^{1}\cos{2*x+1}dx",     "7"),
    (r"\int_{0}^{1}\tan{2*x}dx",       "7"),
    (r"\int_{0}^{1}\tan{x+1}dx",       "7"),
    (r"\int_{0}^{1}\tan{3*x}dx",       "7"),
    (r"\int_{0}^{1}\tan{2*x+1}dx",     "7"),
    # sqrt[n](ax+b) → old action 7
    (r"\int_{0}^{1}\sqrt[2]{x+1}dx",   "7"),
    (r"\int_{0}^{1}\sqrt[2]{2*x}dx",   "7"),
    (r"\int_{0}^{1}\sqrt[2]{2*x+1}dx", "7"),
    (r"\int_{0}^{1}\sqrt[3]{x+1}dx",   "7"),
    (r"\int_{0}^{1}\sqrt[3]{2*x}dx",   "7"),
    (r"\int_{0}^{1}\sqrt[3]{3*x+1}dx", "7"),
    # (ax+b)^n → old action 7
    (r"\int_{0}^{1}{x+1}^{2}dx",       "7"),
    (r"\int_{0}^{1}{x+1}^{3}dx",       "7"),
    (r"\int_{0}^{1}{x-1}^{2}dx",       "7"),
    (r"\int_{0}^{1}{x-1}^{3}dx",       "7"),
    (r"\int_{0}^{1}{2*x+1}^{3}dx",     "7"),
    (r"\int_{0}^{1}{3*x+2}^{2}dx",     "7"),
    # (ax)^n → old action 6 (công thức đặc trưng)
    (r"\int_{0}^{1}{2*x}^{2}dx",       "6"),
    (r"\int_{0}^{1}{2*x}^{3}dx",       "6"),
    (r"\int_{0}^{1}{2*x}^{4}dx",       "6"),
    (r"\int_{0}^{1}{3*x}^{2}dx",       "6"),
    # action 0 cơ bản
    (r"\int_{0}^{1}\sin{x}dx",         "0"),
    (r"\int_{0}^{1}\cos{x}dx",         "0"),
    (r"\int_{0}^{1}\tan{x}dx",         "0"),
    (r"\int_{0}^{1}{x}^{2}dx",         "0"),
    (r"\int_{0}^{1}{x}^{3}dx",         "0"),
    (r"\int_{0}^{1}{x}^{4}dx",         "0"),
    (r"\int_{0}^{1}\sqrt{x}dx",        "0"),
    (r"\int_{0}^{1}\sqrt[2]{x}dx",     "0"),
    (r"\int_{0}^{1}\sqrt[3]{x}dx",     "0"),
    (r"\int_{4}^{2}1dx",               "0"),
    (r"\int_{4}^{2}\frac{1}{x}dx",     "0"),
]


def load_and_clean(input_path: str) -> list:
    """Đọc CSV và loại bỏ nhãn 0 mâu thuẫn."""
    with open(input_path, encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        rows = [r for r in reader if r['integrand'].strip()]

    print(f"[1] Đọc {len(rows)} mẫu từ {os.path.basename(input_path)}")

    # Xác định action của mỗi expression
    expr_actions = defaultdict(set)
    for r in rows:
        expr_actions[r['integrand'].strip()].add(r['action'])

    conflicted = sum(1 for v in expr_actions.values() if len(v) > 1)
    print(f"[2] Tìm thấy {conflicted} expression mâu thuẫn (nhiều nhãn)")

    def keep(row):
        key = row['integrand'].strip()
        acts = expr_actions[key]
        if len(acts) == 1:
            return True
        # Xoá nhãn 0 nếu có nhãn ưu tiên khác
        if row['action'] == '0' and (acts & PRIORITY_OVER_ZERO):
            return False
        return True

    cleaned = [r for r in rows if keep(r)]
    print(f"[3] Sau làm sạch: {len(cleaned)} mẫu (loại {len(rows)-len(cleaned)})")
    return cleaned


def add_extra_samples(rows: list) -> list:
    """Thêm mẫu bổ sung nếu chưa có."""
    existing = {r['integrand'].strip() for r in rows}
    added = 0
    for expr, action in EXTRA_SAMPLES:
        if expr.strip() not in existing:
            rows.append({'integrand': expr, 'action': action})
            existing.add(expr.strip())
            added += 1
    print(f"[4] Thêm {added} mẫu bổ sung")
    return rows


def extract_all_features(rows: list) -> pd.DataFrame:
    """Extract features cho tất cả expression."""
    records = []
    failed = 0
    skipped_label = 0
    for r in rows:
        # Chỉ xử lý nhãn cũ hợp lệ
        try:
            old_label = int(r['action'])
        except (ValueError, TypeError):
            skipped_label += 1
            continue

        if old_label not in VALID_OLD_LABELS:
            skipped_label += 1
            continue

        feats = extract_features(r['integrand'])
        if feats is None:
            failed += 1
            continue

        # Remap nhãn cũ → nhãn mới
        feats['label'] = LABEL_REMAP[old_label]
        records.append(feats)

    print(f"[5] Extract features: OK={len(records)}, FAIL={failed}, skip_label={skipped_label}")
    df = pd.DataFrame(records)
    return df


def filter_min_samples(df: pd.DataFrame, min_samples: int) -> pd.DataFrame:
    """
    Loại bỏ các class có số mẫu < min_samples (tính theo nhãn mới).
    """
    cnt = Counter(df['label'])
    keep_labels = {k for k, v in cnt.items() if v >= min_samples}
    dropped = {k: v for k, v in cnt.items() if v < min_samples}
    if dropped:
        print(f"[6] Loại class ít mẫu (< {min_samples}): {dict(sorted(dropped.items()))}")    
    df_filtered = df[df['label'].isin(keep_labels)].copy()
    print(f"[6] Sau filter: {len(df_filtered)} mẫu, giữ {sorted(keep_labels)} classes")
    return df_filtered


def main():
    parser = argparse.ArgumentParser(description="Build integral_dataset.csv")
    parser.add_argument('--input',  default=DEFAULT_INPUT,  help='Input CSV path')
    parser.add_argument('--output', default=DEFAULT_OUTPUT, help='Output CSV path')
    parser.add_argument('--no-extra', action='store_true',  help='Không thêm mẫu bổ sung')
    args = parser.parse_args()

    print("=" * 60)
    print("🔨 BUILD DATASET PIPELINE")
    print("=" * 60)

    # 1. Load & clean
    rows = load_and_clean(args.input)

    # 2. Thêm mẫu bổ sung
    if not args.no_extra:
        rows = add_extra_samples(rows)

    # Lưu dataset_clean.csv (vẫn dùng nhãn cũ)
    with open(CLEAN_CSV, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['integrand', 'action'])
        w.writeheader()
        w.writerows(rows)
    print(f"[+] Đã lưu dataset_clean.csv ({len(rows)} mẫu)")

    # 3. Extract features + remap nhãn cũ → mới
    df = extract_all_features(rows)

    # 4. Filter class < MIN_SAMPLES_PER_CLASS
    df = filter_min_samples(df, MIN_SAMPLES_PER_CLASS)

    # 5. Thống kê
    cnt = Counter(df['label'])
    print("\nPhân phối nhãn cuối (nhãn mới 0-5):")
    for k in sorted(cnt):
        print(f"  action={k:2d}: {cnt[k]:4d} ({cnt[k]/len(df)*100:.1f}%)")

    print(f"\nShape: {df.shape}  |  Features: {df.shape[1]-1}")

    # 6. Lưu
    df.to_csv(args.output, index=False)
    print(f"\n✅ Đã lưu: {args.output}")
    print("=" * 60)


if __name__ == '__main__':
    main()
