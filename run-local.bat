@echo off
echo 🚀 Starting Mug Punters Investment Research Platform (Local Mode)
echo.

echo 📋 Prerequisites Check:
echo    - Node.js 18+ (for frontend)
echo    - Python 3.11+ (for backend)
echo    - PostgreSQL (optional - will use SQLite if not available)
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    echo    The frontend requires Node.js to run.
    pause
    exit /b 1
) else (
    echo ✅ Node.js found
)

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+ from https://python.org/
    echo    The backend requires Python to run.
    pause
    exit /b 1
) else (
    echo ✅ Python found
)

echo.
echo 🛠️  Setting up the application...

REM Setup Frontend
echo 📦 Installing frontend dependencies...
cd frontend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
echo ✅ Frontend dependencies ready

REM Setup Backend
echo 📦 Installing backend dependencies...
cd ..\backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies ready

echo.
echo 🚀 Starting services...

REM Start Backend in background
echo Starting backend server...
start "Mug Punters Backend" cmd /k "cd /d %cd% && call venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 5 /nobreak >nul

REM Start Frontend
echo Starting frontend server...
cd ..\frontend
start "Mug Punters Frontend" cmd /k "npm start"

echo.
echo ✅ Services starting up!
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Documentation: http://localhost:8000/docs
echo.
echo 📝 Note: This is a development setup using SQLite database.
echo    For production, configure PostgreSQL in the .env file.
echo.
echo 🛑 To stop the services, close the command windows that opened.
echo.
pause
