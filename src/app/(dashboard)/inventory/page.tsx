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
  ChevronDoubleRightIcon
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

export default function InventoryPage() {
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
        fetch('/api/inventory').then(res => res.json()),
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
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Inventory Management</h1>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/inventory/import"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-md text-sm font-medium transition-colors"
          >
            <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
            Import Inventory
          </Link>
          <Link
            href="/dashboard/inventory/export"
            className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-md text-sm font-medium transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export Inventory
          </Link>
          <Link
            href="/dashboard/inventory/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add New Item
          </Link>
        </div>
      </div>

      {/* Dashboard stats section */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-pulse">
          <StatCard
            title="Total Items"
            value="--"
            className="from-indigo-400 to-indigo-600 text-white"
          />
          <StatCard
            title="Total Value"
            value="--"
            className="from-emerald-400 to-emerald-500 text-white"
          />
          <StatCard
            title="Categories"
            value="--"
            className="from-slate-400 to-slate-600 text-white"
          />
          <StatCard
            title="Average Cost"
            value="--"
            className="from-indigo-300 to-indigo-500 text-white"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Items"
            value={products.length.toString()}
            className="from-indigo-400 to-indigo-600 text-white"
          />
          <StatCard
            title="Total Value"
            value={formatCurrency(totalInventoryValue)}
            className="from-emerald-400 to-emerald-500 text-white"
          />
          <StatCard
            title="Categories"
            value={uniqueCategories.size.toString()}
            className="from-slate-400 to-slate-600 text-white"
          />
          <StatCard
            title="Average Cost"
            value={formatCurrency(totalInventoryCost / products.length)}
            className="from-indigo-300 to-indigo-500 text-white"
          />
        </div>
      )}
      
      {/* Filters and search */}
      <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-slate-200 pl-10 text-sm focus:border-indigo-500 focus:ring-indigo-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto rounded-md border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
              <ArchiveBoxXMarkIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">No inventory items found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {searchTerm || categoryFilter
                ? "Try adjusting your search or filter criteria"
                : "Add some inventory items to get started"}
            </p>
            <Link
              href="/dashboard/inventory/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New Item
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th
                      scope="col"
                      className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('code')}
                    >
                      <div className="flex items-center">
                        Code
                        {renderSortIcon('code')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center">
                        Description
                        {renderSortIcon('description')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('categoryId')}
                    >
                      <div className="flex items-center">
                        Category
                        {renderSortIcon('categoryId')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('availableQty')}
                    >
                      <div className="flex items-center">
                        Quantity
                        {renderSortIcon('availableQty')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('unitCost')}
                    >
                      <div className="flex items-center">
                        Cost
                        {renderSortIcon('unitCost')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => handleSort('sellingPrice')}
                    >
                      <div className="flex items-center">
                        Price
                        {renderSortIcon('sellingPrice')}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Value
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                  {sortedProducts.map((product) => {
                    const inventoryValue = (product.availableQty || 0) * (product.sellingPrice || 0);
                    const isLowStock = (product.availableQty || 0) <= (product.minQuantity || 5);
                    
                    return (
                      <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-white">
                          {product.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          <div className="flex items-center">
                            <span className="truncate max-w-xs">{product.description}</span>
                            {product.description && (
                              <Tooltip content={product.description}>
                                <span className="ml-1 text-slate-400 cursor-help">ⓘ</span>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {getCategoryName(product.categoryId)}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isLowStock 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : 'text-slate-600 dark:text-slate-300'
                        }`}>
                          <div className="flex items-center">
                            {product.availableQty || 0}
                            {isLowStock && (
                              <Tooltip content="Bajo stock">
                                <span className="ml-1.5 text-amber-500">⚠️</span>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {formatCurrency(product.unitCost || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                          {formatCurrency(product.sellingPrice || 0)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-200">
                          {formatCurrency(product.availableQty * product.unitCost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(inventoryValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors font-medium">
                            Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3 sm:px-6 mt-4">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(sortedProducts.length / productsPerPage)))}
            disabled={currentPage === Math.ceil(sortedProducts.length / productsPerPage)}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Showing <span className="font-medium">{indexOfFirstProduct + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastProduct, sortedProducts.length)}
              </span>{" "}
              of <span className="font-medium">{sortedProducts.length}</span> items
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="sr-only">First</span>
                <ChevronDoubleLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, Math.ceil(sortedProducts.length / productsPerPage)) }).map((_, idx) => {
                const pageNumber = getPageNumberForIndex(idx, currentPage, Math.ceil(sortedProducts.length / productsPerPage));
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNumber
                        ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-500 dark:text-indigo-200"
                        : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
                    } transition-colors`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(sortedProducts.length / productsPerPage)))}
                disabled={currentPage === Math.ceil(sortedProducts.length / productsPerPage)}
                className="relative inline-flex items-center px-2 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => setCurrentPage(Math.ceil(sortedProducts.length / productsPerPage))}
                disabled={currentPage === Math.ceil(sortedProducts.length / productsPerPage)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="sr-only">Last</span>
                <ChevronDoubleRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
} 