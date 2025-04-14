'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
  clientName: string | null;
  status: string;
  totalCost: number;
  totalSellingPrice: number;
  totalProfit: number;
}

interface CategorySummary {
  name: string;
  itemCount: number;
  totalValue: number;
}

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects
        const projectsResponse = await fetch('/api/projects');
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
        
        // This would be a real API call in a real app, but we'll mock it for now
        // Fetch category summary
        const mockCategories: CategorySummary[] = [
          { name: 'CINTAS LED', itemCount: 42, totalValue: 24580.50 },
          { name: 'DRIVERS', itemCount: 36, totalValue: 18320.75 },
          { name: 'PERFILES', itemCount: 28, totalValue: 15450.00 },
          { name: 'RIELES', itemCount: 23, totalValue: 12750.30 },
          { name: 'ACCESORIOS', itemCount: 56, totalValue: 8450.25 },
        ];
        
        setCategories(mockCategories);
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast.error('Error al cargar los datos para reportes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Generate inventory report
  const generateInventoryReport = () => {
    toast.success('Generando reporte de inventario...');
    // This would generate a PDF or Excel file in a real app
  };
  
  // Generate project report
  const generateProjectReport = (projectId: string) => {
    toast.success('Generando reporte de proyecto...');
    // This would generate a PDF or Excel file for a specific project in a real app
  };
  
  // Calculate summary stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const totalInventoryValue = categories.reduce((sum, cat) => sum + cat.totalValue, 0);
  const totalSalesValue = projects.reduce((sum, p) => sum + p.totalSellingPrice, 0);
  const totalProfit = projects.reduce((sum, p) => sum + p.totalProfit, 0);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Proyectos</h2>
          <p className="mt-2 text-3xl font-bold">{totalProjects}</p>
          <div className="mt-2 flex text-sm">
            <span className="text-green-600">{completedProjects} completados</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-blue-600">{activeProjects} activos</span>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Valor del Inventario</h2>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(totalInventoryValue)}</p>
          <p className="mt-2 text-sm text-gray-500">
            Basado en {categories.reduce((sum, cat) => sum + cat.itemCount, 0)} artículos
          </p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Ventas y Utilidades</h2>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(totalSalesValue)}</p>
          <p className="mt-2 text-sm text-green-600">
            Utilidad: {formatCurrency(totalProfit)} ({totalSalesValue > 0 ? ((totalProfit / totalSalesValue) * 100).toFixed(1) : 0}%)
          </p>
        </div>
      </div>
      
      {/* Main Reports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Inventory Report */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChartBarIcon className="h-6 w-6 text-blue-500" />
              <h2 className="ml-2 text-lg font-semibold text-gray-800">Reporte de Inventario</h2>
            </div>
            <button
              onClick={generateInventoryReport}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
              Descargar
            </button>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Valor por Categoría</h3>
            <div className="mt-2 space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <span>{formatCurrency(category.totalValue)}</span>
                  </div>
                  <div className="mt-1 overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className="h-2 rounded-full bg-blue-600" 
                      style={{ 
                        width: `${(category.totalValue / totalInventoryValue) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Project Reports */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center">
            <DocumentTextIcon className="h-6 w-6 text-blue-500" />
            <h2 className="ml-2 text-lg font-semibold text-gray-800">Reportes de Proyectos</h2>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700">Reportes Disponibles</h3>
            <div className="mt-2 space-y-3">
              {loading ? (
                <p className="text-gray-500">Cargando proyectos...</p>
              ) : projects.length === 0 ? (
                <p className="text-gray-500">No hay proyectos disponibles</p>
              ) : (
                projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-500">
                        {project.clientName || 'Sin cliente'} - {formatCurrency(project.totalSellingPrice)}
                      </p>
                    </div>
                    <button
                      onClick={() => generateProjectReport(project.id)}
                      className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <ArrowDownTrayIcon className="mr-1 h-4 w-4" />
                      Reporte
                    </button>
                  </div>
                ))
              )}
              
              {projects.length > 5 && (
                <div className="mt-2 text-center">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Ver todos los proyectos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Financial Summary */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-lg font-semibold text-gray-800">Resumen Financiero</h2>
        
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Proyecto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Costo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Precio Venta
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Utilidad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Margen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Cargando datos...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No hay proyectos disponibles
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const margin = project.totalSellingPrice > 0 
                    ? (project.totalProfit / project.totalSellingPrice) * 100 
                    : 0;
                  
                  return (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project.clientName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {project.status === 'COMPLETED' ? 'Completado' : 
                         project.status === 'IN_PROGRESS' ? 'En Progreso' : 'Cancelado'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatCurrency(project.totalCost)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatCurrency(project.totalSellingPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        {formatCurrency(project.totalProfit)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {margin.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })
              )}
              
              {/* Summary Row */}
              <tr className="bg-gray-50 font-medium">
                <td colSpan={3} className="px-6 py-4 text-right text-sm text-gray-900">
                  Totales:
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatCurrency(projects.reduce((sum, p) => sum + p.totalCost, 0))}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatCurrency(totalSalesValue)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-green-600">
                  {formatCurrency(totalProfit)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {totalSalesValue > 0 ? ((totalProfit / totalSalesValue) * 100).toFixed(2) : '0.00'}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 