@echo off
title Tonari POS System - Launcher
cd /d "%~dp0"
echo ===================================================
echo  Starting Tonari Point of Sale System...
echo ===================================================

if not exist node_modules\electron (
    echo [Setup] Installing local Electron dependencies...
    call npm install --save-dev electron
)

echo [Launch] Starting Desktop and Mobile Server...
call npm start
pause
