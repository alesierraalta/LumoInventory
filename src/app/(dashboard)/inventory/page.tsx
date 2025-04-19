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
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Tooltip } from '@/components/ui/tooltip'; 
import { PageContainer, PageCard, StatCard } from '@/components/ui/page-container';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

// Enhanced Product type with additional fields for Caracas inventory
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
  // New fields for enhanced inventory tracking
  inTransitQty: number;
  warehouseQty: number;
  preSaleQty: number;
  soldQty: number;
  availableWarehouseQty: number;
  availableRouteQty: number;
  availableRoutePercentage: number;
  costEXW: number;
  fixedCost: number;
  unitCostWithFixedCost: number;
  distributorPrice: number;
  distributorMargin: number;
  intermediaryPrice: number;
  intermediaryMargin: number;
  finalCustomerPrice: number;
  finalCustomerMargin: number;
  totalMaxRevenue: number;
  totalActualRevenue: number;
  grossAccumulatedProfit: number;
  actualAccumulatedProfit: number;
  grossProfitOnSales: number;
  netProfitOnSales: number;
  grossMarginOnSales: number;
  actualMarginOnSales: number;
  investmentRecovered: boolean;
  totalInitialCost: number;
  currentInventoryCost: number;
  grossRecoveredInvestment: number;
  accumulatedFixedCost: number;
  totalInventoryCost: number;
  netRecoveredInvestment: number;
  grossCostOfSold: number;
  netCostOfSold: number;
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

  // New state for column visibility (for responsive toggling)
  const [visibleColumns, setVisibleColumns] = useState({
    basic: true,        // Code, Category, Description
    quantities: true,   // Available, Transit, Warehouse, etc.
    costs: false,       // Cost breakdown columns
    pricing: false,     // Pricing and margin columns
    performance: false  // Revenue and profit metrics
  });

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

  const uniqueCategories = new Set(products.map(p => p.categoryId));

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const handleEdit = (id: string) => {
    // Implementar lógica de edición aquí
  };

  const handleDelete = (id: string) => {
    // Implementar lógica de eliminación aquí
  };

  // Función para calcular los números de página para la paginación
  const getPageNumberForIndex = (idx: number, currentPage: number, totalPages: number) => {
    // Para 5 o menos páginas, simplemente mostrar todas las páginas en orden
    if (totalPages <= 5) {
      return idx + 1;
    }
    
    // Para más de 5 páginas, implementar una ventana deslizante
    if (currentPage <= 3) {
      // Cerca del inicio: mostrar las primeras 5 páginas
      return idx + 1;
    } else if (currentPage >= totalPages - 2) {
      // Cerca del final: mostrar las últimas 5 páginas
      return totalPages - 4 + idx;
    } else {
      // En el medio: mostrar la página actual con 2 antes y 2 después
      return currentPage - 2 + idx;
    }
  };

  // Add new function to toggle column visibility
  const toggleColumnVisibility = (columnGroup: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnGroup]: !prev[columnGroup as keyof typeof prev]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-900 text-white">
        <div className="w-12 h-12 border-t-2 border-b-2 border-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-300">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        {/* Header and action buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
            <p className="mt-1 text-gray-400">
              Manage all your inventory items across different locations
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <Link
              href="/dashboard/inventory/import"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors duration-200"
            >
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Import Inventory
            </Link>
            <Link
              href="/dashboard/inventory/export"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors duration-200"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Inventory
            </Link>
            <Link
              href="/dashboard/inventory/new"
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Item
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-5 shadow-lg">
            <h3 className="text-sm font-medium text-indigo-100">Total Items</h3>
            <p className="text-3xl font-bold text-white">{products.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg p-5 shadow-lg">
            <h3 className="text-sm font-medium text-emerald-100">Total Value</h3>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalInventoryValue)}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg p-5 shadow-lg">
            <h3 className="text-sm font-medium text-gray-100">Categories</h3>
            <p className="text-3xl font-bold text-white">{uniqueCategories.size}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg p-5 shadow-lg">
            <h3 className="text-sm font-medium text-blue-100">Average Cost</h3>
            <p className="text-3xl font-bold text-white">
              {products.length > 0 ? formatCurrency(totalInventoryCost / products.length) : formatCurrency(0)}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg bg-gray-800 border-gray-700 pl-10 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block rounded-lg bg-gray-800 border-gray-700 py-2 pl-3 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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

        {/* Column visibility toggles - new */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => toggleColumnVisibility('basic')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              visibleColumns.basic 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Info Básica
          </button>
          <button
            onClick={() => toggleColumnVisibility('quantities')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              visibleColumns.quantities 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Cantidades
          </button>
          <button
            onClick={() => toggleColumnVisibility('costs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              visibleColumns.costs 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Costos
          </button>
          <button
            onClick={() => toggleColumnVisibility('pricing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              visibleColumns.pricing 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Precios y Márgenes
          </button>
          <button
            onClick={() => toggleColumnVisibility('performance')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md ${
              visibleColumns.performance 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Métricas de Rendimiento
          </button>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto shadow-sm rounded-lg mb-6">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  {/* Basic info columns - always visible */}
                  <th
                    scope="col"
                    className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center">
                      Código
                      {renderSortIcon('code')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('categoryId')}
                  >
                    <div className="flex items-center">
                      Categoría
                      {renderSortIcon('categoryId')}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      Descripción
                      {renderSortIcon('description')}
                    </div>
                  </th>
                  
                  {/* Quantity columns */}
                  {visibleColumns.quantities && (
                    <>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('availableQty')}
                      >
                        <div className="flex items-center">
                          CANT
                          {renderSortIcon('availableQty')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('inTransitQty')}
                      >
                        <div className="flex items-center">
                          EN TRÁNSITO
                          {renderSortIcon('inTransitQty')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('warehouseQty')}
                      >
                        <div className="flex items-center">
                          EN ALMACÉN
                          {renderSortIcon('warehouseQty')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('preSaleQty')}
                      >
                        <div className="flex items-center">
                          PRE VENTA
                          {renderSortIcon('preSaleQty')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('soldQty')}
                      >
                        <div className="flex items-center">
                          VENTA
                          {renderSortIcon('soldQty')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('availableWarehouseQty')}
                      >
                        <div className="flex items-center">
                          DISP. ALMACÉN
                          {renderSortIcon('availableWarehouseQty')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('availableRouteQty')}
                      >
                        <div className="flex items-center">
                          DISP. EN RUTA
                          {renderSortIcon('availableRouteQty')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('availableRoutePercentage')}
                      >
                        <div className="flex items-center">
                          % DISP. RUTA
                          {renderSortIcon('availableRoutePercentage')}
                        </div>
                      </th>
                    </>
                  )}
                  
                  {/* Cost columns */}
                  {visibleColumns.costs && (
                    <>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('costEXW')}
                      >
                        <div className="flex items-center">
                          Costo EXW
                          {renderSortIcon('costEXW')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('fixedCost')}
                      >
                        <div className="flex items-center">
                          Costo Fijo - CF
                          {renderSortIcon('fixedCost')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('unitCostWithFixedCost')}
                      >
                        <div className="flex items-center">
                          Costo Unitario EXW+CF
                          {renderSortIcon('unitCostWithFixedCost')}
                        </div>
                      </th>
                    </>
                  )}
                  
                  {/* Pricing and margin columns */}
                  {visibleColumns.pricing && (
                    <>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('distributorPrice')}
                      >
                        <div className="flex items-center">
                          PVP Distribuidor
                          {renderSortIcon('distributorPrice')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('distributorMargin')}
                      >
                        <div className="flex items-center">
                          Margen Distribuidor
                          {renderSortIcon('distributorMargin')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('intermediaryPrice')}
                      >
                        <div className="flex items-center">
                          PVP Intermediario
                          {renderSortIcon('intermediaryPrice')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('intermediaryMargin')}
                      >
                        <div className="flex items-center">
                          Margen Intermediario
                          {renderSortIcon('intermediaryMargin')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('finalCustomerPrice')}
                      >
                        <div className="flex items-center">
                          PVP Cliente Final
                          {renderSortIcon('finalCustomerPrice')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('finalCustomerMargin')}
                      >
                        <div className="flex items-center">
                          Margen Cliente Final
                          {renderSortIcon('finalCustomerMargin')}
                        </div>
                      </th>
                    </>
                  )}
                  
                  {/* Performance metrics columns */}
                  {visibleColumns.performance && (
                    <>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('totalMaxRevenue')}
                      >
                        <div className="flex items-center">
                          Total Ingresos Máximo
                          {renderSortIcon('totalMaxRevenue')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('totalActualRevenue')}
                      >
                        <div className="flex items-center">
                          Total Ingresos Reales
                          {renderSortIcon('totalActualRevenue')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('grossMarginOnSales')}
                      >
                        <div className="flex items-center">
                          Margen Bruto
                          {renderSortIcon('grossMarginOnSales')}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="group px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-300 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort('investmentRecovered')}
                      >
                        <div className="flex items-center">
                          Inversión Recuperada
                          {renderSortIcon('investmentRecovered')}
                        </div>
                      </th>
                    </>
                  )}
                  
                  <th scope="col" className="relative px-6 py-3.5">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-800">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => {
                    const isLowStock = (product.availableQty || 0) <= (product.minQuantity || 5);
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-700 transition-colors duration-150">
                        {/* Basic info columns - always visible */}
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{product.code}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm">
                          <span className={`px-2.5 py-0.5 text-xs rounded-full ${
                            product.category?.name === 'ARQUITECTÓNICO' ? 'bg-indigo-900 text-indigo-200' :
                            product.category?.name === 'INDUSTRIAL' ? 'bg-blue-900 text-blue-200' :
                            'bg-gray-700 text-gray-200'
                          }`}>
                            {getCategoryName(product.categoryId)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">
                          <div className="flex items-center">
                            <span className="truncate max-w-xs">{product.description}</span>
                            {product.description && (
                              <Tooltip 
                                content={product.description}
                                showArrow={true}
                                contentClassName="bg-gray-900 text-gray-100 max-w-md"
                                delay={200}
                              >
                                <span className="ml-1 text-gray-400 cursor-help">ⓘ</span>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        
                        {/* Quantity columns */}
                        {visibleColumns.quantities && (
                          <>
                            <td className={`whitespace-nowrap px-3 py-3 text-sm font-medium ${
                              isLowStock 
                                ? 'text-amber-400' 
                                : 'text-gray-300'
                            }`}>
                              <div className="flex items-center">
                                {product.availableQty || 0}
                                {isLowStock && (
                                  <Tooltip 
                                    content={`Stock bajo (${product.availableQty} disponibles, mínimo ${product.minQuantity || 5})`}
                                    position="top"
                                    showArrow={true}
                                    contentClassName="bg-amber-900 text-amber-100 border border-amber-700"
                                    delay={100}
                                  >
                                    <span className="ml-1.5 text-amber-500">⚠️</span>
                                  </Tooltip>
                                )}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.inTransitQty || 0}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.warehouseQty || 0}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.preSaleQty || 0}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.soldQty || 0}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.availableWarehouseQty || 0}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.availableRouteQty || 0}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.availableRoutePercentage || 0}%</td>
                          </>
                        )}
                        
                        {/* Cost columns */}
                        {visibleColumns.costs && (
                          <>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{formatCurrency(product.costEXW || 0)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{formatCurrency(product.fixedCost || 0)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{formatCurrency(product.unitCostWithFixedCost || 0)}</td>
                          </>
                        )}
                        
                        {/* Pricing and margin columns */}
                        {visibleColumns.pricing && (
                          <>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{formatCurrency(product.distributorPrice || 0)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.distributorMargin || 0}%</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{formatCurrency(product.intermediaryPrice || 0)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.intermediaryMargin || 0}%</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{formatCurrency(product.finalCustomerPrice || 0)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.finalCustomerMargin || 0}%</td>
                          </>
                        )}
                        
                        {/* Performance metrics columns */}
                        {visibleColumns.performance && (
                          <>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{formatCurrency(product.totalMaxRevenue || 0)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{formatCurrency(product.totalActualRevenue || 0)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">{product.grossMarginOnSales || 0}%</td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-gray-300">
                              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                product.investmentRecovered 
                                  ? 'bg-green-900 text-green-200' 
                                  : 'bg-red-900 text-red-200'
                              }`}>
                                {product.investmentRecovered ? 'SI' : 'NO'}
                              </span>
                            </td>
                          </>
                        )}
                        
                        <td className="whitespace-nowrap px-3 py-3 text-sm font-medium">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(product.id)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={30} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="font-medium">No inventory items found</p>
                        <p className="mt-1">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        {sortedProducts.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Showing {Math.min(indexOfFirstProduct + 1, sortedProducts.length)} to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastProduct, sortedProducts.length)}
              </span>{" "}
              of <span className="font-medium">{sortedProducts.length}</span> items
            </p>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                <ChevronDoubleLeftIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = getPageNumberForIndex(i, currentPage, totalPages);
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNumber
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-800'}`}
              >
                <ChevronDoubleRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 