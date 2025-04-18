import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Datos simulados para el inventario
const mockProducts = [
  {
    id: "clpr1",
    code: "LUM-001",
    description: "Luminaria LED 20W",
    unitCost: 250.00,
    sellingPrice: 450.00,
    margin: 44.44,
    grossProfit: 200.00,
    netCost: 250.00,
    availableQty: 50,
    categoryId: "clqwertyuiop1",
    category: {
      id: "clqwertyuiop1",
      name: "Luminarias"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clpr2",
    code: "LUM-002",
    description: "Luminaria LED 30W",
    unitCost: 320.00,
    sellingPrice: 580.00,
    margin: 44.83,
    grossProfit: 260.00,
    netCost: 320.00,
    availableQty: 35,
    categoryId: "clqwertyuiop1",
    category: {
      id: "clqwertyuiop1",
      name: "Luminarias"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clpr3",
    code: "CAB-001",
    description: "Cable 12 AWG (m)",
    unitCost: 18.50,
    sellingPrice: 28.00,
    margin: 33.93,
    grossProfit: 9.50,
    netCost: 18.50,
    availableQty: 500,
    categoryId: "clqwertyuiop2",
    category: {
      id: "clqwertyuiop2",
      name: "Cables"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clpr4",
    code: "ACC-001",
    description: "Interruptor sencillo",
    unitCost: 45.00,
    sellingPrice: 85.00,
    margin: 47.06,
    grossProfit: 40.00,
    netCost: 45.00,
    availableQty: 120,
    categoryId: "clqwertyuiop3",
    category: {
      id: "clqwertyuiop3",
      name: "Accesorios"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/inventory - Get all inventory items
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const search = url.searchParams.get('search');
    
    // Build filters
    const filters: any = {};
    
    if (categoryId) {
      filters.categoryId = categoryId;
    }
    
    if (search) {
      filters.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get inventory items with their categories
    const products = await prisma.product.findMany({
      where: filters,
      include: {
        category: true
      },
      orderBy: {
        code: 'asc'
      }
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create a new inventory item
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['code', 'description', 'unitCost', 'sellingPrice', 'categoryId'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Calculate fixed cost
    const fixedCostPct = data.fixedCostPct || 2; // Default 2%
    const fixedCost = (data.unitCost * fixedCostPct) / 100;
    const totalUnitCost = data.unitCost + fixedCost;
    
    // Calculate margins if not provided
    let distributorPrice = data.distributorPrice;
    let intermediatePrice = data.intermediatePrice;
    let distributorMargin = data.distributorMargin;
    let intermediateMargin = data.intermediateMargin;
    
    // If not provided, calculate using typical markups
    if (!distributorPrice) {
      distributorPrice = totalUnitCost * 2; // Example markup
      distributorMargin = ((distributorPrice - totalUnitCost) / distributorPrice) * 100;
    }
    
    if (!intermediatePrice) {
      intermediatePrice = distributorPrice * 1.25; // Example markup
      intermediateMargin = ((intermediatePrice - totalUnitCost) / intermediatePrice) * 100;
    }
    
    // Calculate client final margin
    const margin = ((data.sellingPrice - totalUnitCost) / data.sellingPrice) * 100;
    
    // Calculate gross profit
    const grossProfit = data.sellingPrice - totalUnitCost;
    
    // Create product with calculated fields
    const product = await prisma.product.create({
      data: {
        code: data.code,
        description: data.description,
        unitCost: data.unitCost,
        fixedCostPct: fixedCostPct,
        fixedCost: fixedCost,
        totalUnitCost: totalUnitCost,
        margin: margin,
        distributorPrice: distributorPrice,
        distributorMargin: distributorMargin,
        intermediatePrice: intermediatePrice,
        intermediateMargin: intermediateMargin,
        sellingPrice: data.sellingPrice,
        grossProfit: grossProfit,
        netCost: data.netCost || totalUnitCost,
        availableQty: data.availableQty || 0,
        inTransitQty: data.inTransitQty || 0,
        warehouseQty: data.warehouseQty || 0,
        preSaleQty: data.preSaleQty || 0,
        soldQty: data.soldQty || 0,
        routeQty: data.routeQty || 0,
        routePct: data.routePct || 0,
        image: data.image,
        isInvestmentRecovered: data.isInvestmentRecovered || false,
        categoryId: data.categoryId
      },
      include: {
        category: true
      }
    });
    
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A product with this code already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/:id - Update an inventory item
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Recalculate derived fields if core values change
    let updateData: any = { ...data };
    
    if (data.unitCost || data.fixedCostPct) {
      // Get current product to use existing values if not provided
      const currentProduct = await prisma.product.findUnique({
        where: { id }
      });
      
      if (!currentProduct) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      const unitCost = data.unitCost ?? currentProduct.unitCost;
      const fixedCostPct = data.fixedCostPct ?? currentProduct.fixedCostPct;
      
      // Recalculate fixed cost and total unit cost
      const fixedCost = (unitCost * fixedCostPct) / 100;
      const totalUnitCost = unitCost + fixedCost;
      
      updateData.fixedCost = fixedCost;
      updateData.totalUnitCost = totalUnitCost;
      
      // Recalculate margins if sellingPrice is provided
      if (data.sellingPrice) {
        updateData.margin = ((data.sellingPrice - totalUnitCost) / data.sellingPrice) * 100;
        updateData.grossProfit = data.sellingPrice - totalUnitCost;
      }
      
      // Recalculate distributor and intermediate margins if prices change
      if (data.distributorPrice) {
        updateData.distributorMargin = ((data.distributorPrice - totalUnitCost) / data.distributorPrice) * 100;
      }
      
      if (data.intermediatePrice) {
        updateData.intermediateMargin = ((data.intermediatePrice - totalUnitCost) / data.intermediatePrice) * 100;
      }
    }
    
    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
} 