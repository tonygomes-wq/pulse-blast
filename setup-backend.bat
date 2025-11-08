@echo off
echo ================================================
echo Pulse Blast - Backend Setup Script
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Node.js found: 
node --version
echo.

REM Navigate to backend directory
cd backend
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend directory not found!
    pause
    exit /b 1
)

echo [2/5] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo [3/5] Checking environment configuration...
if not exist .env (
    echo WARNING: .env file not found!
    echo Creating .env from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env and update:
    echo   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
    echo   - JWT_SECRET (use a secure random string)
    echo.
    pause
)
echo.

echo [4/5] Database setup reminder...
echo.
echo Please ensure you have:
echo   1. Created the MySQL database: faceso56_wats
echo   2. Executed the SQL schema from: backend\database\schema.sql
echo.
echo You can run the schema using:
echo   - phpMyAdmin (Hostgator cPanel)
echo   - MySQL Workbench
echo   - Command line: mysql -u USER -p DATABASE ^< database\schema.sql
echo.
pause

echo [5/5] Starting development server...
echo.
echo Server will start on http://localhost:3001
echo Press Ctrl+C to stop the server
echo.
call npm run dev

pause
