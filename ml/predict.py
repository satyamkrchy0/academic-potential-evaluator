"""
=============================================================
  Academic Potential Evaluator — Inference Helper
  Handoff to Nikhil (API Dev) | Satyam Kumar | Course 2M043
=============================================================

Nikhil — import predict_potential() inside your Flask/FastAPI.

Requirements:
  pip install tensorflow scikit-learn joblib numpy

Files needed (from Satyam):
  model.h5    → trained ANN model
  scaler.pkl  → fitted MinMaxScaler

Usage example:
  from predict import predict_potential
  result = predict_potential(grades=85, attendance=90,
                             test_score=78, co_curricular=7,
                             study_hours=6, assignments=88)
  print(result)
  # {
  #   "prediction": "High",
  #   "confidence": 0.91,
  #   "probabilities": {"Low": 0.02, "Medium": 0.07, "High": 0.91}
  # }
"""

import numpy as np
import joblib
from tensorflow import keras

# ── Load model & scaler once at import time (fast!) ──────────
MODEL_PATH  = 'model.h5'
SCALER_PATH = 'scaler.pkl'

model  = keras.models.load_model(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

FEATURES     = ['grades', 'attendance', 'test_score',
                'co_curricular', 'study_hours', 'assignments']
LABEL_NAMES  = ['Low', 'Medium', 'High']

# ── Validation rules ─────────────────────────────────────────
VALID_RANGES = {
    'grades'       : (0, 100),
    'attendance'   : (0, 100),
    'test_score'   : (0, 100),
    'co_curricular': (0, 10),
    'study_hours'  : (0, 24),
    'assignments'  : (0, 100),
}


def predict_potential(grades: float, attendance: float, test_score: float,
                      co_curricular: float, study_hours: float,
                      assignments: float) -> dict:
    """
    Predict a student's academic potential.

    Parameters
    ----------
    grades        : float  — average grade (0–100)
    attendance    : float  — attendance percentage (0–100)
    test_score    : float  — test/exam score (0–100)
    co_curricular : float  — co-curricular activity score (0–10)
    study_hours   : float  — average study hours per day (0–24)
    assignments   : float  — assignment completion rate (0–100)

    Returns
    -------
    dict with keys:
      prediction    : str   — "Low" | "Medium" | "High"
      confidence    : float — probability of the predicted class
      probabilities : dict  — all class probabilities
    """

    inputs = {
        'grades'       : grades,
        'attendance'   : attendance,
        'test_score'   : test_score,
        'co_curricular': co_curricular,
        'study_hours'  : study_hours,
        'assignments'  : assignments,
    }

    # ── Validate ─────────────────────────────────────────────
    errors = []
    for field, value in inputs.items():
        lo, hi = VALID_RANGES[field]
        if not isinstance(value, (int, float)):
            errors.append(f"'{field}' must be a number, got {type(value).__name__}")
        elif not (lo <= value <= hi):
            errors.append(f"'{field}' must be between {lo} and {hi}, got {value}")
    if errors:
        raise ValueError(f"Input validation failed: {'; '.join(errors)}")

    # ── Scale & Predict ───────────────────────────────────────
    arr = np.array([[inputs[f] for f in FEATURES]])
    arr_scaled = scaler.transform(arr)

    probs = model.predict(arr_scaled, verbose=0)[0]
    pred_idx = int(np.argmax(probs))

    return {
        "prediction"   : LABEL_NAMES[pred_idx],
        "confidence"   : round(float(probs[pred_idx]), 4),
        "probabilities": {
            "Low"   : round(float(probs[0]), 4),
            "Medium": round(float(probs[1]), 4),
            "High"  : round(float(probs[2]), 4),
        }
    }


# ── Quick test when run directly ─────────────────────────────
if __name__ == '__main__':
    test_cases = [
        dict(grades=90, attendance=95, test_score=88, co_curricular=8, study_hours=7, assignments=92),
        dict(grades=55, attendance=60, test_score=50, co_curricular=3, study_hours=2, assignments=45),
        dict(grades=72, attendance=75, test_score=68, co_curricular=5, study_hours=4, assignments=70),
    ]
    for i, tc in enumerate(test_cases, 1):
        result = predict_potential(**tc)
        print(f"Test {i}: Input={tc}")
        print(f"        → {result}\n")
