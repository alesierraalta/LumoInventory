@echo off
SETLOCAL EnableDelayedExpansion

ECHO ===============================================
ECHO Iniciando configuracion de Lumo Inventory
ECHO ===============================================
ECHO.

:: Colores para consola
SET "GREEN=[92m"
SET "BLUE=[94m"
SET "RED=[91m"
SET "YELLOW=[93m"
SET "END=[0m"

:: Funciones de mensaje
CALL :PrintInfo "Verificando dependencias necesarias..."

:: Verificar si Node.js esta instalado
CALL :PrintInfo "Verificando Node.js..."
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
  CALL :PrintError "Node.js no esta instalado."
  CALL :PrintInfo "Por favor instala Node.js desde https://nodejs.org/ (version 16 o superior)"
  PAUSE
  EXIT /B 1
) ELSE (
  FOR /F "tokens=* USEBACKQ" %%F IN (`node -v`) DO SET NODE_VERSION=%%F
  CALL :PrintSuccess "Node.js encontrado: !NODE_VERSION!"
  
  :: Comprobar versión de Node.js (16+)
  FOR /F "tokens=1 delims=." %%a IN ("!NODE_VERSION:~1!") DO (
    SET NODE_MAJOR=%%a
    IF !NODE_MAJOR! LSS 16 (
      CALL :PrintWarning "La version de Node.js es inferior a 16. Se recomienda actualizar."
    )
  )
)

:: Verificar si npm está instalado
CALL :PrintInfo "Verificando npm..."
WHERE npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
  CALL :PrintError "npm no esta instalado correctamente."
  PAUSE
  EXIT /B 1
) ELSE (
  FOR /F "tokens=* USEBACKQ" %%F IN (`npm -v`) DO SET NPM_VERSION=%%F
  CALL :PrintSuccess "npm encontrado: !NPM_VERSION!"
)

:: Verificar Git (opcional)
CALL :PrintInfo "Verificando Git..."
WHERE git >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
  CALL :PrintWarning "Git no esta instalado. Es recomendable para desarrollo."
) ELSE (
  FOR /F "tokens=* USEBACKQ" %%F IN (`git --version`) DO SET GIT_VERSION=%%F
  CALL :PrintSuccess "Git encontrado: !GIT_VERSION!"
)

:: Verificar o crear archivo .env.local
CALL :PrintInfo "Verificando archivo de entorno..."
IF NOT EXIST ".env.local" (
  CALL :PrintInfo "Archivo .env.local no encontrado, creando uno..."
  
  :: Crear archivo .env.local para Prisma con Neon DB
  (
    ECHO # Base de datos - Prisma con Neon DB
    ECHO # Reemplaza esta URL con la URL de conexión de tu base de datos Neon
    ECHO DATABASE_URL="postgresql://username:password@endpoint.neon.tech/neondb?sslmode=require"
    ECHO.
    ECHO # Para desarrollo local con SQLite (alternativa)
    ECHO # DATABASE_URL="file:./dev.db"
    ECHO.
    ECHO # Entorno
    ECHO NODE_ENV=development
  ) > .env.local
  
  CALL :PrintSuccess "Archivo .env.local creado con configuración para Neon DB"
  CALL :PrintWarning "Asegurate de actualizar DATABASE_URL con tu URL de conexión de Neon DB"
) ELSE (
  CALL :PrintSuccess "Archivo .env.local encontrado"
)

:: Verificar directorio prisma y crearlo si no existe
IF NOT EXIST "prisma" (
  CALL :PrintInfo "Directorio prisma no encontrado, creando uno..."
  MD "prisma" 2>nul
  IF %ERRORLEVEL% NEQ 0 (
    CALL :PrintWarning "No se pudo crear el directorio prisma. Intento alternativo..."
    MKDIR prisma 2>nul
    IF %ERRORLEVEL% NEQ 0 (
      CALL :PrintError "No se pudo crear el directorio prisma."
      CALL :PrintWarning "Es posible que necesites permisos de administrador o la ruta no es accesible."
      CALL :PrintInfo "Continuando con la instalacion sin configurar prisma..."
    ) ELSE (
      CALL :PrintSuccess "Directorio prisma creado usando MKDIR"
      GOTO :CREATE_SCHEMA
    )
  ) ELSE (
    CALL :PrintSuccess "Directorio prisma creado usando MD"
    GOTO :CREATE_SCHEMA
  )
) ELSE (
  CALL :PrintSuccess "Directorio prisma encontrado"
)

GOTO :SKIP_SCHEMA

