@echo off
echo ======================================================
echo    Ejecutando ngrok para TTN Device Manager
echo ======================================================
echo.
echo Este script ejecutara ngrok para crear un tunel a tu servidor local.
echo.
echo Para detener ngrok, cierra esta ventana.
echo ======================================================
echo.

set PORT=3000

echo.
echo Iniciando ngrok en el puerto %PORT%...
echo.
echo IMPORTANTE: Cuando veas la URL en la pantalla (algo como https://xxxx.ngrok.io),
echo copiala y actualiza manualmente el archivo config\appConfig.js
echo.
echo Espera mientras se inicia ngrok...
echo.

:: Ejecutar ngrok desde la ruta actual
..\ngrok.exe http %PORT%

pause
