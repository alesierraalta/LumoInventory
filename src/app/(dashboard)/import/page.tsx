'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowDownTrayIcon, DocumentTextIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { ImportFileType } from '@/lib/excel-parsers/types';

interface ImportStats {
  created: number;
  updated: number;
  failed: number;
  errors?: string[];
}

export default function ImportPage() {
  const [selectedFileType, setSelectedFileType] = useState<ImportFileType>(ImportFileType.INVENTORY);
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
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedFileType);
      
      // Upload file for processing
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al procesar el archivo');
      }
      
      const data = await response.json();
      
      if (data.items && data.type) {
        // Send the processed data to the import API
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
          throw new Error(error.message || 'Error al importar los datos');
        }
        
        const importResult = await importResponse.json();
        setImportStats(importResult);
        
        // Show success message
        toast.success(`Importación completada: ${importResult.created} creados, ${importResult.updated} actualizados`);
      } else {
        throw new Error('El archivo no contiene datos válidos');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error(`Error: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Importar Datos</h1>
      
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Tipo de Importación</label>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              className={`flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium ${
                selectedFileType === ImportFileType.INVENTORY
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFileType(ImportFileType.INVENTORY)}
            >
              Inventario Completo
            </button>
            
            <button
              type="button"
              className={`flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium ${
                selectedFileType === ImportFileType.CATALOG
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFileType(ImportFileType.CATALOG)}
            >
              Catálogo por Categoría
            </button>
            
            <button
              type="button"
              className={`flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium ${
                selectedFileType === ImportFileType.PROJECT
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFileType(ImportFileType.PROJECT)}
            >
              Proyecto
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Archivo Excel</label>
          <div
            {...getRootProps()}
            className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-6 ${
              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            <ArrowDownTrayIcon className="h-8 w-8 text-gray-400" />
            {file ? (
              <div className="mt-2 flex items-center">
                <DocumentTextIcon className="mr-2 h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">{file.name}</span>
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm font-medium text-gray-900">
                  Arrastra y suelta o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500">Formatos soportados: XLSX, XLS</p>
              </>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            type="button"
            disabled={!file || isProcessing}
            className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm ${
              !file || isProcessing
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
            onClick={processFile}
          >
            {isProcessing ? 'Procesando...' : 'Procesar Archivo'}
          </button>
        </div>
      </div>
      
      {importStats && (
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">Resultados de la Importación</h2>
          
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <h3 className="ml-2 text-sm font-medium text-green-800">Registros Creados</h3>
              </div>
              <div className="mt-2 text-sm text-green-700">
                <p className="text-2xl font-bold">{importStats.created}</p>
              </div>
            </div>
            
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                <h3 className="ml-2 text-sm font-medium text-blue-800">Registros Actualizados</h3>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                <p className="text-2xl font-bold">{importStats.updated}</p>
              </div>
            </div>
            
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <XCircleIcon className="h-5 w-5 text-red-400" />
                <h3 className="ml-2 text-sm font-medium text-red-800">Registros con Error</h3>
              </div>
              <div className="mt-2 text-sm text-red-700">
                <p className="text-2xl font-bold">{importStats.failed}</p>
              </div>
            </div>
          </div>
          
          {importStats.errors && importStats.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">Errores</h3>
              <div className="mt-2 max-h-40 overflow-y-auto rounded-md bg-gray-50 p-2">
                <ul className="list-inside list-disc space-y-1">
                  {importStats.errors.map((error, index) => (
                    <li key={index} className="text-xs text-red-600">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 