import { NextRequest, NextResponse } from 'next/server';
import { parseInventoryFile } from '@/lib/excel-parsers/inventory-parser';
import { parseCatalogFile } from '@/lib/excel-parsers/catalog-parser';
import { parseProjectFile } from '@/lib/excel-parsers/project-parser';
import { ImportFileType } from '@/lib/excel-parsers/types';

// Función de logging para depuración
function logUpload(message: string, data?: any) {
  console.log(`[UPLOAD API] ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Data too complex to stringify:', typeof data);
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    logUpload('Iniciando procesamiento de carga de archivo');
    
    // Get formData from the request
    const formData = await request.formData();
    const fileData = formData.get('file') as File | null;
    const fileType = formData.get('type') as string | null;

    if (!fileData) {
      logUpload('Error: No se ha subido ningún archivo');
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    logUpload(`Archivo recibido: ${fileData.name}, tamaño: ${fileData.size} bytes, tipo: ${fileData.type}`);

    if (!fileType) {
      logUpload('Error: No se ha especificado el tipo de archivo');
      return NextResponse.json(
        { error: 'File type not specified' },
        { status: 400 }
      );
    }

    logUpload(`Tipo de importación: ${fileType}`);

    // Process file based on type
    let result;
    switch (fileType) {
      case ImportFileType.INVENTORY:
        logUpload('Procesando archivo de inventario');
        result = await parseInventoryFile(fileData);
        break;
      case 'catalog':
        logUpload('Procesando archivo de catálogo');
        result = await parseCatalogFile(fileData);
        break;
      case ImportFileType.PROJECTS:
        logUpload('Procesando archivo de proyecto');
        result = await parseProjectFile(fileData);
        break;
      default:
        logUpload(`Error: Tipo de archivo inválido: ${fileType}`);
        return NextResponse.json(
          { error: 'Invalid file type' },
          { status: 400 }
        );
    }

    if (!result.success || !result.data) {
      logUpload(`Error al procesar el archivo: ${result.errors?.join(', ')}`);
      return NextResponse.json(
        { 
          error: 'Failed to parse file', 
          details: result.errors 
        },
        { status: 400 }
      );
    }

    logUpload(`Archivo procesado exitosamente, obtenidos ${result.data.length} registros`);

    // Prepare response data
    const responseData = {
      type: fileType,
      items: result.data,
      // If it's a project, include the project metadata
      ...(fileType === ImportFileType.PROJECTS && {
        projectName: result.data[0].projectName,
        clientName: result.data[0].clientName,
        totalCost: result.data[0].totalCost,
        totalSellingPrice: result.data[0].totalSellingPrice,
        totalProfit: result.data[0].totalProfit
      })
    };
    
    logUpload('Enviando respuesta con datos procesados');
    
    // Return processed data
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error processing file upload:', error);
    logUpload(`Error inesperado: ${(error as Error).message}`);
    return NextResponse.json(
      { error: `Failed to process file: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 