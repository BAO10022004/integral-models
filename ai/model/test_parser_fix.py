"""Quick test to verify parser fixes."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from ai.utils.integral import Integral
from ai.model.feature_extractor import extract_features

# Test cases covering the problematic patterns
test_cases = [
    # Original failures
    (r'\int_{0}^{1}{x}^{3}dx',            'x^3 mono'),
    (r'\int_{0}^{1}{x+1}^{2}dx',          '(x+1)^2 expand'),
    (r'\int_{0}^{1}\sin(x)dx',             'sin(x) parentheses'),
    (r'\int_{0}^{1}\cos(x+1)dx',           'cos(x+1) parentheses'),
    
    # New: exponential 
    (r'\int_{0}^{1}x*e^{x}dx',            'x*e^x'),
    (r'\int_{0}^{1}e^{2*x}dx',            'e^{2x}'),
    (r'\int_{0}^{1}x*e^{-x}dx',           'x*e^{-x}'),
    (r'\int_{0}^{1}e^{\frac{x}{2}}dx',    'e^{x/2}'),
    
    # New: logarithm
    (r'\int_{1}^{2}\ln{x}dx',             'ln(x)'),
    (r'\int_{1}^{2}x*\ln{x}dx',           'x*ln(x)'),
    
    # New: complex bounds
    (r'\int_{0}^{\frac{\pi}{2}}{x}^{2}*\cos{x}dx', 'complex bounds pi/2'),
    (r'\int_{1}^{e}\ln{x}dx',             'bound=e'),
    
    # Inline x^2 pattern
    (r'\int_{0}^{1}\cos{x^2}dx',          'cos(x^2) inline power'),
    
    # Negative exponent
    (r'\int_{0}^{1}e^{-2*x}*\cos{2*x}dx', 'e^{-2x}*cos(2x)'),
]

print("=" * 70)
print("PARSER FIX VERIFICATION")
print("=" * 70)

passed = 0
failed = 0
for latex, desc in test_cases:
    f = extract_features(latex)
    if f is not None:
        status = "✅ OK"
        passed += 1
    else:
        status = "❌ FAIL"
        failed += 1
    print(f"  {status}  {desc:35s}  ({latex[:50]})")

print(f"\n{'=' * 70}")
print(f"Results: {passed} passed, {failed} failed out of {len(test_cases)}")
print(f"{'=' * 70}")

# Test full dataset
print("\n\nFULL DATASET TEST:")
import pandas as pd
df = pd.read_csv(os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'dataset.csv'))
df = df.head(250)
print(f"  Dataset size: {len(df)}")

features = df["integrand"].apply(extract_features)
valid = features.dropna()
failed_count = len(features) - len(valid)
print(f"  Successfully parsed: {len(valid)}")
print(f"  Parse failures: {failed_count}")
print(f"  Success rate: {len(valid)/len(df)*100:.1f}%")

# Show failed samples
if failed_count > 0:
    print(f"\n  Failed samples:")
    failed_idx = features[features.isna()].index
    for idx in failed_idx:
        print(f"    [{idx}] {df.iloc[idx]['integrand']}")
