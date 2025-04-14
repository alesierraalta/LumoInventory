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
    
    // Calculate derived fields if not provided
    if (!data.grossProfit) {
      data.grossProfit = data.sellingPrice - data.unitCost;
    }
    
    if (!data.margin) {
      data.margin = data.unitCost > 0 
        ? ((data.sellingPrice - data.unitCost) / data.sellingPrice) * 100 
        : 0;
    }
    
    // Create product
    const product = await prisma.product.create({
      data: {
        code: data.code,
        description: data.description,
        unitCost: data.unitCost,
        sellingPrice: data.sellingPrice,
        grossProfit: data.grossProfit,
        margin: data.margin,
        netCost: data.netCost || data.unitCost,
        availableQty: data.availableQty || 0,
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