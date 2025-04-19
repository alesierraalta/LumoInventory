# Lumo Inventory - Script de configuración avanzado para Windows
# Este script debe ser ejecutado como administrador para algunas operaciones

# Función para mostrar texto con colores
function Write-ColorOutput($ForegroundColor) {
    # Guarda el color actual
    $previousForegroundColor = $host.UI.RawUI.ForegroundColor
    
    # Establece el nuevo color
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    
    # Si es input por tubería
    if ($input.MeasureObject().Count -gt 0) {
        $input | Write-Output
    }
    else {
        # Si son argumentos
        if ($args.Count -gt 0) {
            $args | Write-Output
        }
    }
    
    # Restaura el color anterior
    $host.UI.RawUI.ForegroundColor = $previousForegroundColor
}

function Write-Success($message) {
    Write-ColorOutput Green "✓ $message"
}

function Write-Info($message) {
    Write-ColorOutput Cyan "ℹ $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "⚠ $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "✗ $message"
}

# Función para verificar requerimientos
function Check-Requirements {
    Write-Info "Verificando requisitos del sistema..."
    
    # Verificar Node.js
    try {
        $nodeVersion = node -v
        Write-Success "Node.js instalado: $nodeVersion"
        
        # Verificar versión (debe ser 16+)
        $versionPattern = "v(\d+)\."
        if ($nodeVersion -match $versionPattern) {
            $majorVersion = [int]$matches[1]
            if ($majorVersion -lt 16) {
                Write-Error "Se requiere Node.js v16 o superior. Versión actual: $nodeVersion"
                return $false
            }
        }
    }
    catch {
        Write-Error "Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org/"
        return $false
    }
    
    # Verificar npm
    try {
        $npmVersion = npm -v
        Write-Success "npm instalado: $npmVersion"
    }
    catch {
        Write-Error "npm no está instalado correctamente"
        return $false
    }
    
    # Verificar Git (opcional)
    try {
        $gitVersion = git --version
        Write-Success "Git instalado: $gitVersion"
    }
    catch {
        Write-Warning "Git no está instalado. Es recomendable para desarrollo, pero no es obligatorio."
    }
    
    return $true
}

# Función para configurar entorno
function Setup-Environment {
    Write-Info "Configurando entorno de desarrollo..."
    
    # Verificar archivo .env.local
    $envFile = Join-Path $PSScriptRoot ".env.local"
    $envExampleFile = Join-Path $PSScriptRoot ".env.example"
    
    if (-not (Test-Path $envFile)) {
        Write-Info "Archivo .env.local no encontrado, creando uno..."
        
        if (Test-Path $envExampleFile) {
            Copy-Item $envExampleFile $envFile
            Write-Success "Archivo .env.local creado a partir de .env.example"
        }
        else {
            # Crear un archivo .env básico
            $defaultEnv = @"
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL="file:./dev.db"
NODE_ENV=development
"@
            Set-Content -Path $envFile -Value $defaultEnv
            Write-Success "Archivo .env.local creado con valores predeterminados"
            Write-Warning "Asegúrate de actualizar las variables de entorno con tus valores reales"
        }
    }
    else {
        Write-Success "Archivo .env.local encontrado"
    }
}

# Función para instalar dependencias
function Install-Dependencies {
    Write-Info "Instalando dependencias del proyecto..."
    
    $nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
    
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Info "Instalando todas las dependencias..."
        npm install
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Error al instalar dependencias"
            return $false
        }
    }
    else {
        Write-Info "Actualizando dependencias..."
        npm install
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Error al actualizar dependencias"
            return $false
        }
    }
    
    Write-Success "Dependencias instaladas correctamente"
    return $true
}

# Función para configurar la base de datos
function Setup-Database {
    Write-Info "Configurando base de datos..."
    
    $prismaDir = Join-Path $PSScriptRoot "prisma"
    
    if (Test-Path $prismaDir) {
        Write-Info "Generando cliente Prisma..."
        npx prisma generate
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Error al generar cliente Prisma, intentando continuar..."
        }
        
        # Intentar ejecutar migraciones
        try {
            Write-Info "Ejecutando migraciones de Prisma..."
            npx prisma migrate dev --name init
            Write-Success "Migraciones de base de datos aplicadas correctamente"
        }
        catch {
            Write-Warning "Las migraciones no pudieron ser aplicadas automáticamente"
            
            # Intentar db push como alternativa
            Write-Info "Intentando aplicar esquema con db push..."
            npx prisma db push
            
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "No se pudo aplicar el esquema, pero intentaremos continuar..."
            }
            else {
                Write-Success "Esquema aplicado mediante db push"
            }
        }
    }
    else {
        Write-Info "No se encontró directorio prisma, omitiendo configuración de base de datos"
    }
}

