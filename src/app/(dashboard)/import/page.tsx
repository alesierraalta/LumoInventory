'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowDownTrayIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { ImportFileType } from '@/lib/excel-parsers/types';
import { PageContainer, PageCard, StatCard } from '@/components/ui/page-container';

interface ImportStats {
  created: number;
  updated: number;
  failed: number;
  errors?: string[];
}

// Función de logging para depuración en el cliente
function logImportClient(message: string, data?: any) {
  console.log(`[IMPORT CLIENT] ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Data too complex to stringify:', typeof data);
    }
  }
}

// Define catalog y project para evitar errores de lint
const CATALOG_TYPE = 'catalog';
const PROJECT_TYPE = 'projects';

export default function ImportPage() {
  const [selectedFileType, setSelectedFileType] = useState<string>(ImportFileType.INVENTORY);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  
  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    // Validate file extension
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }
    
    setFile(file);
    setImportStats(null);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });
  
  // Process file
  const processFile = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo para importar');
      return;
    }
    
    try {
      setIsProcessing(true);
      logImportClient(`Iniciando procesamiento de archivo: ${file.name}, tamaño: ${file.size} bytes, tipo: ${selectedFileType}`);
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedFileType);
      
      logImportClient('Enviando archivo al servidor para procesamiento');
      
      // Upload file for processing
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        logImportClient('Error en respuesta del servidor:', error);
        throw new Error(error.message || 'Error al procesar el archivo');
      }
      
      const data = await response.json();
      logImportClient('Respuesta del servidor de upload:', data);
      
      if (data.items && data.type) {
        // Send the processed data to the import API
        logImportClient(`Enviando ${data.items.length} items para importación`);
        
        const importResponse = await fetch('/api/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: data.type,
            items: data.items,
            projectName: data.projectName,
            clientName: data.clientName,
            totalCost: data.totalCost,
            totalSellingPrice: data.totalSellingPrice,
            totalProfit: data.totalProfit
          })
        });
        
        if (!importResponse.ok) {
          const error = await importResponse.json();
          logImportClient('Error en respuesta de importación:', error);
          throw new Error(error.message || 'Error al importar los datos');
        }
        
        const importResult = await importResponse.json();
        logImportClient('Resultado de importación:', importResult);
        setImportStats(importResult);
        
        // Show success message
        toast.success(`Importación completada: ${importResult.created} creados, ${importResult.updated} actualizados`);
      } else {
        logImportClient('Error: El archivo no contiene datos válidos', data);
        throw new Error('El archivo no contiene datos válidos');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      logImportClient(`Error de importación: ${(error as Error).message}`);
      toast.error(`Error: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Importar Datos</h1>
      </div>
      
      <PageCard>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo de Importación</label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              className={`flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                selectedFileType === ImportFileType.INVENTORY
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
              onClick={() => setSelectedFileType(ImportFileType.INVENTORY)}
            >
              Inventario Completo
            </button>
            
            <button
              type="button"
              className={`flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                selectedFileType === CATALOG_TYPE
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
              onClick={() => setSelectedFileType(CATALOG_TYPE)}
            >
              Catálogo por Categoría
            </button>
            
            <button
              type="button"
              className={`flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                selectedFileType === ImportFileType.PROJECTS
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
              onClick={() => setSelectedFileType(ImportFileType.PROJECTS)}
            >
              Proyecto
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Archivo Excel</label>
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 transition-colors ${
              isDragActive 
                ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/20' 
                : 'border-slate-300 hover:border-indigo-400 dark:border-slate-600 dark:hover:border-indigo-500'
            }`}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" />
            {file ? (
              <div className="mt-2 flex items-center">
                <DocumentTextIcon className="mr-2 h-5 w-5 text-indigo-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</span>
              </div>
            ) : (
              <>
                <p className="mt-2 text-base font-medium text-slate-700 dark:text-slate-300">
                  Arrastra y suelta o haz clic para seleccionar
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Formatos soportados: XLSX, XLS
                </p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            type="button"
            disabled={!file || isProcessing}
            className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${
              !file || isProcessing
                ? 'bg-indigo-300 cursor-not-allowed dark:bg-indigo-800 dark:text-indigo-200'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-600'
            }`}
            onClick={processFile}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                Procesar Archivo
              </>
            )}
          </button>
        </div>
      </PageCard>
      
      {importStats && (
        <PageCard className="mt-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Resultados de la Importación</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
                <h3 className="ml-2 text-sm font-medium text-green-800 dark:text-green-400">Registros Creados</h3>
              </div>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p className="text-2xl font-bold">{importStats.created}</p>
              </div>
            </div>
            
            <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <h3 className="ml-2 text-sm font-medium text-blue-800 dark:text-blue-400">Registros Actualizados</h3>
              </div>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p className="text-2xl font-bold">{importStats.updated}</p>
              </div>
            </div>
            
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <XCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                <h3 className="ml-2 text-sm font-medium text-red-800 dark:text-red-400">Registros Fallidos</h3>
              </div>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p className="text-2xl font-bold">{importStats.failed}</p>
              </div>
            </div>
          </div>
          
          {importStats.errors && importStats.errors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Errores Encontrados</h3>
              <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                <ul className="list-disc pl-5 space-y-1">
                  {importStats.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-300">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </PageCard>
      )}
    </main>
  );
} 