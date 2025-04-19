'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  PlusIcon, 
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CubeIcon,
  BanknotesIcon,
  TagIcon,
  ChartBarIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ArchiveBoxXMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Tooltip } from '@/components/ui/tooltip'; 
import { PageContainer, PageCard, StatCard } from '@/components/ui/page-container';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

// Tipos de datos basados en la estructura actual
interface Product {
  id: string;
  code: string;
  description: string;
  unitCost: number;
  margin: number;
  sellingPrice: number;
  grossProfit: number;
  netCost: number | null;
  availableQty: number;
  categoryId: string;
  category?: Category;
  inTransitQty?: number;
  warehouseQty?: number;
  minQuantity?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
}

export default function MaracaiboInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('code');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Usar fetch en lugar de axios para mantener consistencia con el código original
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/inventory?location=maracaibo').then(res => res.json()),
        fetch('/api/categories').then(res => res.json())
      ]);
      setProducts(productsRes);
      setCategories(categoriesRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...products]
    .filter(product => {
      if (!searchTerm) return true;
      return (
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a: any, b: any) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Sin categoría';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Desconocida';
  };

  const totalInventoryCost = products.reduce((sum, product) => {
    return sum + (product.unitCost || 0) * (product.availableQty || 0);
  }, 0);

  const totalInventoryValue = products.reduce((sum, product) => {
    return sum + (product.sellingPrice || 0) * (product.availableQty || 0);
  }, 0);

  const lowStockItems = products.filter(product => 
    (product.availableQty || 0) <= (product.minQuantity || 5)
  ).length;

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ArrowUpIcon className="h-4 w-4" /> 
      : <ArrowDownIcon className="h-4 w-4" />;
  };

  const loadingDashboard = (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Items"
          value={<div className="h-8 w-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />}
          className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700"
        />
        <StatCard
          title="Total Value"
          value={<div className="h-8 w-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />}
          className="bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-700"
        />
        <StatCard
          title="Categories"
          value={<div className="h-8 w-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />}
          className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700"
        />
        <StatCard
          title="Average Cost"
          value={<div className="h-8 w-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700" />}
          className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-800 dark:to-slate-700"
        />
      </div>
      <PageCard className="mt-8">
        <div className="h-96 animate-pulse rounded-md bg-slate-100 dark:bg-slate-700" />
      </PageCard>
    </div>
  );

  const uniqueCategories = new Set(products.map(p => p.categoryId));

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handleEdit = (id: string) => {
    // Implement the edit logic here
  };

  const handleDelete = (id: string) => {
    // Implement the delete logic here
  };

  // Function to compute page numbers for pagination
  const getPageNumberForIndex = (idx: number, currentPage: number, totalPages: number) => {
    // For 5 or fewer pages, just show all pages in order
    if (totalPages <= 5) {
      return idx + 1;
    }
    
    // For more than 5 pages, implement a sliding window
    if (currentPage <= 3) {
      // Near start: show first 5 pages
      return idx + 1;
    } else if (currentPage >= totalPages - 2) {
      // Near end: show last 5 pages
      return totalPages - 4 + idx;
    } else {
      // In middle: show current page with 2 before and 2 after
      return currentPage - 2 + idx;
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <MapPinIcon className="h-7 w-7 text-green-500 mr-2" />
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            Inventario Maracaibo
          </h1>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/inventory/import"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-md text-sm font-medium transition-colors"
          >
            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
            Importar
          </Link>
          <Link
            href="/dashboard/inventory/export"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-md text-sm font-medium transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Exportar
          </Link>
          <Link
            href="/dashboard/inventory/new?location=maracaibo"
            className="inline-flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Añadir Producto
          </Link>
        </div>
      </div>

      {/* Destacar que estamos en la sede de Maracaibo */}
      <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center">
          <MapPinIcon className="h-5 w-5 text-green-600 dark:text-green-500 mr-2" />
          <p className="text-green-800 dark:text-green-400 text-sm font-medium">
            Estás viendo el inventario de la sede de Maracaibo. Aquí puedes gestionar los productos específicos de esta ubicación.
          </p>
        </div>
      </div>

      {loading ? (
        loadingDashboard
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Items"
              value={products.length}
              className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-700"
              icon={<CubeIcon className="h-5 w-5 text-blue-500" />}
            />
            <StatCard
              title="Valor Total"
              value={formatCurrency(totalInventoryValue)}
              className="bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-700"
              icon={<BanknotesIcon className="h-5 w-5 text-emerald-500" />}
            />
            <StatCard
              title="Categorías"
              value={uniqueCategories.size}
              className="bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-700"
              icon={<TagIcon className="h-5 w-5 text-purple-500" />}
            />
            <StatCard
              title="Ítems Baja Existencia"
              value={lowStockItems}
              className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-800 dark:to-slate-700"
              icon={<ArchiveBoxXMarkIcon className="h-5 w-5 text-amber-500" />}
            />
          </div>

          <PageCard className="mt-8">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div className="mb-4 md:mb-0 relative rounded-md shadow-sm max-w-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-700 dark:text-white dark:ring-slate-600 dark:focus:ring-blue-500"
                  placeholder="Buscar productos..."
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
                      onClick={() => handleSort('code')}
                    >
                      <div className="flex items-center">
                        Código
                        {renderSortIcon('code')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center">
                        Descripción
                        {renderSortIcon('description')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
                      onClick={() => handleSort('categoryId')}
                    >
                      <div className="flex items-center">
                        Categoría
                        {renderSortIcon('categoryId')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
                      onClick={() => handleSort('availableQty')}
                    >
                      <div className="flex items-center">
                        Existencia
                        {renderSortIcon('availableQty')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
                      onClick={() => handleSort('unitCost')}
                    >
                      <div className="flex items-center">
                        Costo
                        {renderSortIcon('unitCost')}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
                      onClick={() => handleSort('sellingPrice')}
                    >
                      <div className="flex items-center">
                        Precio
                        {renderSortIcon('sellingPrice')}
                      </div>
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {currentProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {product.code}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {product.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {getCategoryName(product.categoryId)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {product.availableQty}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(product.unitCost)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(product.sellingPrice)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                            <span className="sr-only">Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon className="h-5 w-5" />
                            <span className="sr-only">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No se encontraron productos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sortedProducts.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando <span className="font-medium">{indexOfFirstProduct + 1}</span> a{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastProduct, sortedProducts.length)}
                      </span>{' '}
                      de <span className="font-medium">{sortedProducts.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Primera</span>
                        <ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Anterior</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {/* Page number buttons */}
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        const pageNumber = getPageNumberForIndex(idx, currentPage, totalPages);
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              currentPage === pageNumber
                                ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                : 'text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Siguiente</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Última</span>
                        <ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </PageCard>
        </>
      )}
    </main>
  );
} 