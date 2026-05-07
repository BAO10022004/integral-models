"""
prepare_clean_dataset.py
────────────────────────
Chuẩn bị dataset sạch để train model:

1. Đọc dataset.csv
2. Xoá dòng rỗng
3. Loại bỏ mâu thuẫn nhãn: nếu expression xuất hiện với nhãn "có chủ đích"
   (7, 6, 2, 3, 4, 8) thì xoá bản nhãn 0 trùng cùng expression đó.
4. Thêm các mẫu action 7 (u = ax+b) chuẩn để tăng coverage.
5. Lưu ra dataset_clean.csv

Run:
    python -m ai.model.prepare_clean_dataset
"""

import csv
import os
import sys
from collections import defaultdict, Counter

# ── Paths ──
_DIR = os.path.dirname(__file__)
INPUT_CSV  = os.path.normpath(os.path.join(_DIR, '..', 'data', 'processed', 'dataset.csv'))
OUTPUT_CSV = os.path.normpath(os.path.join(_DIR, '..', 'data', 'processed', 'dataset_clean.csv'))

# ── Nhãn có ưu tiên cao hơn nhãn 0 khi mâu thuẫn ──
PRIORITY_OVER_ZERO = {'7', '6', '2', '3', '4', '8', '1'}

# ── Mẫu action 7 bổ sung (đổi biến u = ax+b) – các dạng chuẩn ──
EXTRA_ACTION7 = [
    # sin/cos/tan(ax+b)
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
    # sqrt[n](ax+b)
    (r"\int_{0}^{1}\sqrt[2]{x+1}dx",   "7"),
    (r"\int_{0}^{1}\sqrt[2]{2*x}dx",   "7"),
    (r"\int_{0}^{1}\sqrt[2]{2*x+1}dx", "7"),
    (r"\int_{0}^{1}\sqrt[3]{x+1}dx",   "7"),
    (r"\int_{0}^{1}\sqrt[3]{2*x}dx",   "7"),
    (r"\int_{0}^{1}\sqrt[3]{3*x+1}dx", "7"),
    # (ax+b)^n
    (r"\int_{0}^{1}{x+1}^{2}dx",       "7"),
    (r"\int_{0}^{1}{x+1}^{3}dx",       "7"),
    (r"\int_{0}^{1}{x-1}^{3}dx",       "7"),
    (r"\int_{0}^{1}{2*x+1}^{3}dx",     "7"),
    (r"\int_{0}^{1}{2*x}^{3}dx",       "6"),  # dạng (ax)^n → action 6 (đặc trưng)
    (r"\int_{0}^{1}{2*x}^{4}dx",       "6"),
    # log(ax+b)
    (r"\int_{1}^{2}\ln{x+1}dx",        "8"),  # ln(x+1) → từng phần, giữ nguyên
    # dạng đơn – baseline action 0 (không mâu thuẫn)
    (r"\int_{0}^{1}\sin{x}dx",         "0"),
    (r"\int_{0}^{1}\cos{x}dx",         "0"),
    (r"\int_{0}^{1}\tan{x}dx",         "0"),
    (r"\int_{0}^{1}{x}^{2}dx",         "0"),
    (r"\int_{0}^{1}{x}^{3}dx",         "0"),
    (r"\int_{0}^{1}\sqrt[2]{x}dx",     "0"),
    (r"\int_{0}^{1}\sqrt[3]{x}dx",     "0"),
]


def main():
    # ── Đọc dataset gốc ──
    with open(INPUT_CSV, encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        rows = [r for r in reader if r['integrand'].strip()]

    print(f"Tổng số mẫu ban đầu: {len(rows)}")
    cnt_orig = Counter(r['action'] for r in rows)
    print("Phân phối ban đầu:", dict(sorted(cnt_orig.items())))

    # ── Xác định nhãn ưu tiên của mỗi expression ──
    expr_actions = defaultdict(set)
    for r in rows:
        expr_actions[r['integrand'].strip()].add(r['action'])

    conflicted = {k: v for k, v in expr_actions.items() if len(v) > 1}
    print(f"\nSố expression mâu thuẫn: {len(conflicted)}")

    # In ra một số ví dụ mâu thuẫn
    shown = 0
    for expr, acts in sorted(conflicted.items()):
        if shown >= 15:
            break
        print(f"  {expr[:72]}  → actions = {sorted(acts)}")
        shown += 1

    # ── Lọc: xoá nhãn 0 khi có nhãn ưu tiên ──
    def should_keep(row):
        key = row['integrand'].strip()
        acts = expr_actions[key]
        if len(acts) == 1:
            return True
        if row['action'] == '0' and (acts & PRIORITY_OVER_ZERO):
            return False
        return True

    cleaned = [r for r in rows if should_keep(r)]
    removed = len(rows) - len(cleaned)
    print(f"\nSau khi loại mâu thuẫn: {len(cleaned)} mẫu (đã xoá {removed} mẫu noise)")

    # ── Thêm mẫu bổ sung ──
    existing = {r['integrand'].strip() for r in cleaned}
    added = 0
    for expr, action in EXTRA_ACTION7:
        key = expr.strip()
        if key not in existing:
            cleaned.append({'integrand': expr, 'action': action})
            existing.add(key)
            added += 1
    print(f"Đã thêm {added} mẫu bổ sung.")
    print(f"Tổng mẫu cuối: {len(cleaned)}")

    cnt_final = Counter(r['action'] for r in cleaned)
    print("Phân phối cuối:", dict(sorted(cnt_final.items())))

    # ── Ghi file ──
    with open(OUTPUT_CSV, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['integrand', 'action'])
        writer.writeheader()
        writer.writerows(cleaned)

    print(f"\n✅ Dataset sạch lưu tại: {OUTPUT_CSV}")


if __name__ == '__main__':
    main()
