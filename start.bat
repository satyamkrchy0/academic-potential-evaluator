@echo off
echo =======================================================
echo 🎓 EmployEdge - Starting Full Stack Environment
echo =======================================================

echo [1/3] Starting Python ML API...
cd ml-api
start cmd /k "python app.py"
cd ..

echo [2/3] Starting Node.js Backend...
cd backend
start cmd /k "npm run dev"
cd ..

echo [3/3] Starting Frontend...
cd frontend
start cmd /k "python -m http.server 3000"
cd ..

echo =======================================================
echo ✅ All services starting!
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend:  http://localhost:4000
echo 🧠 ML API:   http://localhost:5001
echo =======================================================
