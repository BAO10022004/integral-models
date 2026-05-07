"""
clean_dataset.py
----------------
Làm sạch dataset:
  1. Phát hiện expression giống nhau nhưng có action khác nhau (mâu thuẫn).
  2. Các expression cùng mẫu với action 7 mà bị gán nhãn 0 → xoá hoặc sửa.
  3. Xuất dataset sạch ra file mới.

Quy tắc ưu tiên:
  - Nếu expression xuất hiện với action 7 ở bất kỳ chỗ nào,
    thì tất cả bản sao nhãn 0 đều bị loại (vì 0 thường là noise/incorrect).
  - Giữ nhãn 7 (đổi biến u=ax+b) là đúng khi inner là ax+b.
"""

import csv
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

INPUT_CSV  = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'dataset.csv')
OUTPUT_CSV = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'dataset_clean.csv')

def main():
    with open(INPUT_CSV, encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        rows = [r for r in reader if r['integrand'].strip()]  # bỏ dòng rỗng

    print(f"Tổng số mẫu ban đầu: {len(rows)}")

    # Đếm phân phối gốc
    from collections import Counter, defaultdict
    cnt = Counter(r['action'] for r in rows)
    print("Phân phối ban đầu:", dict(sorted(cnt.items())))

    # Nhóm các expression theo integrand (chuẩn hoá khoảng trắng)
    expr_to_actions = defaultdict(set)
    for r in rows:
        key = r['integrand'].strip()
        expr_to_actions[key].add(r['action'])

    # Tìm các expression mâu thuẫn
    conflicted = {k: v for k, v in expr_to_actions.items() if len(v) > 1}
    print(f"\nSố expression mâu thuẫn (có nhiều label): {len(conflicted)}")
    for expr, acts in sorted(conflicted.items())[:20]:
        print(f"  {expr[:70]}  →  actions={sorted(acts)}")

    # Quy tắc làm sạch:
    # - Nếu expression có action 7, xoá bản nhãn 0 (noise từ auto-generation)
    # - Tương tự với action 6, 2, 3, 4, 8 (các nhãn "có chủ đích") vs 0
    PRIORITY_OVER_ZERO = {'7', '6', '2', '3', '4', '8', '1'}

    def should_keep(row, expr_actions):
        action = row['action']
        key = row['integrand'].strip()
        acts = expr_actions[key]
        if len(acts) == 1:
            return True  # không mâu thuẫn → giữ
        # Có mâu thuẫn
        if action == '0' and (acts & PRIORITY_OVER_ZERO):
            return False  # bỏ nhãn 0 khi có nhãn ưu tiên khác
        return True

    cleaned_rows = [r for r in rows if should_keep(r, expr_to_actions)]
    print(f"\nSau khi làm sạch: {len(cleaned_rows)} mẫu (loại {len(rows) - len(cleaned_rows)} mẫu noise)")

    cnt2 = Counter(r['action'] for r in cleaned_rows)
    print("Phân phối sau khi làm sạch:", dict(sorted(cnt2.items())))

    # Ghi file
    with open(OUTPUT_CSV, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['integrand', 'action'])
        writer.writeheader()
        writer.writerows(cleaned_rows)

    print(f"\n✅ Dataset sạch đã lưu vào: {OUTPUT_CSV}")


if __name__ == '__main__':
    main()
