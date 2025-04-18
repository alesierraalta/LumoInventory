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
    
    # Verificar versión de Node.js (mínimo v18.x)
    NODE_MAJOR_VERSION=$(echo $CURRENT_NODE_VERSION | cut -d. -f1 | tr -d 'v')
    if [[ $NODE_MAJOR_VERSION -lt 18 ]]; then
      print_warning "La versión de Node.js es inferior a 18.x. Se recomienda actualizar."
      read -p "¿Deseas actualizar Node.js? (s/n): " UPDATE_NODE
      if [[ $UPDATE_NODE == "s" || $UPDATE_NODE == "S" ]]; then
        print_message "Actualizando Node.js..."
        brew upgrade node
        print_message "Node.js actualizado correctamente"
      fi
    fi
  fi
}

# Instalar o verificar Python
setup_python() {
  print_step "Configurando Python"
  
  if ! command -v python3 &> /dev/null; then
    print_message "Instalando Python mediante Homebrew..."
    brew install python
    print_message "Python instalado correctamente"
  else
    PYTHON_VERSION=$(python3 --version)
    print_message "Python ya está instalado ($PYTHON_VERSION)"
  fi
  
  # Comprobar si pip está instalado
  if ! command -v pip3 &> /dev/null; then
    print_message "Instalando pip..."
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python3 get-pip.py
    rm get-pip.py
    print_message "Pip instalado correctamente"
  else
    print_message "Pip ya está instalado"
  fi
}

# Configurar entorno virtual de Python
setup_venv() {
  print_step "Configurando entorno virtual Python"
  
  # Verificar si virtualenv está instalado
  if ! command -v virtualenv &> /dev/null; then
    print_message "Instalando virtualenv..."
    pip3 install virtualenv
  else
    print_message "virtualenv ya está instalado"
  fi
  
  # Crear entorno virtual
  if [ ! -d "venv" ]; then
    print_message "Creando entorno virtual..."
    python3 -m virtualenv venv
    print_message "Entorno virtual creado correctamente"
  else
    print_message "El entorno virtual ya existe"
  fi
  
  # Activar entorno virtual
  print_message "Activando entorno virtual..."
  source venv/bin/activate
}

# Instalar dependencias del proyecto
install_dependencies() {
  print_step "Instalando dependencias del proyecto"
  
  # Instalar dependencias de Python
  if [ -f "requirements.txt" ]; then
    print_message "Instalando dependencias Python desde requirements.txt..."
    pip install -r requirements.txt
  else
    print_warning "No se encontró el archivo requirements.txt"
    
    # Crear requirements.txt con dependencias básicas
    print_message "Creando archivo requirements.txt básico..."
    cat > requirements.txt << EOL
Flask==2.3.3
SQLAlchemy==2.0.20
psycopg2-binary==2.9.7
python-dotenv==1.0.0
pydantic==2.3.0
pytest==7.4.0
EOL
    
    print_message "Instalando dependencias Python desde nuevo requirements.txt..."
    pip install -r requirements.txt
  fi
  
  # Instalar dependencias de Node.js
  if [ -f "package.json" ]; then
    print_message "Instalando dependencias Node.js desde package.json..."
    npm install
  else
    print_warning "No se encontró el archivo package.json"
  fi
}

# Configurar PostgreSQL para el proyecto
setup_database() {
  print_step "Configurando base de datos PostgreSQL"
  
  # Verificar si PostgreSQL está instalado
  if ! command -v postgres &> /dev/null; then
    print_message "Instalando PostgreSQL mediante Homebrew..."
    brew install postgresql
    brew services start postgresql
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

# Configurar variables de entorno
setup_env() {
  print_step "Configurando variables de entorno"
  
  if [ ! -f ".env" ]; then
    print_message "Creando archivo .env..."
    cat > .env << EOL
# Configuración de la aplicación
NODE_ENV=development
POSTGRES_USER=lumoinventory
POSTGRES_PASSWORD=lumoinventory
POSTGRES_DB=lumoinventory_db
DATABASE_URL=postgresql://lumoinventory:lumoinventory@localhost:5432/lumoinventory_db
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EOL
    print_message "Archivo .env creado correctamente"
  else
    print_message "El archivo .env ya existe"
  fi
}

# Configurar git para que funcione en ambos entornos
setup_git() {
  print_step "Configurando Git para compatibilidad multiplataforma"
  
  # Configurar Git para manejar correctamente los finales de línea
  git config --local core.autocrlf input
  
  # Ignorar archivos específicos del sistema operativo
  if [ ! -f ".gitignore" ]; then
    print_message "Creando archivo .gitignore..."
    cat >> .gitignore << EOL
# macOS específicos
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk

# Windows específicos
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk

# Entorno virtual Python
venv/
env/
.venv/
.env/

# Node.js
node_modules/
npm-debug.log
yarn-error.log
.pnpm-debug.log

# Archivos de entorno
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Archivos de compilación
dist/
build/
out/
.next/
__pycache__/
*.py[cod]
*$py.class
EOL
    print_message "Archivo .gitignore creado correctamente"
  else
    print_message "El archivo .gitignore ya existe"
  fi
}

# Función principal
main() {
  print_message "Iniciando configuración de LumoInventory para macOS..."
  
  # Ejecutar cada paso de la configuración
  check_homebrew
  setup_node
  setup_python
  setup_venv
  install_dependencies
  setup_database
  setup_env
  setup_git
  
  print_step "Configuración completada"
  print_message "El entorno de desarrollo de LumoInventory está listo para usar en macOS."
  print_message "Para activar el entorno virtual Python: source venv/bin/activate"
  print_message "Para iniciar la aplicación Next.js: npm run dev"
  
  # Instrucciones específicas de cambio entre plataformas
  print_warning "Recomendaciones al cambiar entre Windows y macOS:"
  echo "1. Haz siempre git pull antes de cambiar entre sistemas"
  echo "2. No modifiques los mismos archivos en ambos sistemas sin sincronizar"
  echo "3. Si hay conflictos de fin de línea (CRLF/LF), ejecuta: git add --renormalize ."
}

# Ejecutar la función principal
main 