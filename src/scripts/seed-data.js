// Script para insertar datos iniciales en la base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos iniciales en la base de datos...');
  
  // Crear categorías
  console.log('Creando categorías...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Luminarias' },
      update: {},
      create: {
        name: 'Luminarias',
        description: 'Dispositivos de iluminación para interiores y exteriores'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Cables' },
      update: {},
      create: {
        name: 'Cables',
        description: 'Cables eléctricos de diferentes calibres y tipos'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Accesorios' },
      update: {},
      create: {
        name: 'Accesorios',
        description: 'Accesorios para instalaciones eléctricas'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Herramientas' },
      update: {},
      create: {
        name: 'Herramientas',
        description: 'Herramientas para trabajo eléctrico'
      }
    })
  ]);
  console.log(`✅ Creadas ${categories.length} categorías`);
  
  // Crear productos
  console.log('Creando productos...');
  const products = await Promise.all([
    prisma.product.upsert({
      where: { code: 'LUM-001' },
      update: {},
      create: {
        code: 'LUM-001',
        description: 'Luminaria LED 20W',
        unitCost: 250.00,
        sellingPrice: 450.00,
        margin: 44.44,
        grossProfit: 200.00,
        netCost: 250.00,
        availableQty: 50,
        categoryId: categories[0].id
      }
    }),
    prisma.product.upsert({
      where: { code: 'LUM-002' },
      update: {},
      create: {
        code: 'LUM-002',
        description: 'Luminaria LED 30W',
        unitCost: 320.00,
        sellingPrice: 580.00,
        margin: 44.83,
        grossProfit: 260.00,
        netCost: 320.00,
        availableQty: 35,
        categoryId: categories[0].id
      }
    }),
    prisma.product.upsert({
      where: { code: 'CAB-001' },
      update: {},
      create: {
        code: 'CAB-001',
        description: 'Cable 12 AWG (m)',
        unitCost: 18.50,
        sellingPrice: 28.00,
        margin: 33.93,
        grossProfit: 9.50,
        netCost: 18.50,
        availableQty: 500,
        categoryId: categories[1].id
      }
    }),
    prisma.product.upsert({
      where: { code: 'ACC-001' },
      update: {},
      create: {
        code: 'ACC-001',
        description: 'Interruptor sencillo',
        unitCost: 45.00,
        sellingPrice: 85.00,
        margin: 47.06,
        grossProfit: 40.00,
        netCost: 45.00,
        availableQty: 120,
        categoryId: categories[2].id
      }
    })
  ]);
  console.log(`✅ Creados ${products.length} productos`);
  
  // Crear proyectos
  console.log('Creando proyectos...');
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Iluminación Casa Playa',
        description: 'Instalación de iluminación para casa de playa en Cancún',
        clientName: 'Carlos Mendoza',
        status: 'IN_PROGRESS',
        totalCost: 45680.00,
        totalSellingPrice: 68520.00,
        totalProfit: 22840.00
      }
    }),
    prisma.project.create({
      data: {
        name: 'Local Comercial Centro',
        description: 'Renovación de sistema eléctrico para local comercial',
        clientName: 'Retail Solutions SA',
        status: 'COMPLETED',
        totalCost: 28450.00,
        totalSellingPrice: 42675.00,
        totalProfit: 14225.00
      }
    }),
    prisma.project.create({
      data: {
        name: 'Oficinas Corporativas',
        description: 'Diseño e instalación de sistema de iluminación para oficinas corporativas',
        clientName: 'Grupo Empresarial ABC',
        status: 'IN_PROGRESS',
        totalCost: 125000.00,
        totalSellingPrice: 187500.00,
        totalProfit: 62500.00
      }
    }),
    prisma.project.create({
      data: {
        name: 'Restaurante Vista Mar',
        description: 'Iluminación decorativa y funcional para restaurante',
        clientName: 'Gastronomía del Pacífico SA',
        status: 'IN_PROGRESS',
        totalCost: 75300.00,
        totalSellingPrice: 120480.00,
        totalProfit: 45180.00
      }
    })
  ]);
  console.log(`✅ Creados ${projects.length} proyectos`);
  
  console.log('🎉 Datos iniciales creados correctamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error al sembrar datos iniciales:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 