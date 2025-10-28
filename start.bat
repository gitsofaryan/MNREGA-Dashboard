@echo off
REM MGNREGA Dashboard - Quick Start Script for Windows
REM Built for Bharat by Aryan Jain

echo.
echo ======================================
echo    MGNREGA Dashboard - Build for Bharat
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo.
echo [OK] npm version:
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
echo.
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed successfully!
echo.

REM Start development server
echo Starting development server...
echo.
echo Dashboard will open at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
