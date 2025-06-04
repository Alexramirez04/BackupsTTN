@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciador de Backend y Serveo para TTN Device Manager
echo ======================================================
echo.
echo Este script iniciara:
echo  1. El backend en http://localhost:3000
echo  2. Serveo en una ventana separada
echo.
echo Cuando veas la URL en la ventana de Serveo,
echo ejecuta el script 'actualizar-url-manual.bat' para actualizar la URL.
echo.
echo ======================================================
echo.

:: Iniciar el backend en una nueva ventana
echo Iniciando el backend...
start cmd /k "title Backend TTN Device Manager && cd ..\.. && node scripts\backend.js"

:: Esperar a que el backend se inicie
echo Esperando a que el backend se inicie...
timeout /t 5 /nobreak >nul

:: Iniciar Serveo en una nueva ventana
echo Iniciando Serveo...
start cmd /k "title Serveo && cd %~dp0 && call iniciar-serveo.bat"

echo.
echo ✅ Backend y Serveo iniciados en ventanas separadas.
echo.
echo IMPORTANTE: Cuando veas la URL en la ventana de Serveo,
echo ejecuta el script '..\..\actualizar-url-manual.bat' para actualizar la URL.
echo.
echo Para detener el backend y el tunel, cierra esas ventanas.
echo.
pause
