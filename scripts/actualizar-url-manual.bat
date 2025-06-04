@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo    Actualizador de URL para TTN Device Manager
echo ======================================================
echo.
echo Este script actualizara la URL del backend en el archivo de configuracion.
echo.
echo ======================================================
echo.

:: Obtener la URL actual
set "CURRENT_URL="
for /f "tokens=2 delims==" %%a in ('findstr /C:"export const BACKEND_URL =" ..\config\appConfig.js') do (
    set "CURRENT_URL=%%a"
)

:: Limpiar comillas y punto y coma
set "CURRENT_URL=!CURRENT_URL:"=!"
set "CURRENT_URL=!CURRENT_URL:;=!"
set "CURRENT_URL=!CURRENT_URL: =!"

echo URL actual del backend: !CURRENT_URL!
echo.
echo Ingresa la nueva URL del backend (por ejemplo: https://tu-subdominio.serveo.net):
set /p NEW_URL="> "

if "!NEW_URL!"=="" (
    echo Error: La URL no puede estar vacia.
    pause
    exit /b 1
)

echo.
echo Actualizando URL en el archivo de configuracion...

:: Crear un archivo temporal
type "..\config\appConfig.js" > "..\config\appConfig.js.tmp"

:: Reemplazar la URL en el archivo temporal
powershell -Command "(Get-Content '..\config\appConfig.js.tmp') -replace 'export const BACKEND_URL = \"[^\"]+\";', 'export const BACKEND_URL = \"!NEW_URL!\";'" > "..\config\appConfig.js.new"

:: Eliminar archivo temporal
del "..\config\appConfig.js.tmp"

:: Reemplazar el archivo original con el nuevo
move /y "..\config\appConfig.js.new" "..\config\appConfig.js" > nul

echo.
echo ✅ URL actualizada correctamente en el archivo de configuracion.
echo.
echo La nueva URL del backend es: !NEW_URL!
echo.
pause
