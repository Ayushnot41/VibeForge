# -*- coding: utf-8 -*-
"""
Train a Goal-to-Career Text Classifier using TF-IDF + LogisticRegression.
Saves vectorizer and model to ml/models/ directory.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(SCRIPT_DIR, "data", "career_goals_dataset.csv")
MODEL_DIR  = os.path.join(SCRIPT_DIR, "models")
VEC_PATH   = os.path.join(MODEL_DIR, "vectorizer.pkl")
CLF_PATH   = os.path.join(MODEL_DIR, "classifier.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)

# ── Load Data ─────────────────────────────────────────────────────────────────
print("=" * 60)
print("VibeForge — Career Goal Classifier Training")
print("=" * 60)

df = pd.read_csv(DATA_PATH)
print(f"\n[OK] Loaded {len(df)} samples from {DATA_PATH}")
print(f"   Label distribution:\n{df['label'].value_counts().to_string()}\n")

X = df["text"].str.lower().str.strip()
y = df["label"]

# ── Train / Test Split ────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"   Train: {len(X_train)} samples | Test: {len(X_test)} samples\n")

# ── Vectorize ─────────────────────────────────────────────────────────────────
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    stop_words="english",
    max_features=5000,
    sublinear_tf=True,
)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec  = vectorizer.transform(X_test)

# ── Train Both Candidates & Pick Best ─────────────────────────────────────────
lr = LogisticRegression(max_iter=1000, C=5.0, random_state=42)
lr.fit(X_train_vec, y_train)
lr_acc = accuracy_score(y_test, lr.predict(X_test_vec))

nb = MultinomialNB(alpha=0.1)
nb.fit(X_train_vec, y_train)
nb_acc = accuracy_score(y_test, nb.predict(X_test_vec))

print(f"   LogisticRegression accuracy: {lr_acc:.4f}")
print(f"   MultinomialNB         accuracy: {nb_acc:.4f}")

if lr_acc >= nb_acc:
    best_clf = lr
    best_name = "LogisticRegression"
else:
    best_clf = nb
    best_name = "MultinomialNB"

print(f"\n[BEST] Selected: {best_name} (accuracy = {max(lr_acc, nb_acc):.4f})\n")

# ── Evaluation ────────────────────────────────────────────────────────────────
y_pred = best_clf.predict(X_test_vec)
print("─" * 60)
print("Classification Report:")
print("─" * 60)
print(classification_report(y_test, y_pred))

print("─" * 60)
print("Confusion Matrix (rows=true, cols=predicted):")
labels = sorted(y.unique())
cm = confusion_matrix(y_test, y_pred, labels=labels)
cm_df = pd.DataFrame(cm, index=labels, columns=labels)
print(cm_df.to_string())
print("─" * 60)

# ── Save Models ───────────────────────────────────────────────────────────────
joblib.dump(vectorizer, VEC_PATH)
joblib.dump(best_clf,   CLF_PATH)
print(f"\n[SAVED] Vectorizer -> {VEC_PATH}")
print(f"[SAVED] Classifier -> {CLF_PATH}")
print("\n[DONE] Career Classifier training complete!\n")
