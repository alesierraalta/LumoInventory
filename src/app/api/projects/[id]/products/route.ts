import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/projects/[id]/products - Get products in a project
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Get project products
    const projectProducts = await prisma.projectProduct.findMany({
      where: {
        projectId: id
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        product: {
          code: 'asc'
        }
      }
    });
    
    return NextResponse.json(projectProducts);
  } catch (error) {
    console.error(`Error fetching products for project ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch project products' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/products - Add a product to a project
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Validate required fields
    if (!data.productId || !data.quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if product is already in project
    const existingProjectProduct = await prisma.projectProduct.findUnique({
      where: {
        projectId_productId: {
          projectId: id,
          productId: data.productId
        }
      }
    });
    
    if (existingProjectProduct) {
      // Update quantity and recalculate
      const quantity = data.quantity;
      const unitCost = data.unitCost || product.unitCost;
      const sellingPrice = data.sellingPrice || product.sellingPrice;
      const totalCost = quantity * unitCost;
      const totalPrice = quantity * sellingPrice;
      const profit = totalPrice - totalCost;
      
      const updatedProjectProduct = await prisma.projectProduct.update({
        where: {
          id: existingProjectProduct.id
        },
        data: {
          quantity,
          unitCost,
          sellingPrice,
          totalCost,
          totalPrice,
          profit
        }
      });
      
      // Update project totals
      await updateProjectTotals(id);
      
      return NextResponse.json(updatedProjectProduct);
    } else {
      // Calculate totals
      const quantity = data.quantity;
      const unitCost = data.unitCost || product.unitCost;
      const sellingPrice = data.sellingPrice || product.sellingPrice;
      const totalCost = quantity * unitCost;
      const totalPrice = quantity * sellingPrice;
      const profit = totalPrice - totalCost;
      
      // Create new project product
      const projectProduct = await prisma.projectProduct.create({
        data: {
          projectId: id,
          productId: data.productId,
          quantity,
          unitCost,
          sellingPrice,
          totalCost,
          totalPrice,
          profit
        }
      });
      
      // Update project totals
      await updateProjectTotals(id);
      
      return NextResponse.json(projectProduct, { status: 201 });
    }
  } catch (error) {
    console.error(`Error adding product to project ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to add product to project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/products - Remove a product from a project
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Delete project product
    await prisma.projectProduct.delete({
      where: {
        projectId_productId: {
          projectId: id,
          productId
        }
      }
    });
    
    // Update project totals
    await updateProjectTotals(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error removing product from project ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to remove product from project' },
      { status: 500 }
    );
  }
}

// Helper function to update project totals
async function updateProjectTotals(projectId: string) {
  // Get all project products
  const projectProducts = await prisma.projectProduct.findMany({
    where: {
      projectId
    }
  });
  
  // Calculate totals
  const totalCost = projectProducts.reduce((sum, item) => sum + item.totalCost, 0);
  const totalSellingPrice = projectProducts.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalProfit = projectProducts.reduce((sum, item) => sum + item.profit, 0);
  
  // Update project
  await prisma.project.update({
    where: {
      id: projectId
    },
    data: {
      totalCost,
      totalSellingPrice,
      totalProfit
    }
  });
} 