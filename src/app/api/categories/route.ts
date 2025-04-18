import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Datos de categorías simulados
const mockCategories = [
  {
    id: "clqwertyuiop1",
    name: "Luminarias",
    description: "Dispositivos de iluminación para interiores y exteriores",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clqwertyuiop2",
    name: "Cables",
    description: "Cables eléctricos de diferentes calibres y tipos",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clqwertyuiop3",
    name: "Accesorios",
    description: "Accesorios para instalaciones eléctricas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clqwertyuiop4",
    name: "Herramientas",
    description: "Herramientas para trabajo eléctrico",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/categories - Get all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories, falling back to mock:', error);
    // Fallback to mock data when database query fails
    return NextResponse.json(mockCategories);
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Create category
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description || null
      }
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 