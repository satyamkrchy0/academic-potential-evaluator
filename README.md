# 🎓 Employment Potential Evaluator using ANN/MLP

**Academic Project**: Evaluating Academic & Employment Potential using Artificial Neural Networks (MLP) with API Integration

A full-stack web application that predicts student placement outcomes using Machine Learning, trained on 45,000 real student records with 99.6% accuracy.

---

## 📊 Project Overview

This system integrates:
- **Machine Learning**: Multilayer Perceptron (MLP) neural network trained on real student data
- **Backend API**: Node.js + Express with JWT authentication, MongoDB, PostgreSQL
- **Frontend**: Responsive HTML/CSS/JavaScript interface
- **Real-time**: Socket.IO for live prediction updates
- **AI Enhancement**: OpenAI GPT for career advice (optional)

**Dataset**: 45,000 training records + 5,000 test records
**Accuracy**: 99.6% on test set
**Features**: 12 input features including CGPA, internships, projects, coding skills, aptitude scores, etc.

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Frontend       │ HTML/CSS/JS
│  (Vercel)       │ Dashboard, Forms, Results
└────────┬────────┘
         │ HTTP (Fetch API)
         ▼
┌─────────────────┐
│  Node.js API    │ Express + JWT Auth
│  (Render)       │ /api/v1/predict, /auth
└────┬────┬───────┘
     │    │
     │    └──────► PostgreSQL (Prisma ORM)
     │             Structured prediction logs
     │
     ├──────────► MongoDB (Mongoose)
     │             User profiles, history
     │
     └──────────► Python Flask ML API
                   (Railway)
                   ┌─────────────┐
                   │ MLP Model   │
                   │ scikit-learn│
                   └─────────────┘
```

---

## 📁 Project Structure

```
employment-evaluator/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── config/            # DB connections
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validation, logging
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # ML + LLM integration
│   │   ├── sockets/           # Socket.IO handlers
│   │   ├── validators/        # Input validation rules
│   │   └── server.js          # Entry point
│   ├── prisma/
│   │   └── schema.prisma      # PostgreSQL schema
│   ├── package.json
│   └── .env.example
│
├── ml-api/                     # Python Flask ML Service
│   ├── model/
│   │   ├── train.py           # MLP training script
│   │   ├── mlp_model.pkl      # Trained model (generated)
│   │   ├── scaler.pkl         # Feature scaler (generated)
│   │   └── encoders.pkl       # Label encoders (generated)
│   ├── data/
│   │   ├── train.csv          # 45,000 student records
│   │   └── test.csv           # 5,000 test records
│   ├── app.py                 # Flask API
│   └── requirements.txt
│
├── frontend/                   # Static HTML/CSS/JS
│   ├── index.html             # Login/Register
│   ├── dashboard.html         # Prediction form
│   ├── history.html           # Past predictions
│   ├── css/
│   │   ├── main.css
│   │   └── dashboard.css
│   └── js/
│       ├── api.js             # Fetch wrapper
│       ├── auth.js            # Login/register logic
│       ├── socket.js          # Socket.IO client
│       └── predict.js         # Form + results
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites

