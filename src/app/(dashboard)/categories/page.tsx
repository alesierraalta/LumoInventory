'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon, MapPinIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { PageContainer, PageCard, StatCard } from '@/components/ui/page-container';
import { useSearchParams } from 'next/navigation';
import { Tooltip } from '@/components/ui/tooltip';

interface Category {
  id: string;
  name: string;
  description: string | null;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const locationParam = searchParams.get('location') || 'caracas';
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState('');
  const [location, setLocation] = useState(locationParam);

  // New states for CSV import
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Update location when URL params change
  useEffect(() => {
    setLocation(locationParam);
  }, [locationParam]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, [location]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories?location=${location}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setCurrentCategory({ name: '', description: '', location });
    setIsEditing(false);
    setFormError('');
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar la categoría');
      }

      toast.success('Categoría eliminada correctamente');
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Error al eliminar la categoría');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCategory?.name?.trim()) {
      setFormError('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      const url = isEditing ? `/api/categories/${currentCategory.id}` : '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentCategory.name,
          description: currentCategory.description || null,
          location: currentCategory.location || location
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Error al ${isEditing ? 'actualizar' : 'crear'} la categoría`);
      }

      toast.success(`Categoría ${isEditing ? 'actualizada' : 'creada'} correctamente`);
      setShowModal(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      setFormError(error.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la categoría`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLocationLabel = (loc: string) => {
    return loc.charAt(0).toUpperCase() + loc.slice(1);
  };

  const handleExportTemplate = () => {
    // Create CSV template content
    const csvContent = "name,description,location\nExample Category,Example Description,caracas\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `categories_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add this new function to handle CSV file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    setImportError('');
    
    // Preview the CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        // Ensure the CSV has the required columns
        if (!headers.includes('name') || !headers.includes('location')) {
          setImportError('El archivo CSV debe contener las columnas "name" y "location"');
          setImportPreview([]);
          return;
        }
        
        // Parse the preview data (up to 5 rows)
        const preview = rows.slice(1, 6).map(row => {
          const values = row.split(',');
          const item: any = {};
          
          headers.forEach((header, index) => {
            item[header.trim()] = values[index]?.trim() || '';
          });
          
          return item;
        }).filter(item => item.name); // Filter out empty rows
        
        setImportPreview(preview);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setImportError('Error al analizar el archivo CSV. Asegúrate de que el formato sea correcto.');
        setImportPreview([]);
      }
    };
    
