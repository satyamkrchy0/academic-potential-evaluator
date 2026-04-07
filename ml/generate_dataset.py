"""
=============================================================
  Academic Potential Evaluator — Synthetic Dataset Generator
  Day 1 Script | Satyam Kumar | Course 2M043
=============================================================

What this script does:
  - Generates a realistic synthetic student dataset (1000 rows)
  - Features: grades, attendance, test_score, co_curricular, study_hours, assignments
  - Label: potential → High / Medium / Low
  - Saves to 'student_dataset.csv'

Run:
  pip install pandas numpy
  python generate_dataset.py
"""

import numpy as np
import pandas as pd

# ── Reproducibility ──────────────────────────────────────────
np.random.seed(42)
N = 1000  # number of students

# ── Generate raw features ─────────────────────────────────────

# Grades (0–100): average of multiple subjects
grades = np.clip(np.random.normal(loc=65, scale=18, size=N), 0, 100).round(2)

# Attendance (0–100 %)
attendance = np.clip(np.random.normal(loc=75, scale=15, size=N), 0, 100).round(2)

# Test Score (0–100): mid-sem / end-sem combined score
test_score = np.clip(np.random.normal(loc=62, scale=20, size=N), 0, 100).round(2)

# Co-curricular score (0–10): clubs, sports, events
co_curricular = np.clip(np.random.normal(loc=5, scale=2.5, size=N), 0, 10).round(2)

# Study hours per day (0–12)
study_hours = np.clip(np.random.normal(loc=4, scale=2, size=N), 0, 12).round(2)

# Assignment completion rate (0–100 %)
assignments = np.clip(np.random.normal(loc=70, scale=20, size=N), 0, 100).round(2)

# ── Build DataFrame ───────────────────────────────────────────
df = pd.DataFrame({
    'student_id'   : [f'STU{str(i).zfill(4)}' for i in range(1, N+1)],
    'grades'       : grades,
    'attendance'   : attendance,
    'test_score'   : test_score,
    'co_curricular': co_curricular,
    'study_hours'  : study_hours,
    'assignments'  : assignments,
})

# ── Create label using a weighted composite score ─────────────
# Each feature contributes a realistic weight to "potential"
df['composite'] = (
    df['grades']        * 0.30 +
    df['attendance']    * 0.20 +
    df['test_score']    * 0.25 +
    df['co_curricular'] * 10 * 0.10 +   # scale 0–10 → 0–100
    df['study_hours']   * (100/12) * 0.10 +  # scale 0–12 → 0–100
    df['assignments']   * 0.05
)

# Add a little noise so it's not perfectly deterministic
df['composite'] += np.random.normal(0, 3, N)
df['composite'] = df['composite'].clip(0, 100)

# Assign label based on composite percentile thresholds
high_thresh   = df['composite'].quantile(0.65)   # top 35%  → High
medium_thresh = df['composite'].quantile(0.30)   # next 35% → Medium
                                                  # bottom 30% → Low

def assign_label(score):
    if score >= high_thresh:
        return 'High'
    elif score >= medium_thresh:
        return 'Medium'
    else:
        return 'Low'

df['potential'] = df['composite'].apply(assign_label)

# Drop helper column — not an input feature
df.drop(columns=['composite'], inplace=True)

# ── Save ──────────────────────────────────────────────────────
df.to_csv('student_dataset.csv', index=False)

# ── Quick sanity report ───────────────────────────────────────
print("=" * 50)
print("  Dataset Generated Successfully!")
print("=" * 50)
print(f"\n  Rows    : {len(df)}")
print(f"  Columns : {list(df.columns)}")
print("\n  Label Distribution:")
print(df['potential'].value_counts().to_string())
print("\n  Feature Stats:")
print(df.describe().round(2).to_string())
print("\n  First 5 rows:")
print(df.head().to_string())
print("\n  Saved to → student_dataset.csv")
print("=" * 50)
