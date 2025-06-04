@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciando Serveo con Puertos Alternativos
echo ======================================================
echo.
echo Este script intentara iniciar Serveo con diferentes puertos SSH.
echo.
echo Para detener Serveo, cierra esta ventana.
echo ======================================================
echo.

set PORT=3000
set SUBDOMAIN=ttn-manager

echo.
echo Intentando conectar a Serveo usando diferentes puertos...
echo.

:: Intentar con puerto 443 (HTTPS)
echo Intentando con puerto 443...
ssh -R %SUBDOMAIN%:80:localhost:%PORT% -p 443 serveo.net

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Conexion establecida correctamente usando el puerto 443.
    pause
    exit /b 0
)

:: Intentar con puerto 80 (HTTP)
echo.
echo Fallo la conexion con puerto 443. Intentando con puerto 80...
ssh -R %SUBDOMAIN%:80:localhost:%PORT% -p 80 serveo.net

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Conexion establecida correctamente usando el puerto 80.
    pause
    exit /b 0
)

:: Intentar con puerto 22 (SSH estándar)
echo.
echo Fallo la conexion con puerto 80. Intentando con puerto 22...
ssh -R %SUBDOMAIN%:80:localhost:%PORT% serveo.net

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Conexion establecida correctamente usando el puerto 22.
    pause
    exit /b 0
)

echo.
echo No se pudo establecer conexion con Serveo.
echo Intenta con otro servicio como LocalTunnel o Telebit.
echo.
pause
