@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciando LocalTunnel para TTN Device Manager
echo ======================================================
echo.
echo Este script instalara (si es necesario) y ejecutara LocalTunnel.
echo.
echo Para detener LocalTunnel, cierra esta ventana.
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

set PORT=3000
set SUBDOMAIN=ttn-manager

echo.
echo Iniciando LocalTunnel en el puerto %PORT% con el subdominio %SUBDOMAIN%...
echo.
echo NOTA: La URL generada sera algo como https://%SUBDOMAIN%.loca.lt
echo       Deberás actualizar esta URL en tu aplicación.
echo.

:: Ejecutar localtunnel con el subdominio especificado
npx lt --port %PORT% --subdomain %SUBDOMAIN%

:: Si falla con el subdominio, intentar sin él
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo No se pudo usar el subdominio %SUBDOMAIN%. Intentando sin subdominio específico...
    echo.
    npx lt --port %PORT%
)

pause
