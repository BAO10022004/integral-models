"""
retrain.py
----------
Chạy lại toàn bộ pipeline:
  1. Re-extract features (dùng feature_extractor.py đã được update)
  2. Lưu integral_dataset.csv mới
  3. Retrain GradientBoosting
  4. Lưu best_model.pkl
"""

import sys, os, warnings, json
warnings.filterwarnings('ignore')
sys.path.append(os.path.abspath('.'))

import pandas as pd
import numpy as np
from collections import Counter
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import f1_score, classification_report
import joblib

from ai.model.feature_extractor import extract_features

# ── 1. Load raw dataset ──────────────────────────────────────────────────────
df_clean = pd.read_csv('ai/data/processed/dataset.csv')
print(f'[1] Dataset raw: {len(df_clean)} mau')

# ── 2. Re-extract features ───────────────────────────────────────────────────
features = df_clean['integrand'].apply(extract_features)
features = features.dropna()
df = pd.DataFrame(features.tolist())
df['label'] = df_clean.loc[features.index, 'action']
df['label'] = df['label'].fillna(0).astype(int)
print(f'[2] Feature extract xong: {df.shape[0]} mau, {df.shape[1]-1} features')

# Kiem tra features moi ton tai
for feat in ('root_add_one_side_const', 'root_add_both_nontrivial'):
    if feat in df.columns:
        print(f'    ✅ {feat} OK')
    else:
        print(f'    ❌ {feat} MISSING – kiem tra feature_extractor.py')

# Xem gia tri trung binh cua features moi theo tung class
print()
print('Mean cua features moi theo class:')
print(df.groupby('label')[['root_add_one_side_const', 'root_add_both_nontrivial']].mean().round(3))
print()

# ── 3. Luu CSV moi ───────────────────────────────────────────────────────────
csv_path = 'ai/data/processed/integral_dataset.csv'
df.to_csv(csv_path, index=False)
print(f'[3] Da luu {csv_path}')

# ── 4. Retrain ───────────────────────────────────────────────────────────────
y = df['label']
X = df.drop(columns=['label'])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f'[4] Train: {len(y_train)} | Test: {len(y_test)}')

classes_train = np.unique(y_train)
cw_train = compute_class_weight('balanced', classes=classes_train, y=y_train)
cw_dict_train = dict(zip(classes_train, cw_train))
sample_weights = np.array([cw_dict_train.get(label, 1.0) for label in y_train])

gb = GradientBoostingClassifier(
    n_estimators=200, learning_rate=0.1,
    max_depth=4, random_state=42
)
print('[5] Dang train Gradient Boosting...')
gb.fit(X_train, y_train, sample_weight=sample_weights)

y_pred = gb.predict(X_test)
f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
print(f'\n[6] Test F1-macro: {f1:.4f}')
print(classification_report(y_test, y_pred, zero_division=0))

# ── 5. Kiem tra case loi ─────────────────────────────────────────────────────
print('=== Kiem tra case loi cu: sin{x}+9 ===')
test_latex = r'\int_{0}^{1}\sin{x}+9dx'
feat = extract_features(test_latex)
if feat is None:
    print('  PARSE ERROR')
else:
    print(f'  root_add_one_side_const : {feat.get("root_add_one_side_const", "N/A")}')
    print(f'  root_add_both_nontrivial: {feat.get("root_add_both_nontrivial", "N/A")}')
    print(f'  root_is_add_or_sub      : {feat.get("root_is_add_or_sub", "N/A")}')
    feat_df = pd.DataFrame([feat])
    # Align columns voi training data
    missing_cols = set(X_train.columns) - set(feat_df.columns)
    for c in missing_cols:
        feat_df[c] = 0
    feat_df = feat_df[X_train.columns]
    pred = gb.predict(feat_df)[0]
    prob = gb.predict_proba(feat_df)[0]
    print(f'  Prediction: action {pred}  (expected: 2 = apply_split)')
    print(f'  Probabilities: {dict(enumerate(prob.round(3)))}')

# ── 6. Save ──────────────────────────────────────────────────────────────────
save_dir = 'ai/saved_models'
os.makedirs(save_dir, exist_ok=True)
joblib.dump(gb, os.path.join(save_dir, 'best_model.pkl'))
meta = {
    'best_model': 'GradientBoosting',
    'f1_macro_test': round(f1, 4),
    'n_classes': len(sorted(y.unique())),
    'classes': sorted(int(c) for c in y.unique()),
    'note': 'Added root_add_one_side_const + root_add_both_nontrivial features'
}
with open(os.path.join(save_dir, 'model_meta.json'), 'w', encoding='utf-8') as f:
    json.dump(meta, f, indent=2, ensure_ascii=False)
print('\n[7] Da luu best_model.pkl va model_meta.json ✅')
