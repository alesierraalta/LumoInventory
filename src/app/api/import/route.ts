import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ImportFileType } from '@/lib/excel-parsers/types';

// Función de logging para depuración
function logImportAPI(message: string, data?: any) {
  console.log(`[IMPORT API] ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Data too complex to stringify:', typeof data);
    }
  }
}

// POST /api/import - Process the import data from the frontend
export async function POST(request: NextRequest) {
  try {
    logImportAPI('Iniciando procesamiento de importación');
    
    const data = await request.json();
    
    if (!data.type || !data.items || !Array.isArray(data.items)) {
      logImportAPI('Error: Formato de datos de importación inválido', data);
      return NextResponse.json(
        { error: 'Invalid import data format' },
        { status: 400 }
      );
    }
    
    const { type, items } = data;
    logImportAPI(`Tipo de importación: ${type}, cantidad de items: ${items.length}`);
    
    switch (type) {
      case ImportFileType.INVENTORY:
        logImportAPI('Procesando importación de inventario');
        return await handleInventoryImport(items);
      case 'catalog':
        logImportAPI('Procesando importación de catálogo');
        return await handleCatalogImport(items);
      case ImportFileType.PROJECTS:
        logImportAPI('Procesando importación de proyecto');
        return await handleProjectImport(data);
      default:
        logImportAPI(`Error: Tipo de importación no soportado: ${type}`);
        return NextResponse.json(
          { error: 'Unsupported import type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing import:', error);
    logImportAPI(`Error inesperado: ${(error as Error).message}`);
    return NextResponse.json(
      { error: 'Failed to process import' },
      { status: 500 }
    );
  }
}

async function handleInventoryImport(items: any[]) {
  logImportAPI(`Iniciando importación de ${items.length} items de inventario`);
  
  const results = {
    created: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Process each item in the inventory import
  for (const item of items) {
    try {
      logImportAPI(`Procesando item: ${item.code} - ${item.description}`);
      
      // Find or create category
      let category = await prisma.category.findFirst({
        where: {
          name: {
            equals: item.category,
            mode: 'insensitive'
          }
        }
      });

      if (!category) {
        logImportAPI(`Creando nueva categoría: ${item.category}`);
        category = await prisma.category.create({
          data: {
            name: item.category,
            description: `Categoría importada: ${item.category}`
          }
        });
      } else {
        logImportAPI(`Categoría encontrada: ${category.name} (ID: ${category.id})`);
      }

      // Look for existing product
      const existingProduct = await prisma.product.findUnique({
        where: {
          code: item.code
        }
      });

      if (existingProduct) {
        // Update existing product
        logImportAPI(`Actualizando producto existente: ${item.code}`);
        await prisma.product.update({
          where: {
            id: existingProduct.id
          },
          data: {
            description: item.description,
            unitCost: item.unitCost,
            margin: item.margin,
            sellingPrice: item.sellingPrice,
            grossProfit: item.grossProfit,
            netCost: item.netCost,
            availableQty: item.availableQty,
            categoryId: category.id
          }
        });
        results.updated++;
      } else {
        // Create new product
        logImportAPI(`Creando nuevo producto: ${item.code}`);
        await prisma.product.create({
          data: {
            code: item.code,
            description: item.description,
            unitCost: item.unitCost,
            margin: item.margin,
            sellingPrice: item.sellingPrice,
            grossProfit: item.grossProfit,
            netCost: item.netCost,
            availableQty: item.availableQty,
            categoryId: category.id
          }
        });
        results.created++;
      }
    } catch (error) {
      console.error(`Error processing item ${item.code}:`, error);
      const errorMessage = `Error en producto ${item.code}: ${(error as Error).message}`;
      logImportAPI(errorMessage);
      results.failed++;
      results.errors.push(errorMessage);
    }
  }

  logImportAPI(`Importación de inventario completada: ${results.created} creados, ${results.updated} actualizados, ${results.failed} fallidos`);
  return NextResponse.json(results);
}

async function handleCatalogImport(items: any[]) {
  logImportAPI(`Iniciando importación de ${items.length} items de catálogo`);
  
  const results = {
    created: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Process each item in the catalog import
  for (const item of items) {
    try {
      logImportAPI(`Procesando item de catálogo: ${item.code} - ${item.description}`);
      
      // Find or create category
      let category = await prisma.category.findFirst({
        where: {
          name: {
            equals: item.category,
            mode: 'insensitive'
          }
        }
      });

      if (!category) {
        logImportAPI(`Creando nueva categoría: ${item.category}`);
        category = await prisma.category.create({
          data: {
            name: item.category,
            description: `Categoría importada: ${item.category}`
          }
        });
      } else {
        logImportAPI(`Categoría encontrada: ${category.name} (ID: ${category.id})`);
      }

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: {
          code: item.code
        }
      });

      if (existingProduct) {
        // Update description and category
        logImportAPI(`Actualizando producto existente: ${item.code}`);
        await prisma.product.update({
          where: {
            id: existingProduct.id
          },
          data: {
            description: item.description,
            categoryId: category.id
          }
        });
        results.updated++;
      } else {
        // Create product with default values
        logImportAPI(`Creando nuevo producto de catálogo: ${item.code}`);
        await prisma.product.create({
          data: {
            code: item.code,
            description: item.description,
            unitCost: 0,
            margin: 0,
            sellingPrice: 0,
            grossProfit: 0,
            availableQty: 0,
            categoryId: category.id
          }
        });
        results.created++;
      }
    } catch (error) {
      console.error(`Error processing catalog item ${item.code}:`, error);
      const errorMessage = `Error en producto de catálogo ${item.code}: ${(error as Error).message}`;
      logImportAPI(errorMessage);
      results.failed++;
      results.errors.push(errorMessage);
    }
  }

  logImportAPI(`Importación de catálogo completada: ${results.created} creados, ${results.updated} actualizados, ${results.failed} fallidos`);
  return NextResponse.json(results);
}

async function handleProjectImport(data: any) {
  logImportAPI('Iniciando importación de proyecto');
  
  const { projectName, clientName, items, totalCost, totalSellingPrice, totalProfit } = data;
  
  if (!projectName || !items || !Array.isArray(items) || items.length === 0) {
    logImportAPI('Error: Datos de proyecto inválidos', data);
    return NextResponse.json(
      { error: 'Invalid project data' },
      { status: 400 }
    );
  }

  logImportAPI(`Proyecto: ${projectName}, Cliente: ${clientName}, Items: ${items.length}`);
  
  try {
    // Create or update project
    let project = await prisma.project.findFirst({
      where: {
        name: projectName
      }
    });

    if (project) {
      // Update project
      logImportAPI(`Actualizando proyecto existente: ${projectName} (ID: ${project.id})`);
      project = await prisma.project.update({
        where: {
          id: project.id
        },
        data: {
          clientName: clientName || project.clientName,
          totalCost,
          totalSellingPrice,
          totalProfit
        }
      });
    } else {
      // Create project
      logImportAPI(`Creando nuevo proyecto: ${projectName}`);
      project = await prisma.project.create({
        data: {
          name: projectName,
          clientName,
          totalCost,
          totalSellingPrice,
          totalProfit
        }
      });
    }

    // Clear existing project products
    logImportAPI(`Eliminando productos existentes del proyecto: ${project.id}`);
    await prisma.projectProduct.deleteMany({
      where: {
        projectId: project.id
      }
    });

    // Add all project products
    logImportAPI(`Agregando ${items.length} productos al proyecto`);
    const projectProducts = [];
    
    for (const item of items) {
      // Find product or create if it doesn't exist
      let product = await prisma.product.findUnique({
        where: {
          code: item.code
        }
      });

      if (!product) {
        // Get or create default category
        let category = await prisma.category.findFirst({
          where: {
            name: "GENERAL"
          }
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: "GENERAL",
              description: "Categoría predeterminada para productos importados"
            }
          });
        }

        // Create product
        product = await prisma.product.create({
          data: {
            code: item.code,
            description: item.description,
            unitCost: item.unitCost,
            sellingPrice: item.sellingPrice,
            margin: ((item.sellingPrice - item.unitCost) / item.sellingPrice) * 100,
            grossProfit: item.sellingPrice - item.unitCost,
            availableQty: 0,
            categoryId: category.id
          }
        });
      }

      // Create project product
      const projectProduct = await prisma.projectProduct.create({
        data: {
          projectId: project.id,
          productId: product.id,
          quantity: item.quantity,
          unitCost: item.unitCost,
          sellingPrice: item.sellingPrice,
          totalCost: item.totalCost,
          totalPrice: item.totalPrice,
          profit: item.profit
        }
      });

      projectProducts.push(projectProduct);
    }

    return NextResponse.json({
      project,
      productsCount: projectProducts.length
    });
  } catch (error) {
    console.error('Error processing project import:', error);
    logImportAPI(`Error inesperado en importación de proyecto: ${(error as Error).message}`);
    return NextResponse.json(
      { error: `Failed to process project import: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 