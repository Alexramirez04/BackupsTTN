@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciando Serveo para TTN Device Manager
echo ======================================================
echo.
echo Este script iniciara un tunel con Serveo.
echo.
echo Para detener Serveo, cierra esta ventana.
echo ======================================================
echo.

set PORT=3000
set SUBDOMAIN=ttn-manager

echo.
echo Iniciando Serveo en el puerto %PORT% con subdominio %SUBDOMAIN%...
echo.
echo IMPORTANTE: Cuando veas la URL en la pantalla,
echo copiala y actualiza manualmente el archivo config\appConfig.js
echo.
echo Espera mientras se inicia Serveo...
echo.

:: Intentar con subdominio específico
ssh -R %SUBDOMAIN%:80:localhost:%PORT% serveo.net

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo No se pudo usar el subdominio %SUBDOMAIN%. Intentando sin subdominio especifico...
    echo.
    
    :: Intentar sin subdominio específico
    ssh -R 80:localhost:%PORT% serveo.net
)

pause
