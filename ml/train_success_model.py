# -*- coding: utf-8 -*-
"""
Generate synthetic success dataset and train a Success Probability model.
Features: avg_completion_percent, completion_trend, weeks_elapsed_ratio, num_checkins_missed
Label: on_track (1) or at_risk (0)
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_PATH   = os.path.join(SCRIPT_DIR, "data", "success_dataset.csv")
MODEL_DIR   = os.path.join(SCRIPT_DIR, "models")
MODEL_PATH  = os.path.join(MODEL_DIR, "success_model.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("VibeForge — Success Probability Model Training")
print("=" * 60)

# ── Generate Synthetic Dataset ────────────────────────────────────────────────
rng = np.random.default_rng(seed=7)
N   = 280

avg_completion   = rng.uniform(0, 100, N)
completion_trend = rng.uniform(-2.0, 2.0, N)   # slope per week (pct pts/wk)
weeks_elapsed_ratio = rng.uniform(0.05, 0.95, N)
num_missed       = rng.integers(0, 8, N).astype(float)

# Probabilistic labelling logic:
# High completion + positive trend + few missed → on_track
score = (
    0.45 * (avg_completion / 100.0)
    + 0.25 * ((completion_trend + 2) / 4.0)   # normalise to [0,1]
    + 0.15 * (1.0 - weeks_elapsed_ratio)       # earlier = more buffer
    + 0.15 * (1.0 - np.clip(num_missed / 7.0, 0, 1))
)
# Add noise so it's not perfectly separable
score += rng.normal(0, 0.08, N)
label = (score > 0.52).astype(int)   # 1 = on_track, 0 = at_risk

df = pd.DataFrame({
    "avg_completion_percent": avg_completion.round(2),
    "completion_trend":       completion_trend.round(4),
    "weeks_elapsed_ratio":    weeks_elapsed_ratio.round(4),
    "num_checkins_missed":    num_missed.astype(int),
    "label":                  label,
})
df.to_csv(DATA_PATH, index=False)
print(f"\n[OK] Generated {N}-row synthetic dataset -> {DATA_PATH}")
print(f"   on_track={label.sum()} | at_risk={N - label.sum()}\n")

# ── Train / Test Split ────────────────────────────────────────────────────────
FEATURES = ["avg_completion_percent", "completion_trend", "weeks_elapsed_ratio", "num_checkins_missed"]
X = df[FEATURES]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

# ── Train RandomForest ────────────────────────────────────────────────────────
clf = RandomForestClassifier(
    n_estimators=200,
    max_depth=6,
    min_samples_leaf=3,
    random_state=42,
    class_weight="balanced",
)
clf.fit(X_train, y_train)

# ── Evaluation ────────────────────────────────────────────────────────────────
y_pred = clf.predict(X_test)
acc = accuracy_score(y_test, y_pred)

print("─" * 60)
print("Classification Report:")
print("─" * 60)
print(classification_report(y_test, y_pred, target_names=["at_risk", "on_track"]))

print("─" * 60)
print("Feature Importances:")
for feat, imp in sorted(zip(FEATURES, clf.feature_importances_), key=lambda x: -x[1]):
    bar = "█" * int(imp * 40)
    print(f"  {feat:<30} {bar} {imp:.4f}")
print("─" * 60)
print(f"\n[OK] Test Accuracy: {acc:.4f}")

# -- Save Model ---
joblib.dump(clf, MODEL_PATH)
print(f"[SAVED] Model -> {MODEL_PATH}")
print("\n[DONE] Success Probability Model training complete!\n")
