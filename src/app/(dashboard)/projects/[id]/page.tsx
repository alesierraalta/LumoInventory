'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  code: string;
  description: string;
  category: {
    name: string;
  };
}

interface ProjectProduct {
  id: string;
  quantity: number;
  unitCost: number;
  sellingPrice: number;
  totalCost: number;
  totalPrice: number;
  profit: number;
  product: Product;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  clientName: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalCost: number;
  totalSellingPrice: number;
  totalProfit: number;
  createdAt: string;
  updatedAt: string;
  products: ProjectProduct[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  };
  
  // Get status display text
  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };
  
  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/projects/${projectId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Proyecto no encontrado');
            router.push('/projects');
            return;
          }
          throw new Error('Failed to fetch project');
        }
        
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Error fetching project details:', error);
        toast.error('Error al cargar los detalles del proyecto');
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchProject();
    }
  }, [projectId, router]);
  
  // Handle project delete
  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      toast.success('Proyecto eliminado correctamente');
      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error al eliminar el proyecto');
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (!project) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...project,
          status: newStatus,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update project status');
      }
      
      const updatedProject = await response.json();
      setProject(updatedProject);
      toast.success(`Estado actualizado a ${getStatusDisplayText(newStatus)}`);
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Error al actualizar el estado del proyecto');
    }
  };
  
  // Calculate project profit margin
  const calculateProfitMargin = () => {
    if (!project || project.totalSellingPrice === 0) return 0;
    return ((project.totalProfit / project.totalSellingPrice) * 100).toFixed(2);
  };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Cargando detalles del proyecto...</p>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Proyecto no encontrado</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/projects"
            className="mr-4 rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/projects/${projectId}/edit`}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Editar
          </Link>
          <button
            onClick={() => setDeleteConfirm(true)}
            className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>
      
      {/* Confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Eliminar proyecto</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro que deseas eliminar este proyecto? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteProject}
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setDeleteConfirm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Información del proyecto */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Detalles del Proyecto</h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Cliente</p>
              <p className="text-gray-800">{project.clientName || 'No especificado'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Estado</p>
              <div className="mt-1">
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
            </div>
            
            {project.description && (
              <div>
                <p className="text-sm font-medium text-gray-500">Descripción</p>
                <p className="text-gray-800">{project.description}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Resumen Financiero</h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Costo Total</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(project.totalCost)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Precio de Venta</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(project.totalSellingPrice)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Utilidad</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(project.totalProfit)}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500">Margen</p>
              <p className="text-xl font-bold text-blue-600">{calculateProfitMargin()}%</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Acciones</h2>
          <div className="mt-4 space-y-3">
            <Link
              href={`/projects/${projectId}/add-product`}
              className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusIcon className="mr-2 inline-block h-4 w-4" />
              Agregar Producto
            </Link>
            
            <button
              className="block w-full rounded-md bg-green-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Generar Reporte
            </button>
          </div>
        </div>
      </div>
      
      {/* Lista de productos */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Productos en este Proyecto</h2>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {project.products.length} Productos
          </span>
        </div>
        
        {project.products.length === 0 ? (
          <div className="mt-4 flex h-40 items-center justify-center rounded-md bg-gray-50">
            <p className="text-gray-500">No hay productos en este proyecto</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Producto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Cantidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Costo Unitario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Precio Unitario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Costo Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Precio Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Utilidad
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {project.products.map((projectProduct) => (
                  <tr key={projectProduct.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {projectProduct.product.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{projectProduct.product.description}</div>
                      <div className="text-xs text-gray-400">{projectProduct.product.category.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {projectProduct.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(projectProduct.unitCost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(projectProduct.sellingPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(projectProduct.totalCost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(projectProduct.totalPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      {formatCurrency(projectProduct.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 