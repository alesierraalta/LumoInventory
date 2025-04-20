/**
 * Lumo Inventory - Windows Setup Script
 * 
 * Este script configura el entorno para Windows, verifica dependencias,
 * y asegura que la aplicación funcione correctamente.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Colores para la consola
const success = chalk.green;
const info = chalk.blue;
const warning = chalk.yellow;
const error = chalk.red;

console.log(info('='.repeat(80)));
console.log(info('Configurando Lumo Inventory para Windows'));
console.log(info('='.repeat(80)));

/**
 * Verifica si un comando está disponible en el sistema
 */
function commandExists(command) {
  try {
    execSync(`where ${command}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Ejecuta un comando y maneja errores
 */
function runCommand(command, message) {
  console.log(info(`> ${message}...`));
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(success('✓ Comando ejecutado exitosamente'));
    return true;
  } catch (e) {
    console.log(error(`✗ Error al ejecutar el comando: ${e.message}`));
    return false;
  }
}

/**
 * Verifica requisitos del sistema
 */
function checkSystemRequirements() {
  console.log(info('\nVerificando requisitos del sistema...'));
  
  // Verificar Node.js
  if (!commandExists('node')) {
    console.log(error('✗ Node.js no está instalado. Por favor instálalo desde https://nodejs.org/'));
    process.exit(1);
  }
  
  const nodeVersion = execSync('node -v').toString().trim();
  console.log(success(`✓ Node.js encontrado: ${nodeVersion}`));
  
  // Verificar versión de Node.js (debe ser >= 16.0.0)
  const versionMatch = nodeVersion.match(/v(\d+)\./);
  if (versionMatch && parseInt(versionMatch[1]) < 16) {
    console.log(error('✗ Se requiere Node.js versión 16 o superior'));
    process.exit(1);
  }
  
  // Verificar npm
  if (!commandExists('npm')) {
    console.log(error('✗ npm no está instalado'));
    process.exit(1);
  }
  
  const npmVersion = execSync('npm -v').toString().trim();
  console.log(success(`✓ npm encontrado: ${npmVersion}`));
  
  // Verificar Git (opcional pero recomendado)
  if (!commandExists('git')) {
    console.log(warning('⚠ Git no está instalado. Es recomendable para desarrollo'));
  } else {
    const gitVersion = execSync('git --version').toString().trim();
    console.log(success(`✓ Git encontrado: ${gitVersion}`));
  }
}

/**
 * Verifica si el archivo .env existe y lo crea si es necesario
 */
function checkEnvironmentFile() {
  console.log(info('\nVerificando archivo de entorno...'));
  
  const envFile = path.join(process.cwd(), '.env.local');
  const envExampleFile = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envFile)) {
    console.log(info('> Archivo .env.local no encontrado, creando uno...'));
    
    if (fs.existsSync(envExampleFile)) {
      fs.copyFileSync(envExampleFile, envFile);
      console.log(success('✓ Archivo .env.local creado a partir de .env.example'));
    } else {
      // Crear un archivo .env básico
      const defaultEnv = `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL="file:./dev.db"
NODE_ENV=development
`;
      fs.writeFileSync(envFile, defaultEnv);
      console.log(success('✓ Archivo .env.local creado con valores predeterminados'));
      console.log(warning('⚠ Asegúrate de actualizar las variables de entorno con tus valores reales'));
    }
  } else {
    console.log(success('✓ Archivo .env.local encontrado'));
  }
}

/**
 * Instala las dependencias del proyecto
 */
function installDependencies() {
  console.log(info('\nInstalando dependencias...'));
  
  // Verificar si node_modules existe
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    // No existe node_modules, instalar todas las dependencias
    if (!runCommand('npm install', 'Instalando todas las dependencias')) {
      console.log(error('✗ Error al instalar dependencias'));
      process.exit(1);
    }
  } else {
    // Verificar si necesitamos actualizar dependencias
    if (!runCommand('npm install', 'Actualizando dependencias')) {
      console.log(error('✗ Error al actualizar dependencias'));
      process.exit(1);
    }
  }
  
  console.log(success('✓ Dependencias instaladas correctamente'));
}

/**
 * Configura la base de datos y ejecución del prisma
 */
function setupDatabase() {
  console.log(info('\nConfigurando base de datos...'));
  
  // Verificar si la carpeta prisma existe
  const prismaDir = path.join(process.cwd(), 'prisma');
  
  if (fs.existsSync(prismaDir)) {
    console.log(info('> Ejecutando migraciones de Prisma...'));
    
    // Ejecutar Prisma generate
    if (!runCommand('npx prisma generate', 'Generando cliente Prisma')) {
      console.log(warning('⚠ Error al generar cliente Prisma, intentando continuar...'));
    }
    
    // Ejecutar migraciones en entorno de desarrollo
    try {
      execSync('npx prisma migrate dev --name init', { stdio: 'ignore' });
      console.log(success('✓ Migraciones de base de datos aplicadas correctamente'));
    } catch (e) {
      console.log(warning('⚠ Las migraciones no pudieron ser aplicadas. Si es la primera vez que ejecutas la aplicación, esto es normal.'));
      
      // Intentar ejecutar push en su lugar
      try {
        execSync('npx prisma db push', { stdio: 'inherit' });
        console.log(success('✓ Esquema aplicado mediante db push'));
      } catch (pushError) {
        console.log(warning('⚠ No se pudo aplicar el esquema, pero intentaremos continuar...'));
      }
    }
  } else {
    console.log(info('> No se encontró directorio prisma, omitiendo configuración de base de datos'));
  }
}

/**
 * Verifica las configuraciones de Windows específicas
 */
function checkWindowsSpecificConfig() {
  console.log(info('\nVerificando configuraciones específicas de Windows...'));
  
  // Verificar la longitud máxima de la ruta (Windows tiene limitaciones)
  const currentDir = process.cwd();
  if (currentDir.length > 200) {
    console.log(warning('⚠ Tu ruta de proyecto es muy larga. Windows tiene un límite de 260 caracteres para rutas.'));
    console.log(warning('  Considera mover el proyecto a una ubicación con una ruta más corta si experimentas problemas.'));
  } else {
    console.log(success('✓ Longitud de la ruta aceptable'));
  }
  
  // Verificar si estamos en WSL (Windows Subsystem for Linux)
  const isWSL = process.platform === 'linux' && process.env.WSL_DISTRO_NAME;
  if (isWSL) {
    console.log(info('> Detectado entorno WSL (Windows Subsystem for Linux)'));
    console.log(warning('⚠ Estás ejecutando en WSL. Para un mejor rendimiento de desarrollo, considera usar Node directamente en Windows.'));
  }
  
  // Verificar que los scripts de package.json usen comandos compatibles con Windows
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    let needsUpdate = false;
    if (packageJson.scripts) {
      // Buscar comandos que podrían no funcionar en Windows
      const problematicCommands = Object.entries(packageJson.scripts).filter(([key, cmd]) => {
        return cmd.includes('&&') || cmd.includes('/');
      });
      
      if (problematicCommands.length > 0) {
        console.log(warning('⚠ Algunos scripts en package.json podrían no ser compatibles con Windows:'));
        problematicCommands.forEach(([key, cmd]) => {
          console.log(warning(`  - ${key}: ${cmd}`));
        });
        console.log(info('  Para mayor compatibilidad, considera usar cross-env y path.join para rutas.'));
      } else {
        console.log(success('✓ Scripts en package.json son compatibles con Windows'));
      }
    }
  } catch (e) {
    console.log(warning('⚠ No se pudo verificar package.json'));
  }
}

/**
 * Verifica si la aplicación puede ejecutarse correctamente
 */
function verifyApplicationStarts() {
  console.log(info('\nVerificando que la aplicación pueda iniciarse...'));
  
  // Primero realizar una compilación para verificar que no hay errores
  if (!runCommand('npm run build', 'Compilando la aplicación')) {
    console.log(error('✗ Error al compilar la aplicación'));
    console.log(info('  Esto puede deberse a errores en el código o problemas con las dependencias.'));
    console.log(info('  Revisa los mensajes de error anteriores para más detalles.'));
    process.exit(1);
  }
  
  console.log(success('✓ Aplicación compilada correctamente'));
  console.log(success('✓ La aplicación está lista para funcionar'));
}

/**
 * Muestra instrucciones finales para el usuario
 */
function showFinalInstructions() {
  console.log(info('\n' + '='.repeat(80)));
  console.log(info('Configuración completada! 🚀'));
  console.log(info('='.repeat(80)));
  
  console.log(`
Para iniciar la aplicación en modo desarrollo:
  ${success('npm run dev')}

Para construir la aplicación para producción:
  ${success('npm run build')}

Para iniciar la aplicación en modo producción:
  ${success('npm start')}
  
Si encuentras algún problema específico de Windows:
  1. Asegúrate de que estás usando las últimas versiones de Node.js y npm
  2. Verifica que todos los paths usan '\\\\' en lugar de '/' en archivos de configuración
  3. Si tienes problemas con permisos, intenta ejecutar como administrador
  4. Para problemas con el largo de las rutas, habilita la compatibilidad con rutas largas:
     ${info('> Ejecuta como administrador: Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem" -Name "LongPathsEnabled" -Value 1')}
  `);
}

// Ejecutar todos los pasos en secuencia
try {
  checkSystemRequirements();
  checkEnvironmentFile();
  installDependencies();
  setupDatabase();
  checkWindowsSpecificConfig();
  verifyApplicationStarts();
  showFinalInstructions();
} catch (e) {
  console.log(error(`\nError inesperado durante la configuración: ${e.message}`));
  console.log(error(e.stack));
  process.exit(1);
} 