# Academic Potential Evaluator — ANN + API System

> An artificial neural network (ANN) based system that evaluates a student's academic potential (High / Medium / Low) using key performance indicators, served via a RESTful API.

**Course:** 2M043 — Problem Based Statement  
**Team:** Satyam Kumar · Nikhil Pandey · Yashika Khurana  

---

## What This Project Does

This system takes a student's academic data as input and predicts their potential category using a trained neural network. The prediction is served through a REST API and displayed on a web interface.

```
Student Data → ANN Model → Potential: High / Medium / Low
              (via REST API)
```

**Input features:**
- Grades (0–100)
- Attendance percentage (0–100)
- Test score (0–100)
- Co-curricular activity score (0–10)
- Study hours per day (0–24)
- Assignment completion rate (0–100)

**Output:** `High`, `Medium`, or `Low` potential with confidence probabilities

---

## Project Structure

```
academic-potential-evaluator/
│
├── ml/                          # Satyam — AI/ML
│   ├── generate_dataset.py      # Synthetic dataset generator (1000 students)
│   ├── eda.py                   # Exploratory data analysis + plots
│   ├── train_model.py           # ANN training script
│   ├── predict.py               # Inference helper (used by API)
│   ├── model.h5                 # Trained ANN model
│   ├── scaler.pkl               # Fitted MinMaxScaler
│   └── student_dataset.csv      # Generated dataset
│
├── api/                         # Nikhil — Backend
│   ├── app.py                   # Flask / FastAPI server
│   ├── requirements.txt         # API dependencies
│   └── tests/                   # Unit + integration tests
│
├── frontend/                    # Yashika — UI
│   ├── index.html               # Student input form
│   └── results.html             # Prediction results display
│
└── README.md
```

---

## Model Architecture

```
Input (6)  →  Dense(64, ReLU) + BatchNorm + Dropout(0.3)
           →  Dense(32, ReLU) + BatchNorm + Dropout(0.2)
           →  Dense(16, ReLU)
           →  Output(3, Softmax)
```

| Parameter | Value |
|---|---|
| Framework | TensorFlow / Keras |
| Optimizer | Adam (lr = 0.001) |
| Loss | Sparse Categorical Crossentropy |
| Epochs | Up to 150 (early stopping) |
| Batch size | 32 |
| Train / Test split | 80% / 20% |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/predict` | Returns potential prediction |
| `GET` | `/health` | Health check |
| `GET` | `/model-info` | Model metadata |

**Sample request:**
```json
POST /predict
{
  "grades": 85,
  "attendance": 90,
  "test_score": 78,
  "co_curricular": 7,
  "study_hours": 6,
  "assignments": 88
}
```

**Sample response:**
```json
{
  "prediction": "High",
  "confidence": 0.999,
  "probabilities": {
    "Low": 0.000,
    "Medium": 0.001,
    "High": 0.999
  }
}
```

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/academic-potential-evaluator.git
cd academic-potential-evaluator
```

### 2. Set up the ML environment
```bash
pip install pandas numpy matplotlib seaborn scikit-learn tensorflow joblib
```

### 3. Generate dataset and train model
```bash
cd ml/
python generate_dataset.py   # creates student_dataset.csv
python eda.py                # runs EDA, saves plots
python train_model.py        # trains ANN, saves model.h5 + scaler.pkl
```

### 4. Run the API
```bash
cd api/
pip install -r requirements.txt
python app.py
# API runs at http://localhost:5000
```

### 5. Open the frontend
Open `frontend/index.html` in your browser and enter student data to get a prediction.

---

## Results

| Metric | Value |
|---|---|
| Test Accuracy | ~82%+ |
| Weighted F1 Score | ~0.80+ |
| Dataset size | 1000 students (synthetic) |
| Classes | High / Medium / Low |

Training curves, confusion matrix, and EDA plots are saved in `ml/` after running the scripts.

---

## Team & Responsibilities

| Member | Role | Responsibilities |
|---|---|---|
| **Satyam Kumar** | AI/ML Lead | Dataset, EDA, ANN model, serialization |
| **Nikhil Pandey** | Backend & API | Flask/FastAPI, endpoints, validation, tests |
| **Yashika Khurana** | Frontend & Docs | Web UI, API integration, report, slides |

---

## Tech Stack

- **ML:** Python, TensorFlow/Keras, scikit-learn, pandas, NumPy
- **API:** Flask / FastAPI
- **Frontend:** HTML, CSS, JavaScript
- **Visualization:** Matplotlib, Seaborn

---

## Course

**2M043 — Problem Based Statement**  
Academic Potential Evaluator — ANN + API System
