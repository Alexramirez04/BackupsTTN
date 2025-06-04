@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciando ngrok Simple para TTN Device Manager
echo ======================================================
echo.
echo Este script ejecutara ngrok de la forma mas simple posible.
echo.
echo Para detener ngrok, cierra esta ventana.
echo ======================================================
echo.

set PORT=3000

echo.
echo Iniciando ngrok en el puerto %PORT%...
echo.
echo IMPORTANTE: Cuando veas la URL en la pantalla,
echo copiala y actualiza manualmente el archivo config\appConfig.js
echo.
echo Espera mientras se inicia ngrok...
echo.

:: Ejecutar ngrok directamente
echo Ejecutando: ngrok http %PORT%
echo.

:: Ejecutar ngrok
ngrok http %PORT%

pause
