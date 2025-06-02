@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciando LocalTunnel Simple para TTN Device Manager
echo ======================================================
echo.
echo Este script ejecutara LocalTunnel de la forma mas simple posible.
echo.
echo Para detener LocalTunnel, cierra esta ventana.
echo ======================================================
echo.

set PORT=3000

:: Verificar si npx esta disponible (viene con Node.js)
where npx >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npx no esta disponible. Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Iniciando LocalTunnel en el puerto %PORT%...
echo.
echo IMPORTANTE: Cuando veas la URL en la pantalla,
echo copiala y actualiza manualmente el archivo config\appConfig.js
echo.
echo Espera mientras se inicia LocalTunnel...
echo.

:: Ejecutar localtunnel directamente con npx
echo Ejecutando: npx localtunnel --port %PORT%
echo.
echo Esto puede tardar unos momentos...
echo.

:: Ejecutar localtunnel sin instalar
cmd /k npx localtunnel --port %PORT%

pause
