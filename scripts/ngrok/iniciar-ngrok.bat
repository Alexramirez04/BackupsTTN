@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciando ngrok para TTN Device Manager
echo ======================================================
echo.
echo Este script iniciara ngrok para crear un tunel a tu servidor local.
echo.
echo Para detener ngrok, cierra esta ventana.
echo ======================================================
echo.

:: Verificar si ngrok esta instalado
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ADVERTENCIA: ngrok no esta instalado o no esta en el PATH.
    echo.
    echo Por favor, descarga ngrok desde https://ngrok.com/download
    echo Extrae el archivo ngrok.exe en una ubicacion de tu eleccion
    echo y agrega esa ubicacion a tu PATH, o copia ngrok.exe a esta carpeta.
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

set PORT=3000

echo.
echo Iniciando ngrok en el puerto %PORT%...
echo.
echo IMPORTANTE: Cuando veas la URL en la pantalla (algo como https://xxxx.ngrok.io),
echo copiala y actualiza manualmente el archivo config\appConfig.js
echo.
echo Espera mientras se inicia ngrok...
echo.

:: Iniciar ngrok
ngrok http %PORT%

pause
