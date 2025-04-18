# Desarrollo multiplataforma para LumoInventory

Este documento proporciona instrucciones para configurar y mantener el entorno de desarrollo de LumoInventory tanto en Windows como en macOS.

## Tecnologías Utilizadas

- **Frontend**: Next.js con TypeScript y Tailwind CSS
- **Base de datos**: PostgreSQL con Prisma como ORM
- **Dependencias principales**: React, Chart.js, Excel.js, React Hook Form, React Hot Toast

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
   - Configurará Node.js (versión 18 o superior)
   - Instalará y configurará PostgreSQL
   - Instalará todas las dependencias con npm
   - Configurará y migrará la base de datos con Prisma
   - Configurará Git para compatibilidad multiplataforma

4. Inicia la aplicación:
   ```bash
   npm run dev
   ```

5. Navega a [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### En Windows

1. Clona el repositorio:
   ```powershell
   git clone https://github.com/alesierraalta/LumoInventory.git
   cd LumoInventory
   ```

2. Instala las dependencias necesarias:
   - [Node.js](https://nodejs.org/) (versión 18.17 o superior)
   - [PostgreSQL](https://www.postgresql.org/download/windows/)

3. Configura PostgreSQL:
   - Crea un usuario llamado `lumoinventory` con contraseña `lumoinventory`
   - Crea una base de datos llamada `lumoinventory_db`
   - Asigna todos los privilegios del usuario a la base de datos

4. Crea un archivo `.env` en la raíz del proyecto (o copia desde `.env.example` si existe):
   ```
   DATABASE_URL=postgresql://lumoinventory:lumoinventory@localhost:5432/lumoinventory_db
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Instala las dependencias:
   ```powershell
   npm install
   ```

6. Genera el cliente Prisma y aplica las migraciones:
   ```powershell
   npx prisma generate
   npx prisma migrate deploy
   ```

7. Inicia la aplicación:
   ```powershell
   npm run dev
   ```

8. Navega a [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

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

### Base de datos

Si utilizas bases de datos locales distintas en cada plataforma, considera:

1. Exportar los datos antes de cambiar de plataforma:
   ```bash
   # En macOS
   pg_dump -U lumoinventory lumoinventory_db > database_backup.sql
   
   # En Windows (asegúrate de que pg_dump esté en el PATH)
   pg_dump -U lumoinventory lumoinventory_db > database_backup.sql
   ```

2. Importar los datos en la nueva plataforma:
   ```bash
   # En macOS
   psql -U lumoinventory -d lumoinventory_db < database_backup.sql
   
   # En Windows
   psql -U lumoinventory -d lumoinventory_db < database_backup.sql
   ```

Alternativamente, puedes usar Prisma para facilitar este proceso:

```bash
# Exportar datos usando Prisma Seed (primero crea un script de seed)
npx prisma db seed

# En la nueva plataforma
npx prisma migrate reset # Cuidado: esto eliminará todos los datos existentes
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

Windows utiliza barras invertidas (`\`) mientras que macOS utiliza barras normales (`/`). En el código, utiliza siempre barras normales (`/`) y NextJS se encargará de manejar correctamente las rutas en ambos sistemas.

### Problemas con Prisma

Si encuentras problemas con Prisma al cambiar entre plataformas:

```bash
# Regenera el cliente Prisma
npx prisma generate

# Si hay problemas con la base de datos
npx prisma migrate reset --force
```

### Problemas con Node.js

Si hay problemas con los módulos de Node.js:

```bash
rm -rf node_modules
npm install
```

## Herramientas recomendadas para desarrollo

- **Visual Studio Code**: Compatible con Windows y macOS, con extensiones para:
  - Prisma
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
- **Docker**: Considerar Docker para desarrollo si los problemas de compatibilidad persisten.
- **Postman** o **Insomnia**: Para probar las APIs.
- **pgAdmin** o **DBeaver**: Para gestionar la base de datos PostgreSQL.

## Contacto y soporte

Si encuentras problemas específicos de plataforma, comunícate con el equipo de desarrollo:

- GitHub: Crea un issue en el repositorio detallando el problema 