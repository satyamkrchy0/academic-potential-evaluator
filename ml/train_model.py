"""
=============================================================
  Academic Potential Evaluator — ANN Model Training
  Day 3–5 Script | Satyam Kumar | Course 2M043
=============================================================

What this script does:
  - Loads preprocessed student data
  - Builds a clean ANN with TensorFlow/Keras
  - Trains with early stopping
  - Evaluates: accuracy, F1-score, confusion matrix
  - Saves model as  model.h5
  - Saves scaler as scaler.pkl  (needed by Nikhil's API)
  - Generates training curve plots

Run:
  pip install tensorflow scikit-learn matplotlib seaborn joblib
  python train_model.py
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, f1_score

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# ── Reproducibility ───────────────────────────────────────────
np.random.seed(42)
tf.random.set_seed(42)

print("=" * 55)
print("  ANN Training — Academic Potential Evaluator")
print("=" * 55)
print(f"  TensorFlow version: {tf.__version__}")

# ── 1. Load Data ──────────────────────────────────────────────
df = pd.read_csv('student_dataset.csv')

features = ['grades', 'attendance', 'test_score',
            'co_curricular', 'study_hours', 'assignments']

X = df[features].values
y_raw = df['potential'].values

# ── 2. Encode Labels ──────────────────────────────────────────
# Low=0, Medium=1, High=2
label_map  = {'Low': 0, 'Medium': 1, 'High': 2}
label_names = ['Low', 'Medium', 'High']
y = np.array([label_map[v] for v in y_raw])

# ── 3. Scale Features ─────────────────────────────────────────
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# Save scaler → Nikhil needs this to scale incoming API requests
joblib.dump(scaler, 'scaler.pkl')
print("\n  Scaler saved → scaler.pkl")

# ── 4. Train / Test Split ─────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\n  Train samples : {len(X_train)}")
print(f"  Test  samples : {len(X_test)}")

# ── 5. Build ANN Architecture ─────────────────────────────────
"""
Architecture:
  Input  → 6 neurons (one per feature)
  Dense  → 64 neurons, ReLU, Dropout 0.3
  Dense  → 32 neurons, ReLU, Dropout 0.2
  Dense  → 16 neurons, ReLU
  Output → 3 neurons, Softmax (3 classes)
"""

model = keras.Sequential([
    layers.Input(shape=(6,)),

    layers.Dense(64, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.3),

    layers.Dense(32, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.2),

    layers.Dense(16, activation='relu'),

    layers.Dense(3, activation='softmax')  # 3 output classes
], name='AcademicPotentialANN')

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# ── 6. Train ──────────────────────────────────────────────────
early_stop = keras.callbacks.EarlyStopping(
    monitor='val_loss', patience=15, restore_best_weights=True
)

reduce_lr = keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss', factor=0.5, patience=7, min_lr=1e-5, verbose=0
)

print("\n  Training...")
history = model.fit(
    X_train, y_train,
    validation_split=0.15,
    epochs=150,
    batch_size=32,
    callbacks=[early_stop, reduce_lr],
    verbose=1
)

# ── 7. Evaluate ───────────────────────────────────────────────
y_pred_probs = model.predict(X_test, verbose=0)
y_pred = np.argmax(y_pred_probs, axis=1)

test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
f1 = f1_score(y_test, y_pred, average='weighted')

print("\n" + "=" * 55)
print("  EVALUATION RESULTS")
print("=" * 55)
print(f"  Test Accuracy  : {test_acc*100:.2f}%")
print(f"  Weighted F1    : {f1:.4f}")
print(f"  Test Loss      : {test_loss:.4f}")
print("\n  Classification Report:")
print(classification_report(y_test, y_pred, target_names=label_names))

# ── 8. Confusion Matrix ───────────────────────────────────────
cm = confusion_matrix(y_test, y_pred)
fig, ax = plt.subplots(figsize=(7, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=label_names, yticklabels=label_names,
            linewidths=0.5, ax=ax)
ax.set_title(f'Confusion Matrix  (Acc: {test_acc*100:.1f}%  F1: {f1:.3f})',
             fontweight='bold', fontsize=12)
ax.set_ylabel('Actual')
ax.set_xlabel('Predicted')
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=150, bbox_inches='tight')
plt.close()
print("\n  Saved → confusion_matrix.png")

# ── 9. Training Curves ────────────────────────────────────────
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5))
fig.suptitle('Training History', fontsize=13, fontweight='bold')

ax1.plot(history.history['loss'],     label='Train Loss', color='#4f9cf9')
ax1.plot(history.history['val_loss'], label='Val Loss',   color='#fb923c')
ax1.set_title('Loss'); ax1.set_xlabel('Epoch'); ax1.legend()

ax2.plot(history.history['accuracy'],     label='Train Acc', color='#4f9cf9')
ax2.plot(history.history['val_accuracy'], label='Val Acc',   color='#34d399')
ax2.set_title('Accuracy'); ax2.set_xlabel('Epoch'); ax2.legend()

plt.tight_layout()
plt.savefig('training_curves.png', dpi=150, bbox_inches='tight')
plt.close()
print("  Saved → training_curves.png")

# ── 10. Save Model ────────────────────────────────────────────
model.save('model.h5')
print("  Saved → model.h5")

# ── 11. Inference Test (for Nikhil) ──────────────────────────
print("\n" + "=" * 55)
print("  QUICK INFERENCE TEST (what Nikhil's API will receive)")
print("=" * 55)
sample = {
    'grades': 85, 'attendance': 90, 'test_score': 78,
    'co_curricular': 7, 'study_hours': 6, 'assignments': 88
}
sample_array = np.array([[sample[f] for f in features]])
sample_scaled = scaler.transform(sample_array)
pred_probs = model.predict(sample_scaled, verbose=0)[0]
pred_label = label_names[np.argmax(pred_probs)]

print(f"  Input   : {sample}")
print(f"  Output  : {pred_label}")
print(f"  Probs   : Low={pred_probs[0]:.3f} | Medium={pred_probs[1]:.3f} | High={pred_probs[2]:.3f}")
print("\n  All done! Hand off model.h5 + scaler.pkl to Nikhil.")
print("=" * 55)
