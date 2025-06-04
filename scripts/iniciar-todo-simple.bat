@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciador Simple de Backend y Tunel
echo ======================================================
echo.
echo Este script iniciara:
echo  1. El backend en http://localhost:3000
echo  2. LocalTunnel en una ventana separada
echo.
echo ======================================================
echo.

:: Iniciar el backend en una nueva ventana
echo Iniciando el backend...
start cmd /k "title Backend TTN Device Manager && node scripts\backend.js"

:: Esperar a que el backend se inicie
echo Esperando a que el backend se inicie...
timeout /t 5 /nobreak >nul

:: Iniciar LocalTunnel en una nueva ventana
echo Iniciando LocalTunnel...
start cmd /k "title LocalTunnel && npx localtunnel --port 3000"

echo.
echo ✅ Backend y LocalTunnel iniciados en ventanas separadas.
echo.
echo IMPORTANTE: Cuando veas la URL en la ventana de LocalTunnel,
echo copiala y actualiza manualmente el archivo config\appConfig.js
echo.
echo Para detener el backend y el tunel, cierra esas ventanas.
echo.
pause
