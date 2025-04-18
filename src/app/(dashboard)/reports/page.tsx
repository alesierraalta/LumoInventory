'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { PageContainer, PageCard, StatCard } from '@/components/ui/page-container';
import { formatCurrency } from '@/lib/utils';

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
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Informes y Reportes</h1>
        <button className="mt-4 md:mt-0 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Exportar Todos
        </button>
      </div>
      
      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-pulse">
          <StatCard
            title="Total Proyectos"
            value="--"
            className="from-indigo-400 to-indigo-600 text-white"
          />
          <StatCard
            title="Valor Inventario"
            value="--"
            className="from-emerald-400 to-emerald-500 text-white"
          />
          <StatCard
            title="Total Ventas"
            value="--"
            className="from-slate-400 to-slate-600 text-white"
          />
          <StatCard
            title="Utilidad Total"
            value="--"
            className="from-indigo-300 to-indigo-500 text-white"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Proyectos"
            value={totalProjects.toString()}
            className="from-indigo-400 to-indigo-600 text-white"
          />
          <StatCard
            title="Valor Inventario"
            value={formatCurrency(totalInventoryValue)}
            className="from-emerald-400 to-emerald-500 text-white"
          />
          <StatCard
            title="Total Ventas"
            value={formatCurrency(totalSalesValue)}
            className="from-slate-400 to-slate-600 text-white"
          />
          <StatCard
            title="Utilidad Total"
            value={formatCurrency(totalProfit)}
            className="from-indigo-300 to-indigo-500 text-white"
          />
        </div>
      )}
      
      {/* Main Reports */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Inventory Report */}
        <PageCard>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-indigo-500" />
              <h2 className="ml-2 text-lg font-semibold text-slate-800 dark:text-white">Reporte de Inventario</h2>
            </div>
            <button
              onClick={generateInventoryReport}
              className="inline-flex items-center justify-center px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-md text-sm font-medium transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
              Exportar
            </button>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Valor por Categoría</h3>
            <div className="mt-2 space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="relative">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{category.name}</span>
                    <span className="text-slate-600 dark:text-slate-400">{formatCurrency(category.totalValue)}</span>
                  </div>
                  <div className="mt-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div 
                      className="h-2 rounded-full bg-indigo-500" 
                      style={{ 
                        width: `${(category.totalValue / totalInventoryValue) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageCard>
        
        {/* Project Reports */}
        <PageCard>
          <div className="flex items-center mb-5">
            <DocumentTextIcon className="h-5 w-5 text-indigo-500" />
            <h2 className="ml-2 text-lg font-semibold text-slate-800 dark:text-white">Reportes de Proyectos</h2>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Reportes Disponibles</h3>
            <div className="mt-2 space-y-3">
              {loading ? (
                <div className="animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 h-24"></div>
              ) : projects.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">No hay proyectos disponibles</p>
              ) : (
                projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-white">{project.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {project.clientName || 'Sin cliente'} • {formatCurrency(project.totalSellingPrice)}
                      </p>
                    </div>
                    <button
                      onClick={() => generateProjectReport(project.id)}
                      className="inline-flex items-center px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded text-xs font-medium transition-colors dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                    >
                      <ArrowDownTrayIcon className="mr-1 h-3 w-3" />
                      PDF
                    </button>
                  </div>
                ))
              )}
              
              {projects.length > 5 && (
                <div className="mt-3 text-center">
                  <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                    Ver todos los proyectos
                  </button>
                </div>
              )}
            </div>
          </div>
        </PageCard>
        
        {/* Financial Summary Preview */}
        <PageCard>
          <div className="flex items-center mb-5">
            <BanknotesIcon className="h-5 w-5 text-indigo-500" />
            <h2 className="ml-2 text-lg font-semibold text-slate-800 dark:text-white">Resumen Financiero</h2>
          </div>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ventas Totales</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalSalesValue)}</p>
              <div className="mt-1 flex items-center text-xs text-green-600 dark:text-green-400">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                <span>+5.3% vs mes anterior</span>
              </div>
            </div>
            
            <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Margen Promedio</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalSalesValue > 0 ? ((totalProfit / totalSalesValue) * 100).toFixed(1) : 0}%
              </p>
              <div className="mt-1 flex items-center text-xs text-green-600 dark:text-green-400">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                <span>+2.1% vs mes anterior</span>
              </div>
            </div>
            
            <button className="mt-2 w-full inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-md text-sm font-medium transition-colors">
              Ver informe completo
            </button>
          </div>
        </PageCard>
      </div>
      
      {/* Financial Summary Table */}
      <PageCard>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Resumen Financiero</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Proyecto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Costo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Precio Venta
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Utilidad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Margen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                    Cargando datos...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                    No hay proyectos disponibles
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const margin = project.totalSellingPrice > 0
                    ? (project.totalProfit / project.totalSellingPrice) * 100
                    : 0;
                  
                  return (
                    <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-white">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        {project.clientName || 'Sin cliente'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          project.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : project.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {project.status === 'COMPLETED' ? 'Completado' : 
                           project.status === 'IN_PROGRESS' ? 'En Progreso' : 
                           project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        {formatCurrency(project.totalCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                        {formatCurrency(project.totalSellingPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(project.totalProfit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {!loading && projects.length > 0 && (
              <tfoot className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    Totales
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-white">
                    {formatCurrency(projects.reduce((sum, p) => sum + p.totalCost, 0))}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-white">
                    {formatCurrency(totalSalesValue)}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(totalProfit)}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-white">
                    {totalSalesValue > 0 ? ((totalProfit / totalSalesValue) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </PageCard>
    </main>
  );
} 