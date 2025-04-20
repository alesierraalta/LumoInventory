'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  ChevronRightIcon,
  CheckIcon,
  ClockIcon,
  XCircleIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { PageContainer, PageCard, StatCard } from '@/components/ui/page-container';
import { formatCurrency } from '@/lib/utils';

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
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams();
        if (search) {
          params.append('search', search);
        }
        if (statusFilter) {
          params.append('status', statusFilter);
        }
        
        // Fetch projects
        const response = await fetch(`/api/projects?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Error al cargar los proyectos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [search, statusFilter]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search handled by useEffect dependency
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
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
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <ClockIcon className="h-4 w-4 mr-1" />;
      case 'COMPLETED':
        return <CheckIcon className="h-4 w-4 mr-1" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-4 w-4 mr-1" />;
      default:
        return <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />;
    }
  };
  
  // Calculate total stats
  const totalProjects = projects.length;
  const totalInProgress = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const totalProjectsValue = projects.reduce((sum, project) => sum + project.totalSellingPrice, 0);
  const totalProjectsProfit = projects.reduce((sum, project) => sum + project.totalProfit, 0);
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Proyectos</h1>
        <div className="mt-4 md:mt-0">
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Link>
        </div>
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
            title="En Progreso"
            value="--"
            className="from-blue-400 to-blue-600 text-white"
          />
          <StatCard
            title="Valor Total"
            value="--"
            className="from-emerald-400 to-emerald-600 text-white"
          />
          <StatCard
            title="Utilidad Total"
            value="--"
            className="from-amber-400 to-amber-600 text-white"
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
            title="En Progreso"
            value={totalInProgress.toString()}
            className="from-blue-400 to-blue-600 text-white"
          />
          <StatCard
            title="Valor Total"
            value={formatCurrency(totalProjectsValue)}
            className="from-emerald-400 to-emerald-600 text-white"
          />
          <StatCard
            title="Utilidad Total"
            value={formatCurrency(totalProjectsProfit)}
            className="from-amber-400 to-amber-600 text-white"
          />
        </div>
      )}
      
      <PageCard>
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <form onSubmit={handleSearch} className="flex w-full max-w-md items-center">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-slate-200 pl-10 focus:border-indigo-500 focus:ring-indigo-400 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                placeholder="Buscar por nombre o cliente"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Buscar
            </button>
          </form>
          
          <div className="w-full sm:w-auto">
            <select
              className="block w-full rounded-md border-slate-200 focus:border-indigo-500 focus:ring-indigo-400 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                <XCircleIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">No se encontraron proyectos</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {search || statusFilter
                  ? "Intenta ajustar tus criterios de búsqueda"
                  : "Añade un nuevo proyecto para empezar"}
              </p>
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nuevo Proyecto
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Costo Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Precio Venta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Utilidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Actualizado
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {project.clientName || 'Sin cliente'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                        {getStatusIcon(project.status)}
                        {getStatusDisplayText(project.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatCurrency(project.totalCost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatCurrency(project.totalSellingPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(project.totalProfit)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatDate(project.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                      >
                        Ver detalles
                        <ChevronRightIcon className="ml-1 h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>
    </main>
  );
} 