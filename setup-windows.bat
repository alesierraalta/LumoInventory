@echo off
ECHO ===============================================
ECHO Iniciando configuracion de Lumo Inventory
ECHO ===============================================

REM Verificar si Node.js esta instalado
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
  ECHO ERROR: Node.js no esta instalado.
  ECHO Por favor instala Node.js desde https://nodejs.org/
  PAUSE
  EXIT /B 1
)

REM Verificar si chalk esta instalado, si no, instalarlo
ECHO Verificando dependencias necesarias para el script...
npm list chalk -g >nul 2>nul || (
  ECHO Instalando dependencia chalk...
  npm install chalk --no-save
)

REM Ejecutar el script de configuracion
ECHO.
ECHO Ejecutando script de configuracion...
node setup-windows.js

IF %ERRORLEVEL% NEQ 0 (
  ECHO.
  ECHO Hubo un error durante la configuracion. Por favor revisa los mensajes anteriores.
  PAUSE
  EXIT /B 1
) ELSE (
  ECHO.
  ECHO ===============================================
  ECHO Proceso de configuracion completado exitosamente!
  ECHO ===============================================
  ECHO.
  ECHO Presiona cualquier tecla para salir...
  PAUSE >nul
) 