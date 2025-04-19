# Instrucciones para desarrollo multiplataforma

Este documento contiene instrucciones para configurar y desarrollar LumoInventory en diferentes sistemas operativos.

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/lumo_inventory"

# Next.js
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Configuración de Supabase (opcional)
NEXT_PUBLIC_SUPABASE_URL="tu_url_de_supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_clave_anon_de_supabase"
```

## PostgreSQL

### En macOS

1. Instala PostgreSQL usando Homebrew:
```bash
brew install postgresql@14
```

2. Inicia el servicio:
```bash
brew services start postgresql@14
```

3. Crea un usuario y una base de datos:
```bash
createuser -P -s -e lumo_user
createdb -O lumo_user lumo_inventory
```

### En Windows

1. Descarga e instala PostgreSQL desde la [página oficial](https://www.postgresql.org/download/windows/).
2. Durante la instalación, configura:
   - Contraseña para el usuario 'postgres'
   - Puerto: 5432 (por defecto)
   - Idioma: UTF-8

3. Usando pgAdmin o psql:
   - Crea un nuevo usuario: 'lumo_user'
   - Crea una nueva base de datos: 'lumo_inventory'
   - Asigna todos los privilegios de la base de datos al usuario

## Git y control de versiones

### Configuración de Git para evitar problemas de saltos de línea

```bash
# En Windows
git config --global core.autocrlf true

# En macOS/Linux
git config --global core.autocrlf input
```

### .gitignore

Asegúrate de que los siguientes archivos/directorios estén en tu .gitignore:

```
node_modules/
.env
.env.local
.next/
```

## Problemas comunes y soluciones

### Puerto 3000 en uso

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**macOS:**
```bash
lsof -i :3000
kill -9 <PID>
```

### Errores de prisma

Si encuentras errores con Prisma, intenta:

```bash
npx prisma generate
npx prisma migrate reset
```

### Problemas de permisos

**Windows:**
- Ejecuta PowerShell como administrador
- Verifica que tu antivirus no esté bloqueando operaciones

**macOS:**
```bash
chmod -R 755 .
```

## Herramientas recomendadas

### Editores y extensiones
- Visual Studio Code con:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma

### Herramientas para la base de datos
- TablePlus (macOS/Windows)
- pgAdmin (Windows/macOS)

## Soporte

Si encuentras problemas específicos de tu plataforma, puedes:
1. Revisar la documentación específica para tu sistema
2. Ejecutar el script de diagnóstico (macOS)
3. Contactar al equipo de desarrollo 