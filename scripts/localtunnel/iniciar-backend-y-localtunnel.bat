@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciador de Backend y LocalTunnel para TTN Device Manager
echo ======================================================
echo.
echo Este script iniciara:
echo  1. El backend en http://localhost:3000
echo  2. LocalTunnel en una ventana separada
echo.
echo Cuando veas la URL en la ventana de LocalTunnel,
echo ejecuta el script 'actualizar-url-manual.bat' para actualizar la URL.
echo.
echo ======================================================
echo.

:: Verificar si npm esta instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm no esta instalado. Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar si localtunnel esta instalado globalmente
call npm list -g localtunnel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Instalando localtunnel globalmente...
    call npm install -g localtunnel
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: No se pudo instalar localtunnel.
        pause
        exit /b 1
    )
    echo Localtunnel instalado correctamente.
)

:: Iniciar el backend en una nueva ventana
echo Iniciando el backend...
start cmd /k "title Backend TTN Device Manager && cd ..\.. && node scripts\backend.js"

:: Esperar a que el backend se inicie
echo Esperando a que el backend se inicie...
timeout /t 5 /nobreak >nul

:: Iniciar LocalTunnel en una nueva ventana
echo Iniciando LocalTunnel...
start cmd /k "title LocalTunnel && cd %~dp0 && npx lt --port 3000"

echo.
echo ✅ Backend y LocalTunnel iniciados en ventanas separadas.
echo.
echo IMPORTANTE: Cuando veas la URL en la ventana de LocalTunnel,
echo ejecuta el script '..\..\actualizar-url-manual.bat' para actualizar la URL.
echo.
echo Para detener el backend y el tunel, cierra esas ventanas.
echo.
pause
