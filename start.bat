@echo off
echo 🚀 Starting Mug Punters Investment Research Platform...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your API keys and configuration before continuing.
    echo    You can start the application with: docker-compose up -d
    pause
    exit /b 1
)

REM Start the application
echo 🐳 Starting Docker containers...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services started successfully!
    echo.
    echo 🌐 Application URLs:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:8000
    echo    API Documentation: http://localhost:8000/docs
    echo.
    echo 📊 Database:
    echo    PostgreSQL: localhost:5432
    echo    Redis: localhost:6379
    echo.
    echo 🛠️  Useful commands:
    echo    View logs: docker-compose logs -f
    echo    Stop services: docker-compose down
    echo    Restart services: docker-compose restart
) else (
    echo ❌ Failed to start services. Check logs with: docker-compose logs
    pause
    exit /b 1
)

pause
