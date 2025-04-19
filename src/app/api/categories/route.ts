import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Datos de categorías simulados
const mockCategories = [
  {
    id: "clqwertyuiop1",
    name: "Luminarias",
    description: "Dispositivos de iluminación para interiores y exteriores",
    location: "caracas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clqwertyuiop2",
    name: "Cables",
    description: "Cables eléctricos de diferentes calibres y tipos",
    location: "caracas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clqwertyuiop3",
    name: "Accesorios",
    description: "Accesorios para instalaciones eléctricas",
    location: "caracas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clqwertyuiop4",
    name: "Herramientas",
    description: "Herramientas para trabajo eléctrico",
    location: "caracas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clqwertyuiop5",
    name: "Luminarias",
    description: "Dispositivos de iluminación para interiores y exteriores",
    location: "valencia",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "clqwertyuiop6",
    name: "Cables",
    description: "Cables eléctricos de diferentes calibres y tipos",
    location: "valencia",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/categories - Get all categories with location filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'caracas'; // Default location is caracas
    
    const categories = await prisma.category.findMany({
      where: { location },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories, falling back to mock:', error);
    
    // Fallback to mock data when database query fails, filtering by location
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'caracas';
    const filteredMocks = mockCategories.filter(cat => cat.location === location);
    
    return NextResponse.json(filteredMocks);
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
    
    // Create category (with location support)
    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description || null,
        location: data.location || 'caracas'
      }
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A category with this name already exists in this location' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 