@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciando localhost.run para TTN Device Manager
echo ======================================================
echo.
echo Este script iniciara un tunel usando localhost.run
echo (una alternativa que no requiere instalacion).
echo.
echo Para detener el tunel, cierra esta ventana.
echo ======================================================
echo.

set PORT=3000

echo.
echo Iniciando tunel para el puerto %PORT%...
echo.
echo IMPORTANTE: Cuando veas la URL en la pantalla,
echo copiala y actualiza manualmente el archivo config\appConfig.js
echo.
echo Espera mientras se establece la conexion...
echo.

:: Verificar si ssh está disponible
where ssh >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ssh no esta disponible en tu sistema.
    echo Por favor, instala OpenSSH o Git Bash que incluye ssh.
    pause
    exit /b 1
)

:: Iniciar tunel con localhost.run
echo Ejecutando: ssh -R 80:localhost:%PORT% localhost.run
echo.
echo Cuando se establezca la conexion, veras una URL como:
echo https://random-subdomain.localhost.run
echo.

ssh -R 80:localhost:%PORT% localhost.run

echo.
echo Presiona cualquier tecla para salir...
pause
