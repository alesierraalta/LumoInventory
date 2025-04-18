'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CurrencyDollarIcon, 
  CubeIcon, 
  ClipboardDocumentListIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShoppingBagIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { PageContainer, PageCard, StatCard } from '@/components/ui/page-container';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for demonstration
  const stats = {
    currentMonth: {
      revenue: 42500,
      profit: 15800,
      costs: 26700,
      growth: 12.5
    },
    inventory: {
      total: 567,
      recentlyAdded: 24,
      lowStock: 18
    },
    projects: {
      active: 8,
      completed: 5,
      pending: 3
    }
  };
  
  const recentProjects = [
    { id: 1, name: 'Office Renovation', client: 'Acme Corp', status: 'In Progress', value: 12500 },
    { id: 2, name: 'Kitchen Remodel', client: 'Homestead Partners', status: 'Completed', value: 8750 },
    { id: 3, name: 'Bathroom Upgrade', client: 'Private Client', status: 'Planning', value: 5200 },
    { id: 4, name: 'Deck Construction', client: 'Mountain View HOA', status: 'In Progress', value: 9300 },
  ];
  
  const lowStockItems = [
    { id: 1, name: 'Maple Plywood 3/4"', category: 'Wood', quantity: 5, reorderPoint: 10 },
    { id: 2, name: 'Brass Cabinet Hinges', category: 'Hardware', quantity: 12, reorderPoint: 25 },
    { id: 3, name: 'Polyurethane Finish', category: 'Finishes', quantity: 3, reorderPoint: 5 },
  ];
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <PageContainer title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Monthly Revenue" 
          value={formatCurrency(stats.currentMonth.revenue)}
          description={`${stats.currentMonth.growth > 0 ? '+' : ''}${stats.currentMonth.growth}% from last month`}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          className="from-blue-500 to-blue-600 text-white"
        />
        <StatCard 
          title="Monthly Profit" 
          value={formatCurrency(stats.currentMonth.profit)}
          description={`${Math.round(stats.currentMonth.profit/stats.currentMonth.revenue*100)}% margin`}
          icon={<ArrowTrendingUpIcon className="h-6 w-6" />}
          className="from-green-500 to-green-600 text-white"
        />
        <StatCard 
          title="Monthly Costs" 
          value={formatCurrency(stats.currentMonth.costs)}
          description="Includes materials and labor"
          icon={<ArrowTrendingDownIcon className="h-6 w-6" />}
          className="from-orange-500 to-orange-600 text-white"
        />
        <StatCard 
          title="Total Inventory" 
          value={stats.inventory.total} 
          description={`${stats.inventory.recentlyAdded} items added this month`}
          icon={<CubeIcon className="h-6 w-6" />}
          className="from-purple-500 to-purple-600 text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <PageCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Projects</h2>
            <a href="/projects" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              View All
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-2 font-medium text-slate-700 dark:text-slate-300">Project</th>
                  <th className="pb-2 font-medium text-slate-700 dark:text-slate-300">Client</th>
                  <th className="pb-2 font-medium text-slate-700 dark:text-slate-300">Status</th>
                  <th className="pb-2 font-medium text-right text-slate-700 dark:text-slate-300">Value</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map(project => (
                  <tr key={project.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 text-slate-700 dark:text-slate-300">{project.name}</td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">{project.client}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-700 dark:text-slate-300">{formatCurrency(project.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageCard>
        
        <div className="space-y-6">
          <PageCard>
            <div className="flex items-start">
              <div className="mr-4 p-3 bg-blue-100 rounded-lg dark:bg-blue-900">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Project Summary</h2>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.projects.active}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.projects.completed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.projects.pending}</p>
                  </div>
                </div>
              </div>
            </div>
          </PageCard>
          
          <PageCard>
            <div className="flex items-start">
              <div className="mr-4 p-3 bg-red-100 rounded-lg dark:bg-red-900">
                <ClipboardDocumentCheckIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Low Stock Items</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Items below reorder point</p>
                
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600 dark:text-red-400">{item.quantity} left</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Reorder at {item.reorderPoint}</p>
                    </div>
                  </div>
                ))}
                
                <a href="/inventory" className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                  View Inventory
                </a>
              </div>
            </div>
          </PageCard>
        </div>
      </div>
    </PageContainer>
  );
} 