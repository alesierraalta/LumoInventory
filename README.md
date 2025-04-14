# Lumo Inventory - Sistema de Gestión de Inventario y Proyectos

## Descripción

Lumo Inventory es una aplicación web full-stack diseñada para empresas que realizan instalaciones de luces para casas y locales. Permite gestionar el inventario de productos, crear y administrar proyectos, importar datos desde archivos Excel con diferentes formatos y generar informes financieros detallados.

## Características Principales

- **Gestión de Inventario**: Administración completa de productos, categorías, costos y precios.
- **Administración de Proyectos**: Creación y seguimiento de proyectos con sus respectivos productos.
- **Importación de Excel**: Soporte para importar datos desde diferentes tipos de archivos Excel:
  - Inventario contable detallado
  - Catálogos simples por categoría
  - Proyectos con precios y cantidades
- **Reportes Financieros**: Generación de informes con costos totales, márgenes, utilidades por proyecto y más.
- **Análisis de Datos**: Visualización de métricas clave para toma de decisiones.

## Tecnologías Utilizadas

- **Frontend**: React, Next.js 14 (App Router), TailwindCSS
- **Backend**: Next.js API Routes (servidor sin estado)
- **Base de Datos**: PostgreSQL (Prisma ORM)
- **Procesamiento de Excel**: xlsx, ExcelJS
- **Reportes**: jsPDF, Chart.js
- **UI Components**: Headless UI, Heroicons

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Layout y rutas del dashboard
│   ├── api/                # API Routes (backend)
│   └── ...
├── components/             # Componentes reutilizables
│   ├── forms/              # Componentes de formulario
│   ├── tables/             # Componentes de tablas
│   └── ui/                 # Componentes de interfaz
├── lib/                    # Utilidades y herramientas
│   ├── excel-parsers/      # Parsers para archivos Excel
│   ├── prisma.ts           # Cliente de Prisma
│   └── utils/              # Funciones utilitarias
└── prisma/                 # Esquema de la base de datos
```

## Instalación y Configuración

### Requisitos

- Node.js 18+ y npm/yarn
- Para desarrollo local: PostgreSQL (o una base de datos compatible con Prisma)
- Para producción: Una cuenta en Vercel y acceso a Neon (PostgreSQL serverless)

### Configuración Local

1. Clonar el repositorio:
   ```
   git clone https://github.com/tu-usuario/lumo-inventory.git
   cd lumo-inventory
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Configurar variables de entorno:
   - Crear archivo `.env` o usar `.env.example`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lumo_inventory"
   ```

4. Inicializar la base de datos:
   ```
   npm run setup-db
   ```

5. (Opcional) Cargar datos iniciales:
   ```
   npm run seed-db
   ```

6. Iniciar el servidor de desarrollo:
   ```
   npm run dev
   ```

### Configuración con Neon para Vercel

1. Crear un proyecto en Neon desde el [Marketplace de Vercel](https://vercel.com/integrations/neon):
   - Configura un nuevo proyecto y branch
   - Obtén la URL de conexión

2. Configurar variables de entorno en Vercel:
   - Añade `DATABASE_URL` con el valor de la URL de conexión de Neon

3. Desplegar a Vercel:
   - El cliente Prisma se generará automáticamente durante el despliegue
   - El esquema de la base de datos se creará en el primer despliegue

4. Para una guía detallada, consulta el archivo [INSTRUCCIONES.md](./INSTRUCCIONES.md)

## Implementación en la Nube

La aplicación está optimizada para ser desplegada en:

- **Vercel**: Para el frontend y backend serverless
- **Neon**: Para la base de datos PostgreSQL serverless (recomendado)
- **Alternativas**: Supabase, PlanetScale u otras opciones del Marketplace de Vercel

## Licencia

MIT

## Contacto

Para más información, contactar a: tu-email@ejemplo.com 