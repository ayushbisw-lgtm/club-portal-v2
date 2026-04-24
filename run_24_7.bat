@echo off
title GameLiminals Server (24/7 Cloud Ready)
color 0b
cls
echo ====================================================
echo   GAMELIMINALS SERVER - 24/7 KEEPER
echo ====================================================
echo.
echo This window keeps your server running 24/7 locally.
echo To run 24/7 WITHOUT your computer, you must upload 
echo these files to a cloud host like Vercel or Render.
echo.

:start
echo [%date% %time%] Starting server...
node server.js
echo.
echo [%date% %time%] Server stopped unexpectedly!
echo Restarting in 3 seconds...
timeout /t 3 >nul
goto start
