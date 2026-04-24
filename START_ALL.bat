@echo off
title GameLiminals - Server ^& Tunnel
color 0a
cls

echo ====================================================
echo   GAMELIMINALS - COMPLETE SYSTEM STARTER
echo ====================================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    pause
    exit /b
)

:: Start Node.js Server in a new window
echo [1/2] Starting Node.js Server...
start "GameLiminals Server" cmd /c "node server.js"

:: Wait a few seconds for server to initialize
timeout /t 3 >nul

:: Start Ngrok Tunnel in a new window
echo [2/2] Starting Ngrok Tunnel...
start 
"GameLiminals Tunnel" cmd /c "ngrok http 127.0.0.1:8000 --url=compositional-sedimentary-in.ngrok-free.dev"
echo.
echo ====================================================
echo   SUCCESS: BOTH SERVICES ARE STARTING!
echo ====================================================
echo.
echo 1. Keep the "GameLiminals Server" window open.
echo 2. Keep the "GameLiminals Tunnel" window open.
echo 3. Access your site at: 
echo    https://compositional-sedimentary-in.ngrok-free.dev
echo.
echo You can close THIS window now.
pause
