@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciando Telebit para TTN Device Manager
echo ======================================================
echo.
echo Este script instalara (si es necesario) y ejecutara Telebit.
echo.
echo Para detener Telebit, cierra esta ventana.
echo ======================================================
echo.

:: Verificar si npm esta instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm no esta instalado. Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar si telebit esta instalado globalmente
echo Verificando la instalación de Telebit...
call npm list -g telebit
echo.

:: Si telebit no está instalado, instalarlo
if %ERRORLEVEL% NEQ 0 (
    echo Telebit no está instalado. Instalando...
    call npm install -g telebit
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: No se pudo instalar telebit.
        pause
        exit /b 1
    )
    echo Telebit instalado correctamente.
    echo.
)

:: Mostrar la ruta de los módulos globales de npm
echo Ruta de módulos globales de npm:
call npm root -g
echo.

set PORT=3000
set SUBDOMAIN=ttn-manager

echo.
echo Iniciando Telebit en el puerto %PORT%...
echo.
echo NOTA: La primera vez que ejecutes Telebit, te pedira que te registres.
echo       Sigue las instrucciones en pantalla.
echo.
echo IMPORTANTE: Cuando veas la URL en la pantalla,
echo copiala y actualiza manualmente el archivo config\appConfig.js
echo.

:: Ejecutar telebit con más información
echo Ejecutando comando: telebit http %PORT%
echo.
echo Si el script se cierra inmediatamente, puede haber un problema con la instalación de Telebit.
echo.

:: Intentar ejecutar telebit con captura de errores
telebit http %PORT%
set TELEBIT_ERROR=%ERRORLEVEL%

if %TELEBIT_ERROR% NEQ 0 (
    echo.
    echo Error al ejecutar Telebit. Código de error: %TELEBIT_ERROR%
    echo.
    echo Verificando la instalación de Telebit...
    where telebit
    echo.
    echo Intentando obtener la versión de Telebit...
    telebit --version
    echo.
    echo Intentando ejecutar Telebit con ruta completa...
    call npm root -g
    echo.
)

echo.
echo Presiona cualquier tecla para salir...
pause
