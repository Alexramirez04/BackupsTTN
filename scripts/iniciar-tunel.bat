@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Selector de Tunel para TTN Device Manager
echo ======================================================
echo.
echo Este script te permite elegir entre diferentes servicios de tunel.
echo.
echo ======================================================
echo.

echo Selecciona el servicio de tunel que deseas utilizar:
echo.
echo 1. Serveo (basado en SSH, sin instalacion adicional)
echo 2. LocalTunnel (requiere Node.js)
echo 3. Telebit (requiere Node.js)
echo 4. localhost.run (basado en SSH, sin instalacion adicional)
echo 5. Iniciar solo el backend (sin tunel)
echo.
set /p OPTION="Opcion (1-5): "

if "%OPTION%"=="1" (
    echo.
    echo Has seleccionado Serveo.
    echo.
    echo 1. Iniciar solo Serveo
    echo 2. Iniciar Serveo con puertos alternativos
    echo 3. Iniciar backend y Serveo
    echo.
    set /p SERVEO_OPTION="Opcion (1-3): "

    if "!SERVEO_OPTION!"=="1" (
        cd serveo
        call iniciar-serveo.bat
    ) else if "!SERVEO_OPTION!"=="2" (
        cd serveo
        call iniciar-serveo-puertos-alternativos.bat
    ) else if "!SERVEO_OPTION!"=="3" (
        cd serveo
        call iniciar-backend-y-serveo.bat
    ) else (
        echo Opcion no valida.
        pause
        exit /b 1
    )
) else if "%OPTION%"=="2" (
    echo.
    echo Has seleccionado LocalTunnel.
    echo.
    echo 1. Iniciar LocalTunnel con subdominio fijo
    echo 2. Iniciar LocalTunnel con subdominio aleatorio
    echo 3. Iniciar backend y LocalTunnel
    echo.
    set /p LT_OPTION="Opcion (1-3): "

    if "!LT_OPTION!"=="1" (
        cd localtunnel
        call iniciar-localtunnel.bat
    ) else if "!LT_OPTION!"=="2" (
        cd localtunnel
        call iniciar-localtunnel-aleatorio.bat
    ) else if "!LT_OPTION!"=="3" (
        cd localtunnel
        call iniciar-backend-y-localtunnel.bat
    ) else (
        echo Opcion no valida.
        pause
        exit /b 1
    )
) else if "%OPTION%"=="3" (
    echo.
    echo Has seleccionado Telebit.
    echo.
    echo 1. Iniciar solo Telebit
    echo 2. Iniciar backend y Telebit
    echo.
    set /p TELEBIT_OPTION="Opcion (1-2): "

    if "!TELEBIT_OPTION!"=="1" (
        cd telebit
        call iniciar-telebit.bat
    ) else if "!TELEBIT_OPTION!"=="2" (
        cd telebit
        call iniciar-backend-y-telebit.bat
    ) else (
        echo Opcion no valida.
        pause
        exit /b 1
    )
) else if "%OPTION%"=="4" (
    echo.
    echo Has seleccionado localhost.run.
    echo.
    echo 1. Iniciar solo localhost.run
    echo 2. Iniciar backend y localhost.run
    echo.
    set /p LR_OPTION="Opcion (1-2): "

    if "!LR_OPTION!"=="1" (
        cd localhost-run
        call iniciar-localhost-run.bat
    ) else if "!LR_OPTION!"=="2" (
        cd localhost-run
        call iniciar-backend-y-localhost-run.bat
    ) else (
        echo Opcion no valida.
        pause
        exit /b 1
    )
) else if "%OPTION%"=="5" (
    echo.
    echo Iniciando solo el backend...
    cd ..
    start cmd /k "title Backend TTN Device Manager && node scripts\backend.js"
    echo.
    echo Backend iniciado en http://localhost:3000
    echo.
    pause
) else (
    echo Opcion no valida.
    pause
    exit /b 1
)

exit /b 0
