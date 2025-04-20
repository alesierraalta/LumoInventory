# Lumo Inventory - Instrucciones

## Requisitos previos

1. Node.js (versión 16 o superior)
2. Para desarrollo local: PostgreSQL (instalado y en ejecución)
3. Para producción: Una cuenta en Vercel y acceso a Neon (PostgreSQL serverless)

## Configuración local

1. **Clonar el repositorio y instalar dependencias**:
   ```bash
   git clone <url-del-repositorio>
   cd LumoInventory
   npm install
   ```

2. **Configurar la base de datos local**:
   
   El proyecto ya incluye un archivo `.env` con la configuración básica de conexión a PostgreSQL:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumo_inventory"
   ```

   Asegúrate de que:
   - PostgreSQL está en ejecución
   - Existe un usuario `postgres` con contraseña `postgres` (o modifica el `.env` si usas credenciales diferentes)
   - Si la base de datos `lumo_inventory` no existe, PostgreSQL intentará crearla automáticamente

3. **Configurar la base de datos**:

   Ejecuta el siguiente comando para generar el cliente Prisma y crear/actualizar la estructura de la base de datos:
   ```bash
   npm run setup-db
   ```

4. **Cargar datos iniciales** (opcional):

   Si deseas cargar datos de ejemplo en la base de datos, ejecuta:
   ```bash
   npm run seed-db
   ```
   
   Esto creará categorías, productos y proyectos de ejemplo para que puedas probar la aplicación inmediatamente.

## Configuración con Neon (PostgreSQL serverless) para Vercel

1. **Crear una cuenta en Neon**:
   - Ve a [Neon](https://neon.tech/) o accede a través del Marketplace de Vercel
   - Crea una cuenta y un nuevo proyecto
   - Configura un nuevo branch (generalmente `main`)

2. **Obtener la URL de conexión**:
   - En el dashboard de Neon, navega a tu proyecto y branch
   - Busca la sección "Connection Details" y copia la "Connection string"
   - El formato será similar a: `postgresql://[user]:[password]@[endpoint]/[database]`

3. **Configurar en Vercel**:
   - En tu proyecto de Vercel, ve a "Settings" > "Environment Variables"
   - Añade una nueva variable llamada `DATABASE_URL` con el valor de la URL de conexión de Neon
   - Asegúrate de que esta variable esté disponible en Production, Preview y Development

4. **Despliega tu aplicación en Vercel**:
   - La configuración `postinstall` en package.json asegura que el cliente Prisma se genere durante el despliegue
   - En el primer despliegue, el esquema se creará automáticamente en Neon

5. **Cargar datos iniciales en la base de datos de producción** (opcional):
   - Para ambientes de producción, puedes ejecutar manualmente:
   ```bash
   npx dotenv -e .env.production -- npx ts-node --transpile-only src/scripts/seed-data.js
   ```
   - Alternativamente, puedes configurar esta operación como un paso posterior al despliegue en Vercel

## Ejecución de la aplicación

Una vez completada la configuración, puedes iniciar la aplicación:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Solución de problemas

### Problemas de ejecución de scripts en Windows

Si estás usando Windows y recibes un error relacionado con la ejecución de scripts, ejecuta PowerShell como administrador y ejecuta:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Luego intenta ejecutar nuevamente los comandos.

### Problemas de conexión a la base de datos

1. Asegúrate de que PostgreSQL está en ejecución (para desarrollo local)
2. Verifica que la URL de conexión en el archivo `.env` es correcta
3. Si usas Neon, asegúrate de que la IP desde donde te conectas no está bloqueada
4. Para Neon, comprueba que el branch y proyecto están activos

### Errores de Prisma

Si encuentras errores de Prisma relacionados con la generación del cliente, puedes intentar:

```bash
npx prisma generate
```

Y si hay problemas con la creación del esquema:

```bash
npx prisma db push
``` 