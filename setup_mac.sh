#!/bin/bash

# -------------------------------------------------------
# Script de configuración para LumoInventory en macOS
# Este script configura todo el entorno de desarrollo
# para trabajar con el proyecto en macOS
# -------------------------------------------------------

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con formato
print_message() {
  echo -e "${GREEN}[LumoInventory Setup]${NC} $1"
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

# Comprobar si Homebrew está instalado
check_homebrew() {
  print_step "Verificando Homebrew"
  
  if ! command -v brew &> /dev/null; then
    print_message "Homebrew no está instalado. Instalando..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Añadir Homebrew al PATH para esta sesión
    if [[ -f /opt/homebrew/bin/brew ]]; then
      eval "$(/opt/homebrew/bin/brew shellenv)"
    else
      eval "$(brew shellenv)"
    fi
    
    print_message "Homebrew instalado correctamente"
  else
    print_message "Homebrew ya está instalado"
  fi
}

# Instalar o verificar Node.js
setup_node() {
  print_step "Configurando Node.js"
  
  if ! command -v node &> /dev/null; then
    print_message "Instalando Node.js mediante Homebrew..."
    brew install node
    print_message "Node.js instalado correctamente"
  else
    CURRENT_NODE_VERSION=$(node -v)
    print_message "Node.js ya está instalado (versión: $CURRENT_NODE_VERSION)"
    
    # Verificar versión de Node.js (mínimo v18.x para Next.js)
    NODE_MAJOR_VERSION=$(echo $CURRENT_NODE_VERSION | cut -d. -f1 | tr -d 'v')
    if [[ $NODE_MAJOR_VERSION -lt 18 ]]; then
      print_warning "La versión de Node.js es inferior a 18.x. Next.js 14 requiere Node.js 18.17 o superior."
      read -p "¿Deseas actualizar Node.js? (s/n): " UPDATE_NODE
      if [[ $UPDATE_NODE == "s" || $UPDATE_NODE == "S" ]]; then
        print_message "Actualizando Node.js..."
        brew upgrade node
        print_message "Node.js actualizado correctamente"
      fi
    fi
  fi
  
  # Verificar npm
  if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado. Instalando..."
    brew install npm
  else
    npm_version=$(npm -v)
    print_message "npm está instalado (versión: $npm_version)"
  fi
}

# Configurar PostgreSQL para el proyecto
setup_database() {
  print_step "Configurando base de datos PostgreSQL"
  
  # Verificar si PostgreSQL está instalado
  if ! command -v postgres &> /dev/null; then
    print_message "Instalando PostgreSQL mediante Homebrew..."
    brew install postgresql@14
    brew link --force postgresql@14
    brew services start postgresql@14
    print_message "PostgreSQL instalado y servicio iniciado"
    
    # Dar tiempo a que PostgreSQL inicie completamente
    sleep 3
  else
    print_message "PostgreSQL ya está instalado"
    
    # Asegurarse de que el servicio esté en ejecución
    if ! brew services list | grep postgresql | grep started &> /dev/null; then
      print_message "Iniciando servicio PostgreSQL..."
      brew services start postgresql
      sleep 3
    else
      print_message "Servicio PostgreSQL ya está en ejecución"
    fi
  fi
  
  # Crear usuario y base de datos para el proyecto
  print_message "Configurando usuario y base de datos..."
  
  # Verificar si el usuario postgres existe
  if psql postgres -c "SELECT 1 FROM pg_roles WHERE rolname='lumoinventory'" | grep -q "1 row"; then
    print_message "El usuario 'lumoinventory' ya existe"
  else
    print_message "Creando usuario 'lumoinventory'..."
    psql postgres -c "CREATE USER lumoinventory WITH PASSWORD 'lumoinventory' CREATEDB;"
    print_message "Usuario creado correctamente"
  fi
  
  # Verificar si la base de datos existe
  if psql -lqt | cut -d \| -f 1 | grep -qw lumoinventory_db; then
    print_message "La base de datos 'lumoinventory_db' ya existe"
  else
    print_message "Creando base de datos 'lumoinventory_db'..."
    createdb -O lumoinventory lumoinventory_db
    print_message "Base de datos creada correctamente"
  fi
}

# Instalar dependencias del proyecto
install_dependencies() {
  print_step "Instalando dependencias del proyecto"
  
  # Instalar dependencias de Node.js
  if [ -f "package.json" ]; then
    print_message "Instalando dependencias Node.js desde package.json..."
    npm install
    
    # Generar los tipos de Prisma
    print_message "Generando cliente Prisma..."
    npx prisma generate
  else
    print_error "No se encontró el archivo package.json. ¿Estás en el directorio correcto del proyecto?"
    exit 1
  fi
}

# Configurar variables de entorno
setup_env() {
  print_step "Configurando variables de entorno"
  
  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      print_message "Creando archivo .env a partir de .env.example..."
      cp .env.example .env
      print_message "Archivo .env creado correctamente. Por favor, actualiza las credenciales en .env"
    else
      print_message "Creando archivo .env..."
      cat > .env << EOL
# Base de datos
DATABASE_URL=postgresql://lumoinventory:lumoinventory@localhost:5432/lumoinventory_db

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Supabase (si aplica)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EOL
      print_message "Archivo .env creado correctamente"
    fi
  else
    print_message "El archivo .env ya existe"
    
    # Verificar que la URL de la base de datos esté configurada correctamente
    if ! grep -q "DATABASE_URL" .env; then
      print_warning "No se encontró DATABASE_URL en el archivo .env. Añadiendo..."
      echo "DATABASE_URL=postgresql://lumoinventory:lumoinventory@localhost:5432/lumoinventory_db" >> .env
    fi
  fi
}

# Configurar git para que funcione en ambos entornos
setup_git() {
  print_step "Configurando Git para compatibilidad multiplataforma"
  
  # Configurar Git para manejar correctamente los finales de línea
  git config --local core.autocrlf input
  print_message "Git configurado para compatibilidad multiplataforma (core.autocrlf=input)"
  
  # Verificar si .gitignore existe
  if [ ! -f ".gitignore" ]; then
    print_message "Creando archivo .gitignore..."
    cat > .gitignore << EOL
# Next.js
.next/
out/

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Archivos de entorno
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Prisma
prisma/.env
.env

# macOS específicos
.DS_Store
.AppleDouble
.LSOverride
._*
.Spotlight-V100
.Trashes

# Windows específicos
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/

# IDE y Editores
.idea/
.vscode/
*.swp
*.swo
EOL
    print_message "Archivo .gitignore creado correctamente"
  else
    print_message "El archivo .gitignore ya existe"
  fi
}

# Configurar y migrar Prisma
setup_prisma() {
  print_step "Configurando Prisma"
  
  # Verificar si Prisma está instalado
  if [ ! -d "node_modules/@prisma" ]; then
    print_message "Instalando Prisma CLI..."
    npm install prisma --save-dev
  fi
  
  # Verificar si el esquema de Prisma existe
  if [ -f "src/prisma/schema.prisma" ]; then
    print_message "Esquema de Prisma encontrado. Ejecutando migraciones..."
    
    # Ejecutar migraciones de Prisma si hay un directorio de migraciones
    if [ -d "src/prisma/migrations" ]; then
      npx prisma migrate deploy
    else
      print_warning "No se encontraron migraciones de Prisma. Creando migración inicial..."
      npx prisma migrate dev --name init
    fi
    
    # Generar cliente de Prisma
    print_message "Generando cliente de Prisma..."
    npx prisma generate
  else
    print_warning "No se encontró un esquema de Prisma en src/prisma/schema.prisma"
  fi
}

# Función principal
main() {
  print_message "Iniciando configuración de LumoInventory para macOS..."
  
  # Ejecutar cada paso de la configuración
  check_homebrew
  setup_node
  setup_database
  setup_env
  install_dependencies
  setup_prisma
  setup_git
  
  print_step "Configuración completada"
  print_message "El entorno de desarrollo de LumoInventory está listo para usar en macOS."
  print_message "Para iniciar la aplicación Next.js: npm run dev"
  
  # Mostrar URL de la aplicación
  print_message "La aplicación estará disponible en: http://localhost:3000"
  
  # Instrucciones específicas de cambio entre plataformas
  print_warning "Recomendaciones al cambiar entre Windows y macOS:"
  echo "1. Haz siempre git pull antes de cambiar entre sistemas"
  echo "2. No modifiques los mismos archivos en ambos sistemas sin sincronizar"
  echo "3. Si hay conflictos de fin de línea (CRLF/LF), ejecuta: git add --renormalize ."
}

# Ejecutar la función principal
main 