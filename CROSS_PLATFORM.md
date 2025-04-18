# Desarrollo multiplataforma para LumoInventory

Este documento proporciona instrucciones para configurar y mantener el entorno de desarrollo de LumoInventory tanto en Windows como en macOS.

## Configuración inicial

### En macOS

1. Clona el repositorio:
   ```bash
   git clone https://github.com/alesierraalta/LumoInventory.git
   cd LumoInventory
   ```

2. Ejecuta el script de configuración:
   ```bash
   chmod +x setup_mac.sh
   ./setup_mac.sh
   ```

3. El script automáticamente:
   - Instalará Homebrew (si no está instalado)
   - Configurará Node.js, Python y PostgreSQL
   - Creará un entorno virtual de Python
   - Instalará todas las dependencias
   - Configurará la base de datos
   - Configurará Git para compatibilidad multiplataforma

4. Una vez completado, activa el entorno virtual:
   ```bash
   source venv/bin/activate
   ```

5. Inicia la aplicación:
   ```bash
   npm run dev
   ```

### En Windows

1. Clona el repositorio:
   ```powershell
   git clone https://github.com/alesierraalta/LumoInventory.git
   cd LumoInventory
   ```

2. Instala las dependencias necesarias:
   - [Node.js](https://nodejs.org/) (versión 18 o superior)
   - [Python](https://www.python.org/downloads/) (versión 3.9 o superior)
   - [PostgreSQL](https://www.postgresql.org/download/windows/)

3. Configura el entorno virtual de Python:
   ```powershell
   pip install virtualenv
   virtualenv venv
   .\venv\Scripts\activate
   ```

4. Instala las dependencias:
   ```powershell
   pip install -r requirements.txt
   npm install
   ```

5. Configura PostgreSQL:
   - Crea un usuario llamado `lumoinventory` con contraseña `lumoinventory`
   - Crea una base de datos llamada `lumoinventory_db`
   - Asigna todos los privilegios del usuario a la base de datos

6. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```
   NODE_ENV=development
   POSTGRES_USER=lumoinventory
   POSTGRES_PASSWORD=lumoinventory
   POSTGRES_DB=lumoinventory_db
   DATABASE_URL=postgresql://lumoinventory:lumoinventory@localhost:5432/lumoinventory_db
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

7. Inicia la aplicación:
   ```powershell
   npm run dev
   ```

## Cambiar entre plataformas

### Recomendaciones generales

1. **Siempre sincroniza antes de cambiar de plataforma:**
   ```bash
   git pull
   git add .
   git commit -m "Cambios antes de cambiar de plataforma"
   git push
   ```

2. **Configuración de Git para finales de línea:**
   
   Para evitar problemas con los finales de línea (CRLF en Windows, LF en macOS/Linux), utiliza la siguiente configuración:
   
   - En macOS:
     ```bash
     git config --local core.autocrlf input
     ```
   
   - En Windows:
     ```powershell
     git config --local core.autocrlf true
     ```

3. Si hay conflictos de finales de línea después de cambiar entre plataformas, ejecuta:
   ```bash
   git add --renormalize .
   git commit -m "Normalizar finales de línea"
   ```

### Entorno virtual de Python

Dado que las rutas de activación de entornos virtuales son diferentes en Windows y macOS:

- En macOS: `source venv/bin/activate`
- En Windows: `.\venv\Scripts\activate`

Es recomendable recrear el entorno virtual cada vez que cambies de plataforma:

1. Elimina el entorno virtual (antes de hacer el cambio de plataforma)
2. Crea un nuevo entorno virtual en la nueva plataforma
3. Reinstala las dependencias

### Base de datos

Si utilizas bases de datos locales distintas en cada plataforma, considera:

1. Exportar los datos antes de cambiar de plataforma:
   ```bash
   pg_dump -U lumoinventory lumoinventory_db > database_backup.sql
   ```

2. Importar los datos en la nueva plataforma:
   ```bash
   psql -U lumoinventory -d lumoinventory_db < database_backup.sql
   ```

## Solución de problemas comunes

### Finales de línea incorrectos

Los archivos pueden mostrar modificaciones inesperadas debido a la conversión de finales de línea. Solución:

```bash
git config --local core.autocrlf input  # En macOS
git config --local core.autocrlf true   # En Windows
git add --renormalize .
git commit -m "Fix line endings"
```

### Problemas con rutas de archivos

Windows utiliza barras invertidas (`\`) mientras que macOS utiliza barras normales (`/`). Utiliza siempre barras normales (`/`) en tu código y configuración.

### Problemas de dependencias

Si hay problemas con las dependencias al cambiar de plataforma:

```bash
# En macOS
source venv/bin/activate
pip install -r requirements.txt

# En Windows
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Problemas con Node.js

Si hay problemas con los módulos de Node.js:

```bash
rm -rf node_modules
npm install
```

## Herramientas recomendadas para desarrollo multiplataforma

- **Visual Studio Code**: Compatible con Windows y macOS, con configuraciones compartidas.
- **Docker**: Considerar Docker para desarrollo si los problemas de compatibilidad persisten.
- **GitHub Codespaces**: Entorno de desarrollo consistente basado en la nube.

## Contacto y soporte

Si encuentras problemas específicos de plataforma, comunícate con el equipo de desarrollo:

- Correo: [contacto@ejemplo.com]
- GitHub: Crea un issue en el repositorio detallando el problema 