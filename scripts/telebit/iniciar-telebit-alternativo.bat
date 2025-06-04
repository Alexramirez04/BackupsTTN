@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Iniciando Telebit para TTN Device Manager (Alternativo)
echo ======================================================
echo.
echo Este script es una version alternativa para iniciar Telebit.
echo.
echo Para detener Telebit, cierra esta ventana.
echo ======================================================
echo.

set PORT=3000
set NODE_PATH=%APPDATA%\npm\node_modules

:: Verificar si npm esta instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm no esta instalado. Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

:: Mostrar información sobre la instalación de Node.js y npm
echo Información de Node.js:
node --version
echo.
echo Información de npm:
npm --version
echo.

:: Verificar si telebit está instalado
echo Verificando la instalación de Telebit...
call npm list -g telebit
echo.

:: Si telebit no está instalado, instalarlo
if %ERRORLEVEL% NEQ 0 (
    echo Telebit no está instalado. Instalando...
    call npm install -g telebit
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: No se pudo instalar Telebit.
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

:: Intentar ejecutar telebit con la ruta completa
echo Intentando ejecutar Telebit...
echo.
echo Comando: npx telebit http %PORT%
echo.
echo NOTA: La primera vez que ejecutes Telebit, te pedirá que te registres.
echo       Sigue las instrucciones en pantalla.
echo.
echo IMPORTANTE: Cuando veas la URL en la pantalla,
echo copiala y actualiza manualmente el archivo config\appConfig.js
echo.

:: Ejecutar telebit usando npx
npx telebit http %PORT%

echo.
echo Presiona cualquier tecla para salir...
pause
