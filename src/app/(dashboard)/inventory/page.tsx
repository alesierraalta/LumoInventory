'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  code: string;
  description: string;
  unitCost: number;
  sellingPrice: number;
  margin: number;
  availableQty: number;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // Build query params
        const params = new URLSearchParams();
        if (search) {
          params.append('search', search);
        }
        if (selectedCategory) {
          params.append('categoryId', selectedCategory);
        }
        
        // Fetch products
        const productsResponse = await fetch(`/api/inventory?${params.toString()}`);
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los datos de inventario');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [search, selectedCategory]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect dependency
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };
  
  // Calculate totals
  const totalInventoryValue = products.reduce(
    (total, product) => total + product.unitCost * product.availableQty, 
    0
  );
  
  const totalSellingValue = products.reduce(
    (total, product) => total + product.sellingPrice * product.availableQty,
    0
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
        <div>
          <Link
            href="/import"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="inline-block h-5 w-5 -mt-0.5 mr-1" />
            Agregar Productos
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Total Productos</h2>
          <p className="mt-2 text-3xl font-bold">{products.length}</p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Valor de Inventario</h2>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(totalInventoryValue)}</p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Valor de Venta</h2>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(totalSellingValue)}</p>
        </div>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <form onSubmit={handleSearch} className="flex w-full max-w-md items-center">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Buscar por código o descripción"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Buscar
            </button>
          </form>
          
          <div className="w-full sm:w-auto">
            <select
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-500">Cargando inventario...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Código
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Categoría
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Costo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Precio Venta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Margen
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {product.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.category.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(product.unitCost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatCurrency(product.sellingPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.margin.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.availableQty}
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