    reader.readAsText(file);
  };
  
  // Add this new function to handle CSV import
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      setImportError('Por favor selecciona un archivo CSV');
      return;
    }
    
    setIsImporting(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          const rows = text.split('\n');
          const headers = rows[0].split(',');
          
          // Map indices for required columns
          const nameIndex = headers.indexOf('name');
          const descIndex = headers.indexOf('description');
          const locIndex = headers.indexOf('location');
          
          if (nameIndex === -1 || locIndex === -1) {
            setImportError('El archivo CSV debe contener las columnas "name" y "location"');
            setIsImporting(false);
            return;
          }
          
          // Parse data and create categories
          const categories = rows.slice(1)
            .filter(row => row.trim()) // Skip empty rows
            .map(row => {
              const values = row.split(',');
              return {
                name: values[nameIndex].trim(),
                description: descIndex > -1 ? values[descIndex].trim() : '',
                location: values[locIndex].trim() || location
              };
            })
            .filter(cat => cat.name); // Skip rows without a name
          
          // Import categories in sequence
          let successCount = 0;
          let errorCount = 0;
          
          for (const category of categories) {
            try {
              const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(category)
              });
              
              if (response.ok) {
                successCount++;
              } else {
                errorCount++;
              }
            } catch (error) {
              errorCount++;
            }
          }
          
          // Close modal and refresh data
          setShowImportModal(false);
          setCsvFile(null);
          setImportPreview([]);
          fetchCategories();
          
          // Show result notification
          toast.success(`Importación completada: ${successCount} categorías importadas, ${errorCount} errores`);
        } catch (error) {
          console.error('Error during import:', error);
          setImportError('Error durante la importación. Por favor revisa el formato del archivo.');
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.readAsText(csvFile);
    } catch (error) {
      console.error('Error reading file:', error);
      setImportError('Error al leer el archivo CSV');
      setIsImporting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
            Categorías - {getLocationLabel(location)}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestión de categorías para la ubicación {getLocationLabel(location)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Tooltip content="Descargar plantilla CSV para importación">
            <button
              onClick={handleExportTemplate}
              className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Plantilla
            </button>
          </Tooltip>
          <Tooltip content="Importar categorías desde archivo CSV">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Importar
            </button>
          </Tooltip>
          <button
            onClick={handleAddNew}
            className="mt-4 md:mt-0 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Add a tooltip to the location selector */}
      <div className="mb-6 max-w-xs">
        <label htmlFor="location-selector" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Ubicación
        </label>
        <div className="relative">
          <Tooltip content="Selecciona la ubicación para ver y administrar categorías específicas">
            <select
              id="location-selector"
              value={location}
              onChange={(e) => {
                // Update the URL with the new location
                const params = new URLSearchParams(window.location.search);
                params.set('location', e.target.value);
                window.location.search = params.toString();
              }}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="caracas">Caracas</option>
              <option value="valencia">Valencia</option>
            </select>
          </Tooltip>
        </div>
      </div>

      {/* Stats Card */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8 animate-pulse">
          <StatCard
            title="Total Categorías"
            value="--"
            className="from-indigo-400 to-indigo-600 text-white"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatCard
            title={`Categorías en ${getLocationLabel(location)}`}
            value={categories.length.toString()}
            className="from-indigo-400 to-indigo-600 text-white"
          />
        </div>
      )}

      <PageCard>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center space-y-4">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
              <TagIcon className="h-8 w-8 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No hay categorías definidas para {getLocationLabel(location)}
            </p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Crear primera categoría
            </button>
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
                    Descripción
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Ubicación
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Fecha Creación
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-800 dark:text-white">
                      <Tooltip content={category.name}>
                        {category.name}
                      </Tooltip>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {category.description ? (
                        <Tooltip content={category.description}>
                          <span className="line-clamp-2">{category.description}</span>
                        </Tooltip>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {getLocationLabel(category.location)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatDate(category.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="mr-3 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                      >
                        <Tooltip content="Editar categoría">
                          <PencilIcon className="h-5 w-5" />
                        </Tooltip>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Tooltip content="Eliminar categoría">
                          <TrashIcon className="h-5 w-5" />
                        </Tooltip>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle dark:bg-slate-800">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-slate-800">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-indigo-900">
                      <TagIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">
                        {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        {formError && (
                          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                            <div className="flex">
                              <div className="ml-3">
                                <p className="text-sm text-red-700 dark:text-red-400">{formError}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Nombre
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={currentCategory?.name || ''}
                              onChange={(e) =>
                                setCurrentCategory({ ...currentCategory, name: e.target.value })
                              }
                              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                              placeholder="Nombre de la categoría"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Descripción (opcional)
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="description"
                              name="description"
                              rows={3}
                              value={currentCategory?.description || ''}
                              onChange={(e) =>
                                setCurrentCategory({ ...currentCategory, description: e.target.value })
                              }
                              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                              placeholder="Descripción de la categoría"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Ubicación
                          </label>
                          <div className="mt-1">
                            <select
                              id="location"
                              name="location"
                              value={currentCategory?.location || location}
                              onChange={(e) =>
                                setCurrentCategory({ ...currentCategory, location: e.target.value })
                              }
                              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            >
                              <option value="caracas">Caracas</option>
                              <option value="valencia">Valencia</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-slate-800">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditing ? 'Guardar Cambios' : 'Crear Categoría'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle dark:bg-slate-800">
              <form onSubmit={handleImportSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 dark:bg-slate-800">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-indigo-900">
                      <ArrowDownTrayIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white">
                        Importar Categorías desde CSV
                      </h3>
                      <div className="mt-4 space-y-4">
                        {importError && (
                          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                            <div className="flex">
                              <div className="ml-3">
                                <p className="text-sm text-red-700 dark:text-red-400">{importError}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <div>
                          <label htmlFor="csv-file" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Archivo CSV
                            <Tooltip content="El archivo debe tener columnas para name, description (opcional) y location">
                              <span className="ml-1 cursor-help">ℹ️</span>
                            </Tooltip>
                          </label>
                          <div className="mt-1">
                            <input
                              type="file"
                              id="csv-file"
                              accept=".csv"
                              onChange={handleFileChange}
                              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 dark:text-slate-400 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                            />
                          </div>
                        </div>

                        {importPreview.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Vista previa (primeras 5 filas)
                            </h4>
                            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-md dark:border-slate-700">
                              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                  <tr>
                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      Nombre
                                    </th>
                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      Descripción
                                    </th>
                                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                      Ubicación
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700">
                                  {importPreview.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                      <td className="px-3 py-2 text-xs text-slate-800 dark:text-white">
                                        {item.name}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-slate-800 dark:text-white">
                                        {item.description || '-'}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-slate-800 dark:text-white">
                                        {item.location || location}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-slate-800">
                  <button
                    type="submit"
                    disabled={!csvFile || isImporting}
                    className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                      !csvFile || isImporting 
                        ? 'bg-indigo-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                    }`}
                  >
                    {isImporting ? 'Importando...' : 'Importar Categorías'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                    onClick={() => {
                      setShowImportModal(false);
                      setCsvFile(null);
                      setImportPreview([]);
                      setImportError('');
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 