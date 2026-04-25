"""
train.py — MLP Model Training using Real Student Dataset
Dataset: train.csv / test.csv (45,000 + 5,000 student records)

Features used:
  CGPA, Internships, Projects, Coding_Skills, Communication_Skills,
  Aptitude_Test_Score, Soft_Skills_Rating, Certifications, Backlogs,
  Gender, Degree, Branch

Target: Placement_Status (Placed / Not Placed)
"""

import pandas as pd
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, classification_report,
    confusion_matrix, roc_auc_score
)
import pickle
import os
import warnings
warnings.filterwarnings('ignore')

# ─── 1. Load Real Student Data ────────────────────────────────
def load_data(train_path='data/train.csv', test_path='data/test.csv'):
    train = pd.read_csv(train_path)
    test  = pd.read_csv(test_path)
    print(f"✅ Data loaded — Train: {train.shape}, Test: {test.shape}")
    return train, test


# ─── 2. Preprocess ───────────────────────────────────────────
def preprocess(train, test):
    """
    - Encode categorical columns: Gender, Degree, Branch
    - Select feature columns (drop Student_ID, Age, raw strings, target)
    - Encode target: Placed=1, Not Placed=0
    - StandardScale all features
    """
    le_gender = LabelEncoder()
    le_degree = LabelEncoder()
    le_branch  = LabelEncoder()

    # Fit on train, transform both (prevents data leakage)
    for df in [train, test]:
        df['Gender_enc'] = le_gender.fit_transform(df['Gender'])
        df['Degree_enc'] = le_degree.fit_transform(df['Degree'])
        df['Branch_enc'] = le_branch.fit_transform(df['Branch'])

    feature_cols = [
        'CGPA',                  # Academic performance (4.5–9.8)
        'Internships',           # Number of internships (0–3)
        'Projects',              # Number of projects (1–6)
        'Coding_Skills',         # Coding ability rating (1–10)
        'Communication_Skills',  # Communication rating (1–10)
        'Aptitude_Test_Score',   # Aptitude score (35–100)
        'Soft_Skills_Rating',    # Soft skills rating (1–10)
        'Certifications',        # Number of certifications (0–3)
        'Backlogs',              # Number of backlogs (0–3)
        'Gender_enc',            # Female=0, Male=1
        'Degree_enc',            # B.Sc=0, B.Tech=1, BCA=2, MCA=3
        'Branch_enc'             # CSE=0, Civil=1, ECE=2, IT=3, ME=4
    ]

    X_train = train[feature_cols]
    y_train = (train['Placement_Status'] == 'Placed').astype(int)
    X_test  = test[feature_cols]
    y_test  = (test['Placement_Status'] == 'Placed').astype(int)

    # Normalize features
    scaler     = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train)
    X_test_sc  = scaler.transform(X_test)

    print(f"✅ Preprocessed — Features: {len(feature_cols)}")
    print(f"   Train: Placed={y_train.sum()}, Not Placed={(y_train==0).sum()}")
    print(f"   Test:  Placed={y_test.sum()},  Not Placed={(y_test==0).sum()}")

    encoders = {'gender': le_gender, 'degree': le_degree, 'branch': le_branch}
    return X_train_sc, X_test_sc, y_train, y_test, scaler, encoders, feature_cols


# ─── 3. Train MLP ────────────────────────────────────────────
def train_model(X_train, y_train):
    """
    MLP Architecture:
      Input(12) → Hidden(128) → Hidden(64) → Hidden(32) → Output(1)
    Optimizer: Adam | Activation: ReLU | Regularization: L2
    """
    model = MLPClassifier(
        hidden_layer_sizes=(128, 64, 32),
        activation='relu',
        solver='adam',
        alpha=0.001,
        learning_rate_init=0.001,
        batch_size=64,
        max_iter=500,
        random_state=42,
        early_stopping=True,
        validation_fraction=0.1,
        verbose=True
    )
    model.fit(X_train, y_train)
    print(f"✅ Training complete — Iterations: {model.n_iter_}")
    return model


# ─── 4. Evaluate ─────────────────────────────────────────────
def evaluate_model(model, X_test, y_test):
    y_pred      = model.predict(X_test)
    y_pred_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_pred_prob)

    print("\n" + "="*55)
    print("📊 MODEL EVALUATION REPORT")
    print("="*55)
    print(f"Accuracy : {acc:.4f} ({acc*100:.2f}%)")
    print(f"AUC-ROC  : {auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred,
                                target_names=['Not Placed', 'Placed']))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    return acc, auc


# ─── 5. Save Artifacts ───────────────────────────────────────
def save_artifacts(model, scaler, encoders, feature_cols):
    os.makedirs('model', exist_ok=True)
    with open('model/mlp_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open('model/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    with open('model/encoders.pkl', 'wb') as f:
        pickle.dump(encoders, f)
    with open('model/features.pkl', 'wb') as f:
        pickle.dump(feature_cols, f)
    print("\n✅ Saved: mlp_model.pkl, scaler.pkl, encoders.pkl, features.pkl")


# ─── Main ─────────────────────────────────────────────────────
if __name__ == '__main__':
    train, test         = load_data('data/train.csv', 'data/test.csv')
    X_train, X_test, y_train, y_test, scaler, encoders, feature_cols = preprocess(train, test)
    model               = train_model(X_train, y_train)
    evaluate_model(model, X_test, y_test)
    save_artifacts(model, scaler, encoders, feature_cols)
