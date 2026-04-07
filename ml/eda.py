"""
=============================================================
  Academic Potential Evaluator — EDA Script
  Day 2 Script | Satyam Kumar | Course 2M043
=============================================================

What this script does:
  - Loads student_dataset.csv
  - Checks for nulls, data types, class balance
  - Plots distributions, correlations, boxplots
  - Normalizes features + encodes label
  - Saves preprocessed data to student_preprocessed.csv

Run:
  pip install pandas numpy matplotlib seaborn scikit-learn
  python eda.py
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import MinMaxScaler, LabelEncoder

# ── 1. Load Data ──────────────────────────────────────────────
df = pd.read_csv('student_dataset.csv')
features = ['grades', 'attendance', 'test_score', 'co_curricular', 'study_hours', 'assignments']

print("=" * 55)
print("  EDA — Academic Potential Evaluator")
print("=" * 55)
print(f"\nShape     : {df.shape}")
print(f"Columns   : {list(df.columns)}")
print(f"\nNull Values:\n{df.isnull().sum().to_string()}")
print(f"\nData Types:\n{df.dtypes.to_string()}")

# ── 2. Class Distribution ─────────────────────────────────────
print(f"\nLabel Distribution:\n{df['potential'].value_counts().to_string()}")
print(f"\nLabel % :\n{(df['potential'].value_counts(normalize=True)*100).round(1).to_string()}")

# ── 3. Plots ──────────────────────────────────────────────────
sns.set_theme(style='darkgrid', palette='muted')
fig, axes = plt.subplots(2, 3, figsize=(16, 9))
fig.suptitle('Feature Distributions by Academic Potential', fontsize=15, fontweight='bold', y=1.01)

colors = {'High': '#4f9cf9', 'Medium': '#a78bfa', 'Low': '#fb923c'}

for ax, feat in zip(axes.flatten(), features):
    for label, grp in df.groupby('potential'):
        ax.hist(grp[feat], bins=25, alpha=0.6, label=label, color=colors[label])
    ax.set_title(feat.replace('_', ' ').title(), fontsize=11)
    ax.set_xlabel(feat)
    ax.set_ylabel('Count')
    ax.legend(fontsize=8)

plt.tight_layout()
plt.savefig('eda_distributions.png', dpi=150, bbox_inches='tight')
plt.close()
print("\n  Saved → eda_distributions.png")

# ── 4. Correlation Heatmap ────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 6))
corr = df[features].corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', ax=ax,
            linewidths=0.5, square=True)
ax.set_title('Feature Correlation Heatmap', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.savefig('eda_correlation.png', dpi=150, bbox_inches='tight')
plt.close()
print("  Saved → eda_correlation.png")

# ── 5. Boxplots ───────────────────────────────────────────────
fig, axes = plt.subplots(2, 3, figsize=(16, 9))
fig.suptitle('Feature Spread per Potential Category', fontsize=14, fontweight='bold')
order = ['Low', 'Medium', 'High']
palette = {'Low': '#fb923c', 'Medium': '#a78bfa', 'High': '#4f9cf9'}

for ax, feat in zip(axes.flatten(), features):
    sns.boxplot(data=df, x='potential', y=feat, order=order, palette=palette, ax=ax)
    ax.set_title(feat.replace('_', ' ').title())
    ax.set_xlabel('')

plt.tight_layout()
plt.savefig('eda_boxplots.png', dpi=150, bbox_inches='tight')
plt.close()
print("  Saved → eda_boxplots.png")

# ── 6. Label Count Bar ────────────────────────────────────────
fig, ax = plt.subplots(figsize=(6, 4))
counts = df['potential'].value_counts()[order]
bars = ax.bar(counts.index, counts.values,
              color=[palette[l] for l in counts.index], edgecolor='white', linewidth=1.2)
ax.bar_label(bars, fontsize=11, fontweight='bold')
ax.set_title('Class Distribution (Label Balance)', fontsize=12, fontweight='bold')
ax.set_ylabel('Number of Students')
ax.set_ylim(0, max(counts.values) * 1.2)
plt.tight_layout()
plt.savefig('eda_class_balance.png', dpi=150, bbox_inches='tight')
plt.close()
print("  Saved → eda_class_balance.png")

# ── 7. Preprocessing: Normalize + Encode ──────────────────────
scaler = MinMaxScaler()
df_processed = df.copy()
df_processed[features] = scaler.fit_transform(df[features])

# Encode label: Low=0, Medium=1, High=2
label_map = {'Low': 0, 'Medium': 1, 'High': 2}
df_processed['label'] = df_processed['potential'].map(label_map)

# Save
df_processed.to_csv('student_preprocessed.csv', index=False)
print("\n  Saved → student_preprocessed.csv")

# ── 8. Summary ────────────────────────────────────────────────
print("\n  Preprocessed Feature Stats (scaled 0–1):")
print(df_processed[features].describe().round(3).to_string())
print("\n  Label encoding → Low:0  Medium:1  High:2")
print("\n  EDA Complete! All plots saved.")
print("=" * 55)