# Función para habilitar rutas largas en Windows
function Enable-LongPaths {
    Write-Info "Verificando soporte para rutas largas en Windows..."
    
    # Verificar si estamos en modo administrador
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    $isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Warning "Esta función requiere privilegios de administrador. Por favor ejecuta el script como administrador."
        return
    }
    
    # Verificar si la configuración de rutas largas está habilitada
    try {
        $longPathsEnabled = Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -ErrorAction SilentlyContinue
        
        if ($null -eq $longPathsEnabled -or $longPathsEnabled.LongPathsEnabled -ne 1) {
            Write-Info "Habilitando soporte para rutas largas en Windows..."
            Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -Type DWord
            Write-Success "Soporte para rutas largas habilitado correctamente"
        }
        else {
            Write-Success "El soporte para rutas largas ya está habilitado"
        }
    }
    catch {
        Write-Error "Error al configurar soporte para rutas largas: $_"
    }
}

# Función para compilar la aplicación
function Build-Application {
    Write-Info "Compilando la aplicación..."
    
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Error al compilar la aplicación"
        Write-Info "Esto puede deberse a errores en el código o problemas con las dependencias."
        Write-Info "Revisa los mensajes de error anteriores para más detalles."
        return $false
    }
    
    Write-Success "Aplicación compilada correctamente"
    return $true
}

# Función principal del menú
function Show-Menu {
    Clear-Host
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host "             LUMO INVENTORY - CONFIGURACIÓN             " -ForegroundColor Cyan
    Write-Host "========================================================" -ForegroundColor Cyan
    Write-Host
    Write-Host "Selecciona una opción:" -ForegroundColor Yellow
    Write-Host
    Write-Host "1. Verificar requisitos del sistema"
    Write-Host "2. Configurar archivos de entorno"
    Write-Host "3. Instalar/actualizar dependencias"
    Write-Host "4. Configurar base de datos"
    Write-Host "5. Habilitar soporte para rutas largas (requiere administrador)"
    Write-Host "6. Compilar aplicación"
    Write-Host "7. Ejecutar setup completo"
    Write-Host
    Write-Host "E. Ejecutar aplicación en modo desarrollo"
    Write-Host "S. Iniciar servidor en modo producción"
    Write-Host "P. Abrir Prisma Studio (visualización de base de datos)"
    Write-Host
    Write-Host "Q. Salir"
    Write-Host
    
    $option = Read-Host "Opción"
    
    switch ($option) {
        "1" {
            Check-Requirements
            Pause
            Show-Menu
        }
        "2" {
            Setup-Environment
            Pause
            Show-Menu
        }
        "3" {
            Install-Dependencies
            Pause
            Show-Menu
        }
        "4" {
            Setup-Database
            Pause
            Show-Menu
        }
        "5" {
            Enable-LongPaths
            Pause
            Show-Menu
        }
        "6" {
            Build-Application
            Pause
            Show-Menu
        }
        "7" {
            $requirementsOk = Check-Requirements
            if ($requirementsOk) {
                Setup-Environment
                $dependenciesOk = Install-Dependencies
                if ($dependenciesOk) {
                    Setup-Database
                    Build-Application
                }
            }
            
            Write-Host
            Write-Success "¡Proceso de configuración completado!"
            Write-Host
            Pause
            Show-Menu
        }
        "E" {
            Write-Info "Iniciando aplicación en modo desarrollo..."
            npm run dev
            Pause
            Show-Menu
        }
        "S" {
            Write-Info "Iniciando servidor en modo producción..."
            npm start
            Pause
            Show-Menu
        }
        "P" {
            Write-Info "Abriendo Prisma Studio..."
            npx prisma studio
            Pause
            Show-Menu
        }
        "Q" {
            return
        }
        Default {
            Write-Warning "Opción no válida"
            Start-Sleep -Seconds 1
            Show-Menu
        }
    }
}

# Verificar la versión de PowerShell
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Error "Este script requiere PowerShell 5.0 o superior"
    Write-Info "Tu versión actual es: $($PSVersionTable.PSVersion)"
    Pause
    exit
}

# Manejar la ejecución con parámetros o en modo interactivo
if ($args.Count -gt 0) {
    switch ($args[0]) {
        "check" { Check-Requirements }
        "env" { Setup-Environment }
        "deps" { Install-Dependencies }
        "db" { Setup-Database }
        "longpaths" { Enable-LongPaths }
        "build" { Build-Application }
        "full" {
            $requirementsOk = Check-Requirements
            if ($requirementsOk) {
                Setup-Environment
                $dependenciesOk = Install-Dependencies
                if ($dependenciesOk) {
                    Setup-Database
                    Build-Application
                }
            }
            
            Write-Host
            Write-Success "¡Proceso de configuración completado!"
        }
        default {
            Write-Warning "Parámetro desconocido: $($args[0])"
            Write-Info "Parámetros válidos: check, env, deps, db, longpaths, build, full"
        }
    }
}
else {
    # Modo interactivo
    Show-Menu
} 