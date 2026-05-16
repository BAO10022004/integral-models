"""
Test NHÓM 7: Phân biệt inner=x (class 0) vs inner=ax+b (class 4)
"""
import sys
sys.path.insert(0, '.')

from ai.model.feature_extractor import extract_features

test_cases = [
    # (latex, expected_class, description)
    (r'\int sin(x) dx',        0, 'sin(x)        → class 0 (inner=x)'),
    (r'\int sin(x+1) dx',      4, 'sin(x+1)      → class 4 (inner=x+1, offset)'),
    (r'\int sin(2x) dx',       4, 'sin(2x)        → class 4 (inner=2x, coeff)'),
    (r'\int cos(x) dx',        0, 'cos(x)         → class 0'),
    (r'\int cos(x+1) dx',      4, 'cos(x+1)       → class 4'),
    (r'\int x^3 dx',           0, 'x^3            → class 0 (mono inner=x)'),
    (r'\int {x+1}^{3} dx',     4, '(x+1)^3        → class 4 (mono inner=x+1)'),
    (r'\int e^x dx',           0, 'e^x            → class 0 (exp inner=x)'),
    (r'\int e^{x+1} dx',       4, 'e^(x+1)        → class 4 (exp inner=x+1)'),
    (r'\int \ln(x) dx',        0, 'ln(x)          → class 0 (log inner=x)'),
    (r'\int \ln(x+1) dx',      4, 'ln(x+1)        → class 4 (log inner=x+1)'),
    (r'\int \sqrt[2]{x} dx',   0, 'sqrt(x)        → class 0'),
    (r'\int \sqrt[2]{x+1} dx', 4, 'sqrt(x+1)      → class 4'),
]

KEY_FEATS = [
    'trig_inner_pure_x', 'trig_inner_ax_plus_b', 'trig_inner_offset', 'trig_inner_coeff',
    'mono_inner_pure_x', 'mono_inner_ax_plus_b', 'mono_inner_offset',
    'sqrt_inner_pure_x', 'sqrt_inner_ax_plus_b',
    'log_inner_pure_x',  'log_inner_ax_plus_b',
    'exp_inner_pure_x',  'exp_inner_ax_plus_b',
    'any_func_inner_pure_x', 'any_func_inner_ax_plus_b',
    'inner_is_x_plus_const', 'inner_offset_not_zero',
    'root_func_class0_signal', 'root_func_class4_signal',
]

print("=" * 70)
print(f"{'Expression':<32} {'Expected':>8} {'c0_sig':>6} {'c4_sig':>6}  Active features")
print("=" * 70)

ok = err = 0
for latex, expected, desc in test_cases:
    f = extract_features(latex)
    if f is None:
        print(f"[PARSE ERROR] {desc}")
        err += 1
        continue

    c0 = f.get('root_func_class0_signal', 0)
    c4 = f.get('root_func_class4_signal', 0)

    active = [k for k in KEY_FEATS if f.get(k, 0) == 1
              and k not in ('root_func_class0_signal', 'root_func_class4_signal')]

    predicted = 0 if c0 else (4 if c4 else '?')
    correct   = '✅' if predicted == expected else '❌'
    print(f"{correct} {desc:<40} c0={c0} c4={c4}  [{', '.join(active)}]")

    if predicted == expected:
        ok += 1
    else:
        err += 1

print("=" * 70)
print(f"Kết quả: {ok}/{ok+err} đúng")
