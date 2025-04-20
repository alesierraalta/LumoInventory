import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Datos simulados para proyectos
const mockProjects = [
  {
    id: "clproj1",
    name: "Iluminación Casa Playa",
    description: "Instalación de iluminación para casa de playa en Cancún",
    clientName: "Carlos Mendoza",
    status: "IN_PROGRESS",
    totalCost: 45680.00,
    totalSellingPrice: 68520.00,
    totalProfit: 22840.00,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()  // 2 días atrás
  },
  {
    id: "clproj2",
    name: "Local Comercial Centro",
    description: "Renovación de sistema eléctrico para local comercial",
    clientName: "Retail Solutions SA",
    status: "COMPLETED",
    totalCost: 28450.00,
    totalSellingPrice: 42675.00,
    totalProfit: 14225.00,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días atrás
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()  // 1 día atrás
  },
  {
    id: "clproj3",
    name: "Oficinas Corporativas",
    description: "Diseño e instalación de sistema de iluminación para oficinas corporativas",
    clientName: "Grupo Empresarial ABC",
    status: "IN_PROGRESS",
    totalCost: 125000.00,
    totalSellingPrice: 187500.00,
    totalProfit: 62500.00,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 días atrás
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()  // 3 días atrás
  },
  {
    id: "clproj4",
    name: "Restaurante Vista Mar",
    description: "Iluminación decorativa y funcional para restaurante",
    clientName: "Gastronomía del Pacífico SA",
    status: "IN_PROGRESS",
    totalCost: 75300.00,
    totalSellingPrice: 120480.00,
    totalProfit: 45180.00,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 días atrás
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()  // 4 días atrás
  }
];

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    
    // Build filters
    const filters: any = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get projects
    const projects = await prisma.project.findMany({
      where: filters,
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }
    
    // Create project
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        clientName: data.clientName || null,
        status: data.status || 'IN_PROGRESS',
        totalCost: data.totalCost || 0,
        totalSellingPrice: data.totalSellingPrice || 0,
        totalProfit: data.totalProfit || 0
      }
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 