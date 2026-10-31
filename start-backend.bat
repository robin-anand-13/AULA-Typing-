@echo off
setlocal
title Aula.Typing - Backend Server (Port 3001)
cd /d "%~dp0backend"
if errorlevel 1 (
    echo Backend folder not found.
    pause
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js was not found in PATH. Install Node.js and try again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo npm was not found in PATH. Install Node.js and try again.
    pause
    exit /b 1
)

echo ===================================================
echo Starting Aula.Typing Backend Server on port 3001...
echo ===================================================
echo Building TypeScript...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Check TypeScript errors above.
    pause
    exit /b 1
)
echo Build successful. Starting server...
call npm start
pause
