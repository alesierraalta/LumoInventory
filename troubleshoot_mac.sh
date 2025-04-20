#!/bin/bash

# -------------------------------------------------------
# Script de diagnóstico y corrección para LumoInventory en macOS
# Este script detecta y soluciona problemas comunes de configuración
# -------------------------------------------------------

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con formato
print_message() {
  echo -e "${GREEN}[Diagnóstico]${NC} $1"
}

print_error() {
  echo -e "${RED}[Error]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[Advertencia]${NC} $1"
}

print_step() {
  echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Función para verificar si un comando existe
check_command() {
  if ! command -v $1 &> /dev/null; then
    return 1
  else
    return 0
  fi
}

# Función para verificar y reparar Node.js
check_and_fix_nodejs() {
  print_step "Verificando Node.js"
  
  if ! check_command node; then
    print_error "Node.js no está instalado"
    print_message "Intentando instalar Node.js..."
    
    if check_command brew; then
      brew install node
      if check_command node; then
        print_message "Node.js instalado correctamente"
      else
        print_error "No se pudo instalar Node.js. Visita https://nodejs.org/"
        exit 1
      fi
    else
      print_error "Homebrew no está instalado. No se puede instalar Node.js automáticamente."
      print_message "Por favor instala Homebrew primero con:"
      echo '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
      exit 1
    fi
  else
    NODE_VERSION=$(node -v)
    print_message "Node.js instalado (versión: $NODE_VERSION)"
    
    # Verificar versión de Node.js (mínimo v18.17 para Next.js 14)
    NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')
    NODE_MINOR_VERSION=$(echo $NODE_VERSION | cut -d. -f2)
    
    if [[ $NODE_MAJOR_VERSION -lt 18 || ($NODE_MAJOR_VERSION -eq 18 && $NODE_MINOR_VERSION -lt 17) ]]; then
      print_warning "La versión de Node.js es inferior a 18.17. Next.js 14 requiere Node.js 18.17 o superior."
      read -p "¿Deseas actualizar Node.js? (s/n): " UPDATE_NODE
      if [[ $UPDATE_NODE == "s" || $UPDATE_NODE == "S" ]]; then
        print_message "Actualizando Node.js..."
        brew upgrade node
        print_message "Node.js actualizado correctamente"
      else
        print_warning "No se actualizó Node.js. Pueden ocurrir problemas con Next.js."
      fi
    fi
  fi
  
  # Verificar npm
  if ! check_command npm; then
    print_error "npm no está instalado."
    print_message "Reinstalando Node.js para obtener npm..."
    brew reinstall node
    
    if ! check_command npm; then
      print_error "No se pudo instalar npm. Visita https://nodejs.org/"
      exit 1
    fi
  else
    npm_version=$(npm -v)
    print_message "npm está instalado (versión: $npm_version)"
  fi
}

# Función para verificar y reparar PostgreSQL
check_and_fix_postgres() {
  print_step "Verificando PostgreSQL"
  
  if ! check_command postgres; then
    print_error "PostgreSQL no está instalado"
    print_message "Intentando instalar PostgreSQL..."
    
    if check_command brew; then
      brew install postgresql@14
      brew link --force postgresql@14
      brew services start postgresql@14
      
      if check_command postgres; then
        print_message "PostgreSQL instalado y servicio iniciado"
      else
        print_error "No se pudo instalar PostgreSQL automáticamente."
        print_message "Intenta con: brew install postgresql"
        exit 1
      fi
    else
      print_error "Homebrew no está instalado. No se puede instalar PostgreSQL automáticamente."
      exit 1
    fi
  else
    PG_VERSION=$(postgres --version | awk '{print $3}')
    print_message "PostgreSQL instalado (versión: $PG_VERSION)"
    
    # Verificar si el servicio está en ejecución
    if ! brew services list | grep postgresql | grep started &> /dev/null; then
      print_warning "Servicio PostgreSQL no está en ejecución"
      print_message "Iniciando servicio PostgreSQL..."
      brew services start postgresql || brew services start postgresql@14
      sleep 3
      
      if ! brew services list | grep postgresql | grep started &> /dev/null; then
        print_error "No se pudo iniciar el servicio PostgreSQL."
        print_message "Intenta manualmente: brew services start postgresql"
      else
        print_message "Servicio PostgreSQL iniciado correctamente"
      fi
    else
      print_message "Servicio PostgreSQL en ejecución"
    fi
  fi
  
  # Verificar si se puede conectar a PostgreSQL
  if ! psql postgres -c '\l' &> /dev/null; then
    print_error "No se puede conectar a PostgreSQL"
    print_message "Intentando reiniciar el servicio..."
    brew services restart postgresql || brew services restart postgresql@14
    sleep 3
    
    if ! psql postgres -c '\l' &> /dev/null; then
      print_error "No se pudo conectar a PostgreSQL después de reiniciar."
      print_message "Puede ser un problema de permisos o configuración."
      print_message "Intenta reiniciar manualmente: brew services restart postgresql"
      exit 1
    fi
  else
    print_message "Conexión a PostgreSQL establecida correctamente"
  fi
  
  # Verificar usuario y base de datos
  if ! psql postgres -c "SELECT 1 FROM pg_roles WHERE rolname='lumoinventory'" 2>/dev/null | grep -q "1 row"; then
    print_warning "El usuario 'lumoinventory' no existe"
    print_message "Creando usuario 'lumoinventory'..."
    
    if psql postgres -c "CREATE USER lumoinventory WITH PASSWORD 'lumoinventory' CREATEDB;" 2>/dev/null; then
      print_message "Usuario creado correctamente"
    else
      print_error "No se pudo crear el usuario. Intenta manualmente:"
      echo "psql postgres -c \"CREATE USER lumoinventory WITH PASSWORD 'lumoinventory' CREATEDB;\""
      exit 1
    fi
  else
    print_message "Usuario 'lumoinventory' existe"
  fi
  
  # Verificar base de datos
  if ! psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw lumoinventory_db; then
    print_warning "La base de datos 'lumoinventory_db' no existe"
    print_message "Creando base de datos 'lumoinventory_db'..."
    
    if createdb -O lumoinventory lumoinventory_db 2>/dev/null; then
      print_message "Base de datos creada correctamente"
    else
      print_error "No se pudo crear la base de datos. Intenta manualmente:"
      echo "createdb -O lumoinventory lumoinventory_db"
      exit 1
    fi
  else
    print_message "Base de datos 'lumoinventory_db' existe"
  fi
}

# Función para verificar y reparar el archivo .env
check_and_fix_env() {
  print_step "Verificando archivo .env"
  
  if [ ! -f ".env" ]; then
    print_warning "No se encontró el archivo .env"
    
    if [ -f ".env.example" ]; then
      print_message "Creando .env a partir de .env.example..."
      cp .env.example .env
      print_message "Archivo .env creado. Por favor verifica y actualiza los valores según sea necesario."
    else
      print_message "Creando archivo .env básico..."
      cat > .env << EOL
# Base de datos
DATABASE_URL=postgresql://lumoinventory:lumoinventory@localhost:5432/lumoinventory_db

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Supabase (si aplica)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EOL
      print_message "Archivo .env creado correctamente. Por favor actualiza los valores según sea necesario."
    fi
  else
    print_message "Archivo .env encontrado"
    
    # Verificar contenido mínimo del archivo .env
    if ! grep -q "DATABASE_URL" .env; then
      print_warning "No se encontró DATABASE_URL en el archivo .env"
      print_message "Añadiendo URL de base de datos..."
      echo "DATABASE_URL=postgresql://lumoinventory:lumoinventory@localhost:5432/lumoinventory_db" >> .env
    fi
  fi
}

# Función para verificar y reparar dependencias
check_and_fix_dependencies() {
  print_step "Verificando dependencias del proyecto"
  
  if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. ¿Estás en el directorio correcto del proyecto?"
    exit 1
  fi
  
  if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    print_warning "Las dependencias no están instaladas o están incompletas"
    print_message "Instalando dependencias..."
    
    npm install
    
    if [ $? -ne 0 ]; then
      print_error "Error al instalar dependencias."
      print_message "Intentando solucionar problemas comunes..."
      
      # Intentar limpiar caché de npm
      npm cache clean --force
      
      # Intentar instalar nuevamente
      npm install
      
      if [ $? -ne 0 ]; then
        print_error "No se pudieron instalar las dependencias. Intenta manualmente:"
        echo "npm cache clean --force && npm install"
        exit 1
      fi
    else
      print_message "Dependencias instaladas correctamente"
    fi
  else
    print_message "Las dependencias parecen estar instaladas"
    
    # Verificar si hay paquetes faltantes
    print_message "Verificando paquetes faltantes..."
    npm ls --depth=0 2>/dev/null
    
    if [ $? -ne 0 ]; then
      print_warning "Hay problemas con algunas dependencias"
      read -p "¿Deseas reinstalar todas las dependencias? (s/n): " REINSTALL
      
      if [[ $REINSTALL == "s" || $REINSTALL == "S" ]]; then
        print_message "Reinstalando dependencias..."
        rm -rf node_modules
        npm cache clean --force
        npm install
        
        if [ $? -ne 0 ]; then
          print_error "No se pudieron reinstalar las dependencias."
          exit 1
        else
          print_message "Dependencias reinstaladas correctamente"
        fi
      else
        print_warning "No se reinstalaron las dependencias. Pueden persistir problemas."
      fi
    else
      print_message "Todas las dependencias están correctamente instaladas"
    fi
  fi
}

# Función para verificar y reparar Prisma
check_and_fix_prisma() {
  print_step "Verificando Prisma"
  
  if [ ! -f "src/prisma/schema.prisma" ]; then
    print_warning "No se encontró el archivo schema.prisma en src/prisma/"
    
    if [ -f "prisma/schema.prisma" ]; then
      print_message "Schema encontrado en prisma/, pero no en src/prisma/"
    else
      print_error "No se encontró un esquema de Prisma. Esto puede requerir intervención manual."
      exit 1
    fi
  else
    print_message "Esquema de Prisma encontrado en src/prisma/"
  fi
  
  # Verificar cliente de Prisma
  if [ ! -d "node_modules/.prisma" ]; then
    print_warning "El cliente de Prisma no está generado"
    print_message "Generando cliente de Prisma..."
    
    npx prisma generate
    
    if [ $? -ne 0 ]; then
      print_error "Error al generar el cliente de Prisma."
      exit 1
    else
      print_message "Cliente de Prisma generado correctamente"
    fi
  else
    print_message "El cliente de Prisma parece estar generado"
  fi
  
  # Verificar conexión a la base de datos con Prisma
  print_message "Verificando conexión a la base de datos con Prisma..."
  DATABASE_URL=$(grep DATABASE_URL .env | cut -d'=' -f2)
  
  if [ -z "$DATABASE_URL" ]; then
    print_error "No se encontró DATABASE_URL en .env"
    exit 1
  fi
  
  if ! npx prisma db pull --force &>/dev/null; then
    print_warning "No se pudo conectar a la base de datos con Prisma"
    
    # Verificar URL de la base de datos
    echo "URL de base de datos actual: $DATABASE_URL"
    
    read -p "¿Deseas configurar manualmente la URL de la base de datos? (s/n): " CONFIGURE_DB
    
    if [[ $CONFIGURE_DB == "s" || $CONFIGURE_DB == "S" ]]; then
      read -p "Ingresa la URL de la base de datos: " NEW_DB_URL
      
      # Reemplazar URL en .env
      sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$NEW_DB_URL|g" .env
      
      print_message "URL de base de datos actualizada"
    else
      print_warning "No se actualizó la URL de la base de datos. Pueden persistir problemas de conexión."
    fi
  else
    print_message "Conexión a la base de datos con Prisma establecida correctamente"
  fi
  
  # Intentar migrar la base de datos
  print_message "Verificando migraciones..."
  
  if [ -d "src/prisma/migrations" ] || [ -d "prisma/migrations" ]; then
    print_message "Existen migraciones. Intentando aplicarlas..."
    npx prisma migrate deploy
    
    if [ $? -ne 0 ]; then
      print_warning "Error al aplicar migraciones."
      
      read -p "¿Deseas reiniciar la base de datos? (CUIDADO: Se perderán todos los datos) (s/n): " RESET_DB
      
      if [[ $RESET_DB == "s" || $RESET_DB == "S" ]]; then
        print_warning "Reiniciando base de datos..."
        npx prisma migrate reset --force
        
        if [ $? -ne 0 ]; then
          print_error "No se pudo reiniciar la base de datos."
          exit 1
        else
          print_message "Base de datos reiniciada correctamente"
        fi
      else
        print_warning "No se reinició la base de datos. Pueden persistir problemas."
      fi
    else
      print_message "Migraciones aplicadas correctamente"
    fi
  else
    print_warning "No se encontraron migraciones."
    
    read -p "¿Deseas crear una migración inicial? (s/n): " CREATE_MIGRATION
    
    if [[ $CREATE_MIGRATION == "s" || $CREATE_MIGRATION == "S" ]]; then
      print_message "Creando migración inicial..."
      npx prisma migrate dev --name init
      
      if [ $? -ne 0 ]; then
        print_error "No se pudo crear la migración inicial."
        exit 1
      else
        print_message "Migración inicial creada correctamente"
      fi
    else
      print_message "No se creó migración inicial."
    fi
  fi
}

# Función para verificar puerto 3000
check_port_3000() {
  print_step "Verificando puerto 3000"
  
  if lsof -i:3000 &>/dev/null; then
    print_warning "El puerto 3000 ya está en uso"
    lsof -i:3000
    
    read -p "¿Deseas intentar liberar el puerto 3000? (s/n): " FREE_PORT
    
    if [[ $FREE_PORT == "s" || $FREE_PORT == "S" ]]; then
      print_message "Intentando liberar puerto 3000..."
      
      # Obtener PID del proceso que usa el puerto 3000
      PORT_PID=$(lsof -t -i:3000)
      
      if [ -n "$PORT_PID" ]; then
        kill -9 $PORT_PID
        print_message "Proceso terminado. Puerto 3000 liberado."
      else
        print_error "No se pudo identificar el proceso que usa el puerto."
      fi
    else
      print_warning "El puerto 3000 sigue ocupado. La aplicación podría no iniciar correctamente."
      print_message "Considera cambiar el puerto en package.json o detener el proceso que lo está usando."
    fi
  else
    print_message "Puerto 3000 disponible"
  fi
}

# Función para verificar permisos
check_permissions() {
  print_step "Verificando permisos"
  
  # Verificar permisos de escritura en el directorio actual
  if [ ! -w "." ]; then
    print_error "No tienes permisos de escritura en el directorio actual"
    print_message "Intentando corregir permisos..."
    
    # Obtener el propietario del directorio
    DIR_OWNER=$(ls -ld . | awk '{print $3}')
    
    if [ "$DIR_OWNER" == "$USER" ]; then
      chmod u+w .
      
      if [ ! -w "." ]; then
        print_error "No se pudieron corregir los permisos."
        print_message "Intenta manualmente: chmod -R u+w ."
        exit 1
      else
        print_message "Permisos corregidos"
      fi
    else
      print_error "El directorio pertenece a otro usuario: $DIR_OWNER"
      print_message "Intenta con: sudo chown -R $USER:$USER ."
      exit 1
    fi
  else
    print_message "Tienes permisos de escritura en el directorio actual"
  fi
  
  # Verificar si setup_mac.sh es ejecutable
  if [ -f "setup_mac.sh" ] && [ ! -x "setup_mac.sh" ]; then
    print_warning "setup_mac.sh no es ejecutable"
    print_message "Haciendo setup_mac.sh ejecutable..."
    chmod +x setup_mac.sh
    
    if [ ! -x "setup_mac.sh" ]; then
      print_error "No se pudo hacer setup_mac.sh ejecutable."
      print_message "Intenta manualmente: chmod +x setup_mac.sh"
    else
      print_message "setup_mac.sh ahora es ejecutable"
    fi
  fi
  
  # Hacer ejecutable este script también
  chmod +x "$(basename "$0")"
}

# Función para verificar y arreglar Git
check_and_fix_git() {
  print_step "Verificando configuración de Git"
  
  # Verificar si Git está instalado
  if ! check_command git; then
    print_error "Git no está instalado"
    print_message "Intentando instalar Git..."
    
    if check_command brew; then
      brew install git
      
      if ! check_command git; then
        print_error "No se pudo instalar Git."
        exit 1
      else
        print_message "Git instalado correctamente"
      fi
    else
      print_error "Homebrew no está instalado. No se puede instalar Git automáticamente."
      exit 1
    fi
  else
    print_message "Git está instalado"
  fi
  
  # Verificar si estamos en un repositorio Git
  if [ ! -d ".git" ]; then
    print_warning "No estás en un repositorio Git"
    
    read -p "¿Deseas inicializar un repositorio Git? (s/n): " INIT_GIT
    
    if [[ $INIT_GIT == "s" || $INIT_GIT == "S" ]]; then
      print_message "Inicializando repositorio Git..."
      git init
      
      if [ ! -d ".git" ]; then
        print_error "No se pudo inicializar el repositorio Git."
        exit 1
      else
        print_message "Repositorio Git inicializado correctamente"
      fi
    else
      print_message "No se inicializó un repositorio Git."
    fi
  else
    print_message "Repositorio Git detectado"
  fi
  
  # Verificar configuración de Git para finales de línea
  if ! git config --get core.autocrlf &>/dev/null; then
    print_warning "No se ha configurado core.autocrlf para manejo de finales de línea"
    print_message "Configurando Git para compatibilidad multiplataforma..."
    git config --local core.autocrlf input
    print_message "Git configurado para compatibilidad multiplataforma (core.autocrlf=input)"
  else
    AUTOCRLF_SETTING=$(git config --get core.autocrlf)
    
    if [ "$AUTOCRLF_SETTING" != "input" ]; then
      print_warning "La configuración actual para finales de línea es: $AUTOCRLF_SETTING"
      print_message "Se recomienda 'input' para macOS. Ajustando configuración..."
      git config --local core.autocrlf input
      print_message "Git configurado para compatibilidad multiplataforma (core.autocrlf=input)"
    else
      print_message "Configuración de finales de línea correcta (input)"
    fi
  fi
}

# Función para verificar el espacio en disco
check_disk_space() {
  print_step "Verificando espacio en disco"
  
  # Obtener espacio disponible en GB
  AVAILABLE_SPACE=$(df -g . | tail -1 | awk '{print $4}')
  
  if [ "$AVAILABLE_SPACE" -lt 5 ]; then
    print_warning "Tienes menos de 5GB de espacio disponible: ${AVAILABLE_SPACE}GB"
    print_message "Se recomienda al menos 5GB de espacio para desarrollo."
  else
    print_message "Espacio en disco suficiente: ${AVAILABLE_SPACE}GB"
  fi
}

# Función de diagnóstico principal
run_diagnostics() {
  print_step "Iniciando diagnóstico de LumoInventory en macOS"
  
  # Verificamos si estamos en el directorio correcto del proyecto
  if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. ¿Estás en el directorio raíz del proyecto?"
    exit 1
  fi
  
  # Ejecutar todas las verificaciones
  check_permissions
  check_disk_space
  check_and_fix_nodejs
  check_and_fix_postgres
  check_and_fix_env
  check_and_fix_dependencies
  check_and_fix_prisma
  check_port_3000
  check_and_fix_git
  
  print_step "Diagnóstico completado"
  print_message "Se han verificado y corregido los problemas encontrados."
  print_message "Para iniciar la aplicación, ejecuta: npm run dev"
}

# Ejecutar diagnóstico
run_diagnostics 