@echo off
title GameLiminals - Stop All Services
color 0c
cls

echo ====================================================
echo   GAMELIMINALS - STOPPING ALL SERVICES
echo ====================================================
echo.

:: Kill Node.js (Server)
echo [1/2] Stopping Node.js Server (node.exe)...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Server stopped.
) else (
    echo [INFO] Server was not running.
)

:: Kill Ngrok (Tunnel)
echo [2/2] Stopping Ngrok Tunnel (ngrok.exe)...
taskkill /F /IM ngrok.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Ngrok tunnel stopped.
) else (
    echo [INFO] Ngrok was not running.
)

echo.
echo ====================================================
echo   ALL SERVICES HAVE BEEN TURNED OFF
echo ====================================================
echo.
pause
