@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciando LocalTunnel con Subdominio Aleatorio
echo ======================================================
echo.
echo Este script iniciara LocalTunnel con un subdominio aleatorio.
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

echo.
echo Iniciando LocalTunnel en el puerto %PORT% con subdominio aleatorio...
echo.
echo IMPORTANTE: Cuando veas la URL en la pantalla (algo como https://xxxx.loca.lt),
echo copiala y actualiza manualmente el archivo config\appConfig.js
echo.
echo Espera mientras se inicia LocalTunnel...
echo.

:: Iniciar LocalTunnel sin especificar subdominio (generara uno aleatorio)
npx lt --port %PORT%

pause
