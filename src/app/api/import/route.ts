import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ImportFileType } from '@/lib/excel-parsers/types';

// POST /api/import - Process the import data from the frontend
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.type || !data.items || !Array.isArray(data.items)) {
      return NextResponse.json(
        { error: 'Invalid import data format' },
        { status: 400 }
      );
    }
    
    const { type, items } = data;
    
    switch (type) {
      case ImportFileType.INVENTORY:
        return await handleInventoryImport(items);
      case ImportFileType.CATALOG:
        return await handleCatalogImport(items);
      case ImportFileType.PROJECT:
        return await handleProjectImport(data);
      default:
        return NextResponse.json(
          { error: 'Unsupported import type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing import:', error);
    return NextResponse.json(
      { error: 'Failed to process import' },
      { status: 500 }
    );
  }
}

async function handleInventoryImport(items: any[]) {
  const results = {
    created: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Process each item in the inventory import
  for (const item of items) {
    try {
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
        category = await prisma.category.create({
          data: {
            name: item.category,
            description: `Categoría importada: ${item.category}`
          }
        });
      }

      // Look for existing product
      const existingProduct = await prisma.product.findUnique({
        where: {
          code: item.code
        }
      });

      if (existingProduct) {
        // Update existing product
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
      results.failed++;
      results.errors.push(`Error en producto ${item.code}: ${(error as Error).message}`);
    }
  }

  return NextResponse.json(results);
}

async function handleCatalogImport(items: any[]) {
  const results = {
    created: 0,
    updated: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Process each item in the catalog import
  for (const item of items) {
    try {
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
        category = await prisma.category.create({
          data: {
            name: item.category,
            description: `Categoría importada: ${item.category}`
          }
        });
      }

      // Check if product exists
      const existingProduct = await prisma.product.findUnique({
        where: {
          code: item.code
        }
      });

      if (existingProduct) {
        // Update description and category
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
      results.failed++;
      results.errors.push(`Error en producto ${item.code}: ${(error as Error).message}`);
    }
  }

  return NextResponse.json(results);
}

async function handleProjectImport(data: any) {
  const { projectName, clientName, items, totalCost, totalSellingPrice, totalProfit } = data;
  
  if (!projectName || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: 'Invalid project data' },
      { status: 400 }
    );
  }

  try {
    // Create or update project
    let project = await prisma.project.findFirst({
      where: {
        name: projectName
      }
    });

    if (project) {
      // Update project
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
    await prisma.projectProduct.deleteMany({
      where: {
        projectId: project.id
      }
    });

    // Add all project products
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
    console.error('Error importing project:', error);
    return NextResponse.json(
      { error: `Failed to import project: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 