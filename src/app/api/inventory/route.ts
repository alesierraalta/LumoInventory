import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClientInitializationError } from '@prisma/client/runtime/library';

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

// Datos simulados para Valencia
const mockValenciaProducts = [
  {
    id: "valpr1",
    code: "LUM-V001",
    description: "Luminaria LED 20W",
    unitCost: 245.00,
    sellingPrice: 440.00,
    margin: 44.32,
    grossProfit: 195.00,
    netCost: 245.00,
    availableQty: 42,
    categoryId: "clqwertyuiop1",
    category: {
      id: "clqwertyuiop1",
      name: "Luminarias"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "valpr2",
    code: "LUM-V002",
    description: "Luminaria LED 30W",
    unitCost: 315.00,
    sellingPrice: 570.00,
    margin: 44.74,
    grossProfit: 255.00,
    netCost: 315.00,
    availableQty: 28,
    categoryId: "clqwertyuiop1",
    category: {
      id: "clqwertyuiop1",
      name: "Luminarias"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "valpr3",
    code: "CAB-V001",
    description: "Cable 12 AWG (m)",
    unitCost: 17.80,
    sellingPrice: 27.50,
    margin: 35.27,
    grossProfit: 9.70,
    netCost: 17.80,
    availableQty: 380,
    categoryId: "clqwertyuiop2",
    category: {
      id: "clqwertyuiop2",
      name: "Cables"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Datos simulados para Maracaibo
const mockMaracaiboProducts = [
  {
    id: "marpr1",
    code: "LUM-M001",
    description: "Luminaria LED 20W",
    unitCost: 255.00,
    sellingPrice: 460.00,
    margin: 44.57,
    grossProfit: 205.00,
    netCost: 255.00,
    availableQty: 38,
    categoryId: "clqwertyuiop1",
    category: {
      id: "clqwertyuiop1",
      name: "Luminarias"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "marpr2",
    code: "LUM-M002",
    description: "Luminaria LED 30W",
    unitCost: 325.00,
    sellingPrice: 590.00,
    margin: 44.92,
    grossProfit: 265.00,
    netCost: 325.00,
    availableQty: 24,
    categoryId: "clqwertyuiop1",
    category: {
      id: "clqwertyuiop1",
      name: "Luminarias"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "marpr3",
    code: "CAB-M001",
    description: "Cable 12 AWG (m)",
    unitCost: 19.20,
    sellingPrice: 29.50,
    margin: 34.92,
    grossProfit: 10.30,
    netCost: 19.20,
    availableQty: 420,
    categoryId: "clqwertyuiop2",
    category: {
      id: "clqwertyuiop2",
      name: "Cables"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "marpr4",
    code: "PANEL-M001",
    description: "Panel Solar 100W",
    unitCost: 450.00,
    sellingPrice: 780.00,
    margin: 42.31,
    grossProfit: 330.00,
    netCost: 450.00,
    availableQty: 15,
    categoryId: "clqwertyuiop4",
    category: {
      id: "clqwertyuiop4",
      name: "Paneles Solares"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "marpr5",
    code: "BAT-M001",
    description: "Batería Solar 120Ah",
    unitCost: 680.00,
    sellingPrice: 1150.00,
    margin: 40.87,
    grossProfit: 470.00,
    netCost: 680.00,
    availableQty: 8,
    categoryId: "clqwertyuiop4",
    category: {
      id: "clqwertyuiop4",
      name: "Paneles Solares"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/inventory - Get all inventory items
export async function GET(request: NextRequest) {
  try {
    // Make sure we have a valid prisma client before calling methods on it
    if (!prisma || !prisma.product) {
      console.error('Prisma client or product model is undefined, returning mock data');
      
      // Parse query parameters
      const url = new URL(request.url);
      const location = url.searchParams.get('location');
      
      // Return location-specific mock data
      if (location === 'valencia') {
        return NextResponse.json(mockValenciaProducts);
      } else if (location === 'maracaibo') {
        return NextResponse.json(mockMaracaiboProducts);
      }
      
      // Default to Caracas
      return NextResponse.json(mockProducts);
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const search = url.searchParams.get('search');
    const location = url.searchParams.get('location');
    
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
    
    if (location) {
      filters.location = location;
    }
    
    try {
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
      
      // If products are undefined or empty, fall back to mock data
      if (!products || products.length === 0) {
        console.log('No products found in database, using mock data');
        
        // Return location-specific mock data
        if (location === 'valencia') {
          return NextResponse.json(mockValenciaProducts);
        } else if (location === 'maracaibo') {
          return NextResponse.json(mockMaracaiboProducts);
        }
        
        // Default to Caracas
        return NextResponse.json(mockProducts);
      }
      
      // Process and validate each product to prevent undefined access errors
      const validProducts = products.map(product => {
        // If category is missing, provide a default
        if (!product.category) {
          return {
            ...product,
            category: {
              id: 'default',
              name: 'Sin Categoría'
            }
          };
        }
        return product;
      });
      
      return NextResponse.json(validProducts);
    } catch (dbError) {
      console.error('Database error fetching inventory, falling back to mock:', dbError);
      
      // Return location-specific mock data
      const url = new URL(request.url);
      const location = url.searchParams.get('location');
      
      if (location === 'valencia') {
        return NextResponse.json(mockValenciaProducts);
      } else if (location === 'maracaibo') {
        return NextResponse.json(mockMaracaiboProducts);
      }
      
      // Default to Caracas
      return NextResponse.json(mockProducts);
    }
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(mockProducts);
  }
}

// POST /api/inventory - Create a new inventory item
export async function POST(request: NextRequest) {
  try {
    // Make sure we have a valid prisma client before calling methods on it
    if (!prisma || !prisma.product) {
      console.error('Prisma client or product model is undefined, using mock implementation');
      const data = await request.json();
      
      // Create a mock product with pre-calculated fields
      const fixedCostPct = data.fixedCostPct || 2; // Default 2%
      const fixedCost = (data.unitCost * fixedCostPct) / 100;
      const totalUnitCost = data.unitCost + fixedCost;
      const margin = ((data.sellingPrice - totalUnitCost) / data.sellingPrice) * 100;
      const grossProfit = data.sellingPrice - totalUnitCost;
      
      const mockProduct = {
        id: "mock-" + Date.now(),
        code: data.code,
        description: data.description,
        unitCost: data.unitCost,
        fixedCostPct: fixedCostPct,
        fixedCost: fixedCost,
        totalUnitCost: totalUnitCost,
        margin: margin,
        distributorPrice: data.distributorPrice || totalUnitCost * 2,
        distributorMargin: data.distributorMargin || 25,
        intermediatePrice: data.intermediatePrice || totalUnitCost * 2.5,
        intermediateMargin: data.intermediateMargin || 30,
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
        categoryId: data.categoryId,
        category: {
          id: data.categoryId,
          name: "Mock Category"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json(mockProduct, { status: 201 });
    }
    
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
    
    try {
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
    } catch (dbError: any) {
      // Handle unique constraint violations
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'A product with this code already exists' },
          { status: 409 }
        );
      }
      
      // Handle database connection issues
      if (dbError instanceof PrismaClientInitializationError || 
          (dbError instanceof Error && dbError.message.includes('connect'))) {
        console.error('Database connection error, falling back to mock:', dbError);
        
        // Create a mock product with calculated fields
        const fixedCostPct = data.fixedCostPct || 2;
        const fixedCost = (data.unitCost * fixedCostPct) / 100;
        const totalUnitCost = data.unitCost + fixedCost;
        const margin = ((data.sellingPrice - totalUnitCost) / data.sellingPrice) * 100;
        const grossProfit = data.sellingPrice - totalUnitCost;
        
        const mockProduct = {
          id: "mock-" + Date.now(),
          code: data.code,
          description: data.description,
          unitCost: data.unitCost,
          fixedCostPct: fixedCostPct,
          fixedCost: fixedCost,
          totalUnitCost: totalUnitCost,
          margin: margin,
          distributorPrice: data.distributorPrice || totalUnitCost * 2,
          distributorMargin: data.distributorMargin || 25,
          intermediatePrice: data.intermediatePrice || totalUnitCost * 2.5,
          intermediateMargin: data.intermediateMargin || 30,
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
          categoryId: data.categoryId,
          category: {
            id: data.categoryId,
            name: "Mock Category"
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return NextResponse.json(mockProduct, { status: 201 });
      }
      
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error creating inventory item:', error);
    
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/:id - Update an inventory item
export async function PUT(request: NextRequest) {
  try {
    // Make sure we have a valid prisma client before calling methods on it
    if (!prisma || !prisma.product) {
      console.error('Prisma client or product model is undefined, using mock implementation');
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      const data = await request.json();
      
      // Return mock updated product
      return NextResponse.json({
        id,
        ...data,
        updatedAt: new Date().toISOString()
      });
    }
    
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
    
    try {
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
    } catch (dbError: any) {
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      
      // Handle database connection issues
      if (dbError instanceof PrismaClientInitializationError || 
          (dbError instanceof Error && dbError.message.includes('connect'))) {
        console.error('Database connection error, falling back to mock:', dbError);
        
        // Return mock updated product
        return NextResponse.json({
          id,
          ...data,
          updatedAt: new Date().toISOString()
        });
      }
      
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error updating inventory item:', error);
    
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
} 