:CREATE_SCHEMA
:: Crear schema.prisma básico para PostgreSQL (Neon DB)
CALL :PrintInfo "Creando archivo schema.prisma..."
(
  ECHO // This is your Prisma schema file,
  ECHO // learn more about it in the docs: https://pris.ly/d/prisma-schema
  ECHO.
  ECHO generator client {
  ECHO   provider = "prisma-client-js"
  ECHO }
  ECHO.
  ECHO datasource db {
  ECHO   provider = "postgresql"
  ECHO   url      = env^("DATABASE_URL"^)
  ECHO }
  ECHO.
  ECHO // Modelo básico para empezar
  ECHO model Item {
  ECHO   id          Int      @id @default^(autoincrement^(^)^)
  ECHO   name        String
  ECHO   description String?
  ECHO   quantity    Int      @default^(1^)
  ECHO   createdAt   DateTime @default^(now^(^)^)
  ECHO   updatedAt   DateTime @updatedAt
  ECHO }
) > prisma\schema.prisma
CALL :PrintSuccess "Archivo schema.prisma creado con configuración para PostgreSQL"

:SKIP_SCHEMA

:: Instalar dependencias
CALL :PrintInfo "Instalando dependencias del proyecto..."
IF NOT EXIST "node_modules" (
  CALL :PrintInfo "Instalando todas las dependencias (esto puede tomar varios minutos)..."
  CALL npm install --no-audit --no-fund
  IF %ERRORLEVEL% NEQ 0 (
    CALL :PrintError "Error al instalar dependencias"
    PAUSE
    EXIT /B 1
  )
) ELSE (
  CALL :PrintInfo "Actualizando dependencias..."
  CALL npm install --no-audit --no-fund
  IF %ERRORLEVEL% NEQ 0 (
    CALL :PrintError "Error al actualizar dependencias"
    PAUSE
    EXIT /B 1
  )
)
CALL :PrintSuccess "Dependencias instaladas correctamente"

:: Configurar Prisma y base de datos (solo si prisma existe)
IF EXIST "prisma\schema.prisma" (
  CALL :PrintInfo "Configurando Prisma y base de datos..."
  CALL :PrintInfo "Generando cliente Prisma..."
  CALL npx prisma generate
  
  CALL :PrintInfo "IMPORTANTE: La base de datos no se inicializará automáticamente."
  CALL :PrintInfo "Después de configurar la URL de conexión correcta en .env.local, ejecuta:"
  CALL :PrintInfo "  npx prisma db push"
  CALL :PrintWarning "O si prefieres usar migraciones:"
  CALL :PrintInfo "  npx prisma migrate dev --name init"
) ELSE (
  CALL :PrintInfo "No se encontro archivo schema.prisma, omitiendo configuracion de base de datos"
)

:: Compilar la aplicación
CALL :PrintInfo "Compilando la aplicacion..."
CALL npm run build
IF %ERRORLEVEL% NEQ 0 (
  CALL :PrintError "Error al compilar la aplicacion"
  CALL :PrintInfo "Esto puede deberse a errores en el codigo o problemas con las dependencias."
  CALL :PrintInfo "Revisa los mensajes de error anteriores para mas detalles."
  CALL :PrintWarning "A pesar del error de compilacion, puedes intentar ejecutar el servidor de desarrollo con 'npm run dev'"
  GOTO :FINAL
)
CALL :PrintSuccess "Aplicacion compilada correctamente"

:FINAL
:: Mostrar instrucciones finales
ECHO.
CALL :PrintInfo "==============================================="
CALL :PrintSuccess "Proceso de configuracion completado!"
CALL :PrintInfo "==============================================="
ECHO.
CALL :PrintInfo "IMPORTANTE: Antes de continuar:"
CALL :PrintInfo "1. Edita el archivo .env.local y configura DATABASE_URL con tu URL de Neon DB"
CALL :PrintInfo "2. Ejecuta 'npx prisma db push' para inicializar la base de datos"
ECHO.
CALL :PrintInfo "Para iniciar el servidor de desarrollo, ejecuta:"
ECHO.
ECHO   npm run dev
ECHO.
CALL :PrintInfo "Para crear datos de ejemplo en la base de datos:"
ECHO.
ECHO   npm run seed-db
ECHO.
CALL :PrintInfo "Para abrir el visualizador de la base de datos:"
ECHO.
ECHO   npx prisma studio
ECHO.
CALL :PrintInfo "Presiona cualquier tecla para salir..."
PAUSE >nul
EXIT /B 0

:: Funciones para mensajes con colores
:PrintSuccess
ECHO %GREEN%[✓] %~1%END%
EXIT /B 0

:PrintInfo
ECHO %BLUE%[ℹ] %~1%END%
EXIT /B 0

:PrintWarning
ECHO %YELLOW%[⚠] %~1%END%
EXIT /B 0

:PrintError
ECHO %RED%[✗] %~1%END%
EXIT /B 0 