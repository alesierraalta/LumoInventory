# Configuración para Windows - Lumo Inventory

Este documento proporciona instrucciones específicas para configurar y ejecutar Lumo Inventory en sistemas Windows.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- **Node.js v16.0.0 o superior**  
  Descarga e instala desde [https://nodejs.org/](https://nodejs.org/)

- **Git** (opcional pero recomendado)  
  Descarga e instala desde [https://git-scm.com/](https://git-scm.com/)

## Opciones de Configuración

Tienes tres formas de configurar el proyecto en Windows:

### Opción 1: Archivo Batch (Más Simple)

1. Haz doble clic en `setup-windows.bat`
2. El script verificará automáticamente los requisitos e instalará lo necesario

### Opción 2: Script Node.js

1. Abre la línea de comandos (cmd) o PowerShell
2. Navega hasta el directorio del proyecto
3. Ejecuta `node setup-windows.js`

### Opción 3: PowerShell (Más Avanzado)

1. Abre PowerShell como administrador
2. Ejecuta primero: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Navega al directorio del proyecto
4. Ejecuta: `.\setup-windows.ps1`
5. Se mostrará un menú interactivo con múltiples opciones

También puedes ejecutar funciones específicas con el script de PowerShell:
```powershell
.\setup-windows.ps1 check     # Verificar requisitos
.\setup-windows.ps1 env       # Configurar entorno
.\setup-windows.ps1 deps      # Instalar dependencias
.\setup-windows.ps1 db        # Configurar base de datos
.\setup-windows.ps1 longpaths # Habilitar soporte para rutas largas
.\setup-windows.ps1 build     # Compilar aplicación
.\setup-windows.ps1 full      # Ejecutar configuración completa
```

## Solución de Problemas Comunes en Windows

### Error: "La ruta de acceso especificada es demasiado larga"

Windows tiene un límite predeterminado de 260 caracteres para rutas de archivo. Para solucionarlo:

1. Ejecuta PowerShell como administrador
2. Ejecuta: `Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1`
3. Reinicia tu sistema

Alternativamente, usa nuestro script de PowerShell:
```powershell
.\setup-windows.ps1 longpaths
```

### Error de ENOENT al ejecutar scripts npm

Si ves errores relacionados con ENOENT al ejecutar scripts de npm:

1. Edita los scripts en package.json para usar la sintaxis correcta de Windows:
   - Usa `npm run` en lugar de scripts encadenados con `&&`
   - Usa rutas con barras invertidas (`\`) en lugar de barras normales (`/`)

### Error con Node-Gyp o paquetes nativos

Algunos paquetes requieren compilación nativa. Para solucionarlo:

1. Instala las herramientas de compilación de Windows:
```
npm install --global --production windows-build-tools
```

2. Reinicia la línea de comandos después de la instalación

### Problemas con Prisma

Si encuentras problemas con Prisma:

1. Ejecuta `npx prisma generate` para regenerar el cliente
2. Si hay problemas con SQLite, verifica la ruta en DATABASE_URL en tu archivo `.env.local`

## Ejecutando la Aplicación

Una vez configurado, puedes:

- **Iniciar en modo desarrollo:**
  ```
  npm run dev
  ```

- **Construir para producción:**
  ```
  npm run build
  ```

- **Iniciar en modo producción:**
  ```
  npm start
  ```

- **Ver la base de datos con Prisma Studio:**
  ```
  npm run prisma:studio
  ```

## Obteniendo Ayuda

Si encuentras problemas específicos de Windows que no están cubiertos aquí:

1. Verifica la consola para mensajes de error específicos
2. Asegúrate de estar usando las últimas versiones de Node.js y npm
3. Usa PowerShell para obtener mejores mensajes de error que Command Prompt

---

Happy coding! 💻🚀 