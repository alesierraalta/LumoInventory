const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando la base de datos para Lumo Inventory...');

// Verificar que el archivo .env existe
if (!fs.existsSync('.env')) {
  console.log('⚠️ No se encontró el archivo .env. Creando uno a partir de .env.example...');
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ Archivo .env creado correctamente.');
  } else {
    console.error('❌ No se encontró el archivo .env.example. Por favor, crea un archivo .env manualmente.');
    process.exit(1);
  }
}

// Verificar la URL de la base de datos
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]*)"/);
  
  if (!databaseUrlMatch) {
    console.warn('⚠️ No se encontró DATABASE_URL en el archivo .env. Asegúrate de configurarla manualmente.');
  } else {
    const databaseUrl = databaseUrlMatch[1];
    console.log('✅ URL de base de datos encontrada.');
    
    // Detectar tipo de base de datos
    if (databaseUrl.includes('neon.tech')) {
      console.log('🔍 Detectada base de datos Neon (PostgreSQL serverless).');
    } else if (databaseUrl.startsWith('postgresql://')) {
      console.log('🔍 Detectada base de datos PostgreSQL estándar.');
    }
  }
} catch (error) {
  console.warn(`⚠️ Error al leer el archivo .env: ${error.message}`);
}

// Ejecutar comandos de Prisma
try {
  console.log('🔄 Generando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('🔄 Creando/actualizando esquema en la base de datos...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('✅ Configuración de base de datos completada con éxito.');
  console.log('');
  console.log('📚 Para ejecutar la aplicación:');
  console.log('   npm run dev');
} catch (error) {
  console.error('❌ Error durante la configuración de la base de datos:', error.message);
  console.log('');
  console.log('🔍 Posibles soluciones:');
  console.log('1. Asegúrate de que PostgreSQL está instalado y en ejecución (para desarrollo local).');
  console.log('2. Verifica que la URL de conexión en el archivo .env es correcta.');
  console.log('3. Si usas Neon, verifica que tu IP no esté bloqueada en la configuración de acceso.');
  console.log('4. Si usas Windows, ejecuta PowerShell o CMD como administrador.');
  console.log('5. Para Windows, ejecuta: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass');
  process.exit(1);
} 