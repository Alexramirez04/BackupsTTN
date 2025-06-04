@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciador de Backend y localhost.run para TTN Device Manager
echo ======================================================
echo.
echo Este script iniciara:
echo  1. El backend en http://localhost:3000
echo  2. localhost.run en una ventana separada
echo.
echo Cuando veas la URL en la ventana de localhost.run,
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

:: Verificar si ssh está disponible
where ssh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ssh no esta disponible en tu sistema.
    echo Por favor, instala OpenSSH o Git Bash que incluye ssh.
    pause
    exit /b 1
)

:: Iniciar localhost.run en una nueva ventana
echo Iniciando localhost.run...
start cmd /k "title localhost.run && cd %~dp0 && ssh -R 80:localhost:3000 localhost.run"

echo.
echo ✅ Backend y localhost.run iniciados en ventanas separadas.
echo.
echo IMPORTANTE: Cuando veas la URL en la ventana de localhost.run,
echo ejecuta el script '..\..\actualizar-url-manual.bat' para actualizar la URL.
echo.
echo Para detener el backend y el tunel, cierra esas ventanas.
echo.
pause
