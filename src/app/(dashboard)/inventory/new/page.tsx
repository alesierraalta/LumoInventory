'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
}

export default function NewInventoryItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form data state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    categoryId: '',
    unitCost: 0,
    fixedCostPct: 2,
    sellingPrice: 0,
    distributorPrice: 0,
    distributorMargin: 0,
    intermediatePrice: 0,
    intermediateMargin: 0, 
    availableQty: 0,
    inTransitQty: 0,
    warehouseQty: 0,
    preSaleQty: 0,
    soldQty: 0,
    routeQty: 0,
    routePct: 0,
    isInvestmentRecovered: false,
    image: ''
  });
  
  // Calculated fields
  const fixedCost = (formData.unitCost * formData.fixedCostPct) / 100;
  const totalUnitCost = formData.unitCost + fixedCost;
  const margin = formData.sellingPrice > 0 
    ? ((formData.sellingPrice - totalUnitCost) / formData.sellingPrice) * 100 
    : 0;
  const grossProfit = formData.sellingPrice - totalUnitCost;
  
  // Update distributor and intermediate prices when unit cost changes
  useEffect(() => {
    if (formData.unitCost > 0) {
      const totalCost = formData.unitCost + (formData.unitCost * formData.fixedCostPct / 100);
      
      // Only update if user hasn't set them manually
      if (formData.distributorPrice === 0) {
        const newDistPrice = totalCost * 2; // Example markup
        setFormData(prev => ({ 
          ...prev, 
          distributorPrice: newDistPrice,
          distributorMargin: ((newDistPrice - totalCost) / newDistPrice) * 100
        }));
      }
      
      if (formData.intermediatePrice === 0) {
        const newIntPrice = formData.sellingPrice * 0.85; // 15% discount from final price
        setFormData(prev => ({ 
          ...prev, 
          intermediatePrice: newIntPrice,
          intermediateMargin: ((newIntPrice - totalCost) / newIntPrice) * 100
        }));
      }
    }
  }, [formData.unitCost, formData.sellingPrice, formData.fixedCostPct]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
        
        // Set default category if available
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Error al cargar las categorías');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code || !formData.description || !formData.categoryId) {
      toast.error('Por favor complete los campos requeridos');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format the data to include calculated fields
      const productData = {
        ...formData,
        fixedCost,
        totalUnitCost,
        margin,
        grossProfit
      };
      
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el producto');
      }
      
      toast.success('Producto añadido con éxito');
      router.push('/inventory');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error((error as Error).message || 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center text-2xl font-bold text-gray-800">
          <Link href="/inventory" className="mr-2 rounded-full p-1 hover:bg-gray-100">
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          Agregar Nuevo Producto
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Basic Information */}
          <div className="space-y-4 lg:col-span-3">
            <h2 className="text-xl font-semibold text-gray-800">Información Básica</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL de Imagen
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>
          </div>
          
          {/* Pricing Information */}
          <div className="space-y-4 lg:col-span-3">
            <h2 className="text-xl font-semibold text-gray-800">Información de Precios</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Costo Unitario (EXW) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="unitCost"
                  value={formData.unitCost}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  % Costo Fijo
                </label>
                <input
                  type="number"
                  name="fixedCostPct"
                  value={formData.fixedCostPct}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Costo Fijo Calculado
                </label>
                <div className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm">
                  {formatCurrency(fixedCost)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Costo Total (EXW + CF)
                </label>
                <div className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm">
                  {formatCurrency(totalUnitCost)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio Distribuidor
                </label>
                <input
                  type="number"
                  name="distributorPrice"
                  value={formData.distributorPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Margen Distribuidor (%)
                </label>
                <input
                  type="number"
                  name="distributorMargin"
                  value={formData.distributorMargin.toFixed(2)}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio Intermediario
                </label>
                <input
                  type="number"
                  name="intermediatePrice"
                  value={formData.intermediatePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Margen Intermediario (%)
                </label>
                <input
                  type="number"
                  name="intermediateMargin"
                  value={formData.intermediateMargin.toFixed(2)}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio Cliente Final <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Margen Cliente Final (%)
                </label>
                <div className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm">
                  {margin.toFixed(2)}%
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Utilidad Bruta
                </label>
                <div className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm">
                  {formatCurrency(grossProfit)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Inventory Information */}
          <div className="space-y-4 lg:col-span-3">
            <h2 className="text-xl font-semibold text-gray-800">Información de Inventario</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  En Tránsito
                </label>
                <input
                  type="number"
                  name="inTransitQty"
                  value={formData.inTransitQty}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  En Almacén
                </label>
                <input
                  type="number"
                  name="warehouseQty"
                  value={formData.warehouseQty}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pre-Venta
                </label>
                <input
                  type="number"
                  name="preSaleQty"
                  value={formData.preSaleQty}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vendidos
                </label>
                <input
                  type="number"
                  name="soldQty"
                  value={formData.soldQty}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Disponible
                </label>
                <input
                  type="number"
                  name="availableQty"
                  value={formData.availableQty}
                  onChange={handleChange}
                  min="0"
                  step="1" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  En Ruta
                </label>
                <input
                  type="number"
                  name="routeQty"
                  value={formData.routeQty}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  % En Ruta
                </label>
                <input
                  type="number"
                  name="routePct"
                  value={formData.routePct}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isInvestmentRecovered"
                  checked={formData.isInvestmentRecovered}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Inversión Recuperada
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Link
            href="/inventory"
            className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
} 