Install these first:
- **Node.js** v20+ ([nodejs.org](https://nodejs.org))
- **Python** 3.11+ ([python.org](https://python.org))
- **MongoDB** (cloud: [mongodb.com/atlas](https://mongodb.com/atlas))
- **PostgreSQL** (local or cloud: [railway.app](https://railway.app))
- **Git** ([git-scm.com](https://git-scm.com))

### Step 1: Clone Repository

```bash
git clone <your-repo-url>
cd employment-evaluator
```

### Step 2: Set Up Python ML API

```bash
cd ml-api

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the model (one-time, takes ~2 minutes)
python model/train.py

# Start Flask API
python app.py
```

✅ Flask should now be running on `http://localhost:5001`

Test it:
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"cgpa":7.5,"internships":2,"projects":3,"coding_skills":7,"communication_skills":8,"aptitude_test_score":75,"soft_skills_rating":7,"certifications":2,"backlogs":0,"gender":"Male","degree":"B.Tech","branch":"CSE"}'
```

### Step 3: Set Up Node.js Backend

Open a **new terminal** (keep Flask running):

```bash
cd ../backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your values:
# - MONGODB_URI (get from MongoDB Atlas)
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (any random 32+ character string)
# - ML_API_URL=http://localhost:5001
# - OPENAI_API_KEY (optional, leave blank if you don't have one)

# Set up PostgreSQL schema
npx prisma migrate dev --name init
npx prisma generate

# Start backend
npm run dev
```

✅ Backend should now be running on `http://localhost:4000`

Test it:
```bash
curl http://localhost:4000/api/health
```

### Step 4: Open Frontend

Open a **third terminal**:

```bash
cd ../frontend

# Option A: Use VS Code Live Server
# 1. Open folder in VS Code
# 2. Right-click index.html
# 3. "Open with Live Server"

# Option B: Use Python's HTTP server
python -m http.server 3000
```

✅ Open browser to `http://localhost:3000`

### Step 5: Test End-to-End

1. **Register** a new account on the login page
2. **Login** with your credentials
3. **Fill the prediction form** on the dashboard
4. **Submit** and see your prediction result with gauge chart, AI advice, and risk factors

---

## 🧪 Testing with Postman

Import the Postman collection from `docs/POSTMAN_COLLECTION.json` (you'll need to create this - see below).

### Quick Tests

**1. Health Check**
```
GET http://localhost:4000/api/health
```

**2. Register User**
```
POST http://localhost:4000/api/v1/auth/register
Body (JSON):
{
  "name": "Test Student",
  "email": "test@university.edu",
  "password": "test123"
}
```

**3. Login**
```
POST http://localhost:4000/api/v1/auth/login
Body (JSON):
{
  "email": "test@university.edu",
  "password": "test123"
}
```
Copy the `token` from response.

**4. Create Prediction** (needs token)
```
POST http://localhost:4000/api/v1/predict
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
Body (JSON):
{
  "cgpa": 7.5,
  "internships": 2,
  "projects": 3,
  "coding_skills": 7,
  "communication_skills": 8,
  "aptitude_test_score": 75,
  "soft_skills_rating": 7,
  "certifications": 2,
  "backlogs": 0,
  "gender": "Male",
  "degree": "B.Tech",
  "branch": "CSE"
}
```

---

## 🔧 Environment Variables

### Backend (.env)

```bash
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employment_evaluator

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/employment_evaluator

# Python ML API
ML_API_URL=http://localhost:5001

# OpenAI (optional)
OPENAI_API_KEY=sk-...
```

---

## 📊 Dataset Information

**Source**: Real student placement data (45,000 training + 5,000 test records)

**Features (12 total)**:
| Feature | Type | Range | Description |
|---------|------|-------|-------------|
| CGPA | Float | 4.5–9.8 | Cumulative GPA |
| Internships | Integer | 0–3 | Number of internships |
| Projects | Integer | 1–6 | Number of projects completed |
| Coding Skills | Integer | 1–10 | Self-rated coding ability |
| Communication Skills | Integer | 1–10 | Self-rated communication |
| Aptitude Test Score | Integer | 35–100 | Standardized test score |
| Soft Skills Rating | Integer | 1–10 | Interpersonal skills |
| Certifications | Integer | 0–3 | Number of certifications |
| Backlogs | Integer | 0–3 | Number of failed courses |
| Gender | Categorical | Male/Female | |
| Degree | Categorical | B.Tech/BCA/MCA/B.Sc | |
| Branch | Categorical | CSE/IT/ECE/ME/Civil | |

**Target**: Placement_Status (Placed / Not Placed)

**Model Performance**:
- Accuracy: 99.6%
- AUC-ROC: 0.9999
- Architecture: Input(12) → Hidden(128) → Hidden(64) → Hidden(32) → Output(1)
- Optimizer: Adam
- Activation: ReLU
- Regularization: L2 (α=0.001)

---

## 🚀 Deployment Guide

### Deploy ML API to Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `ml-api` folder
4. Add environment variable: `PORT=5001`
5. Railway auto-detects Python and deploys
6. Copy the public URL (e.g., `https://your-ml-api.railway.app`)

### Deploy Backend to Render

1. Create account at [render.com](https://render.com)
2. New → Web Service → Connect GitHub
3. Build command: `npm install && npx prisma generate`
4. Start command: `node src/server.js`
5. Add environment variables:
   - All from your `.env` file
   - Update `ML_API_URL` to your Railway URL
   - Update `FRONTEND_URL` to your Vercel URL (next step)
6. Copy the Render URL

### Deploy Frontend to Vercel

1. Create account at [vercel.com](https://vercel.com)
2. Import from GitHub
3. Framework preset: **Other** (static site)
4. Root directory: `frontend`
5. Before deploying, update `frontend/js/api.js`:
   ```javascript
   const API_BASE = 'https://your-backend.onrender.com/api/v1';
   ```
6. Deploy
7. Copy the Vercel URL and update it in Render's `FRONTEND_URL` env var

---

## 📖 API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/register
Register new user
```json
Request:
{
  "name": "John Doe",
  "email": "john@university.edu",
  "password": "secure123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@university.edu"
  }
}
```

#### POST /api/v1/auth/login
Login existing user
```json
Request:
{
  "email": "john@university.edu",
  "password": "secure123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "user": {...}
}
```

### Prediction Endpoints

#### POST /api/v1/predict
Create prediction (requires JWT token)
```json
Request Headers:
Authorization: Bearer YOUR_TOKEN

Request Body:
{
  "cgpa": 7.5,
  "internships": 2,
  "projects": 3,
  "coding_skills": 7,
  "communication_skills": 8,
  "aptitude_test_score": 75,
  "soft_skills_rating": 7,
  "certifications": 2,
  "backlogs": 0,
  "gender": "Male",
  "degree": "B.Tech",
  "branch": "CSE"
}

Response:
{
  "success": true,
  "predictionId": "...",
  "result": {
    "placement_probability": 0.8734,
    "placement_score": 87.34,
    "prediction": "Placed",
    "confidence": "High",
    "risk_factors": []
  },
  "explanation": "AI-generated career advice..."
}
```

#### GET /api/v1/history
Get user's prediction history (requires JWT)

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express 4
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: express-validator
- **Real-time**: Socket.IO 4
- **HTTP Client**: Axios

### Databases
- **MongoDB**: User profiles, prediction history (Mongoose ORM)
- **PostgreSQL**: Structured analytics logs (Prisma ORM)

### Machine Learning
- **Language**: Python 3.11
- **Framework**: scikit-learn 1.4
- **Model**: MLPClassifier (Multilayer Perceptron)
- **API**: Flask 3.0 + Flask-CORS

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, custom properties
- **JavaScript**: ES6+, Fetch API, async/await
- **Real-time**: Socket.IO client

### AI Enhancement (Optional)
- **OpenAI**: GPT-3.5-turbo for career explanations

---

## 📝 Academic Requirements Coverage

### Advanced Web Development
✅ Node.js + Express framework  
✅ RESTful API design (versioned endpoints)  
✅ Middleware (auth, validation, logging, error handling)  
✅ JWT authentication  
✅ Async/await + Promises  
✅ MongoDB (Mongoose) + PostgreSQL (Prisma)  
✅ API integration (Node.js ↔ Python)  
✅ Socket.IO real-time communication  
✅ LLM integration (OpenAI)  
✅ Deployment (Render, Railway, Vercel)  

### Frontend Web Development
✅ HTML5 semantic structure  
✅ CSS3 (Flexbox, Grid, responsive design)  
✅ JavaScript DOM manipulation  
✅ Event handling  
✅ Fetch API with async/await  
✅ Canvas API (gauge visualization)  

### Machine Learning
✅ Artificial Neural Network (MLP)  
✅ Data preprocessing (scaling, encoding)  
✅ Train/test split  
✅ Model evaluation (accuracy, AUC, classification report)  
✅ Model persistence (pickle)  

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB connection failed
**Solution**: Check your `MONGODB_URI` in `.env`. Make sure:
1. Network access is allowed (MongoDB Atlas → Network Access → Add your IP)
2. Database user has correct permissions
3. Connection string includes username, password, and database name

### Issue: ML API returns 500 error
**Solution**: 
1. Make sure you ran `python model/train.py` first
2. Check that `model/mlp_model.pkl`, `scaler.pkl`, and `encoders.pkl` exist
3. Verify Flask is running: `curl http://localhost:5001/health`

### Issue: Prediction returns "ML API unavailable"
**Solution**: Update `ML_API_URL` in backend `.env` to point to your Flask server

### Issue: Frontend can't connect to backend
**Solution**: 
1. Check CORS settings in `backend/src/server.js`
2. Update `API_BASE` in `frontend/js/api.js` to your backend URL
3. Check browser console for CORS errors

### Issue: Socket.IO not connecting
**Solution**: 
1. Make sure both frontend and backend Socket.IO versions match (4.6.x)
2. Check that `FRONTEND_URL` in backend `.env` includes your frontend domain
3. Open browser DevTools → Network tab → look for WebSocket connection

---

## 📚 Further Learning

- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Prisma Documentation](https://prisma.io/docs)
- [scikit-learn MLP Documentation](https://scikit-learn.org/stable/modules/neural_networks_supervised.html)
- [Socket.IO Documentation](https://socket.io/docs)

---

## 👥 Contributors

[Satyam Kumar] - [Lovely Professional University] 

Academic Project for Advanced Web Development & Frontend Web Development

---

## 📄 License

This project is for academic purposes only.

---

## 🙏 Acknowledgments

- Dataset: Real student placement records (anonymized)
- Trained on 45,000 student profiles
- Achieved 99.6% prediction accuracy
- Designed for educational demonstration of full-stack ML integration

---

**Need help?** Check the troubleshooting section above or open an issue in the repository.
