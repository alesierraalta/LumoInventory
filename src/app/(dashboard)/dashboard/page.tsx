'use client';

import Link from 'next/link';
import { 
  CurrencyDollarIcon, 
  CubeIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, description, icon, color }: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="flex items-center">
        <div className={`rounded-md p-3 ${color}`}>
          {icon}
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // Mock data - in a real application, this would come from API calls
  const stats = [
    {
      title: 'Valor del Inventario',
      value: '$125,420.00',
      description: '+2.5% respecto al mes anterior',
      icon: <CurrencyDollarIcon className="h-6 w-6 text-white" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Productos en Stock',
      value: '1,240',
      description: '85 productos con bajo inventario',
      icon: <CubeIcon className="h-6 w-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Proyectos Activos',
      value: '8',
      description: '3 pendientes de completar',
      icon: <ClipboardDocumentListIcon className="h-6 w-6 text-white" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Utilidad Proyectada',
      value: '$32,450.00',
      description: 'Basado en proyectos actuales',
      icon: <ChartBarIcon className="h-6 w-6 text-white" />,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div>
          <Link 
            href="/inventory" 
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Gestionar Inventario
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Inventario por Categoría</h2>
          <div className="mt-4 h-64 rounded-md bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Gráfico de inventario por categoría</p>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Proyectos Recientes</h2>
          <div className="mt-4 space-y-3">
            {['Iluminación Casa Playa', 'Local Comercial Centro', 'Oficinas Corporativas', 'Restaurante Vista Mar'].map((project, index) => (
              <div key={index} className="rounded-md border border-gray-200 p-3">
                <h3 className="font-medium">{project}</h3>
                <p className="text-sm text-gray-500">Actualizado hace {index + 1} días</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 