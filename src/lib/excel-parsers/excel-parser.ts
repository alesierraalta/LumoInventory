import * as XLSX from 'xlsx';
import { HeaderMapping, ImportFileType, ImportResult, SheetData } from './types';

/**
 * Read an Excel file and convert it to JSON format
 */
export async function readExcelFile(file: File): Promise<XLSX.WorkBook> {
  try {
    // En lugar de usar FileReader, usamos la API de File directamente
    // que también funciona en el servidor Next.js
    console.log("[EXCEL PARSER] Leyendo archivo con arrayBuffer API");
    const arrayBuffer = await file.arrayBuffer();
    console.log("[EXCEL PARSER] Archivo leído correctamente, tamaño:", arrayBuffer.byteLength);
    
    const data = new Uint8Array(arrayBuffer);
    console.log("[EXCEL PARSER] Convirtiendo a Uint8Array");
    
    const workbook = XLSX.read(data, { type: 'array' });
    console.log("[EXCEL PARSER] Workbook creado correctamente, hojas:", workbook.SheetNames);
    
    return workbook;
  } catch (error) {
    console.error("[EXCEL PARSER] Error al leer el archivo Excel:", error);
    throw new Error(`Failed to read Excel file: ${(error as Error).message}`);
  }
}

/**
 * Extract data from worksheet
 */
export function extractSheetData(workbook: XLSX.WorkBook, sheetName?: string): SheetData {
  const sheet = sheetName 
    ? workbook.Sheets[sheetName] 
    : workbook.Sheets[workbook.SheetNames[0]];
    
  if (!sheet) {
    throw new Error(`Sheet ${sheetName || 'first sheet'} not found`);
  }
  
  // Convert to array of arrays (including headers)
  return XLSX.utils.sheet_to_json(sheet, { header: 1 });
}

/**
 * Detect headers from the sheet data
 */
export function detectHeaders(data: SheetData): string[] {
  if (data.length === 0) {
    return [];
  }
  
  const headers = data[0];
  return headers.map(h => String(h || '').trim());
}

/**
 * Auto-map headers based on known fields
 */
export function autoMapHeaders(
  headers: string[], 
  fileType: ImportFileType
): HeaderMapping {
  const mapping: HeaderMapping = {};
  const fieldPatterns: Record<string, RegExp[]> = {
    // Patterns for inventory fields
    code: [/^cod(e|igo)?$/i, /^item\s*id$/i, /^numero$/i],
    description: [/^desc(ripcion|ription)?$/i, /^nombre$/i, /^item\s*name$/i, /^producto$/i],
    unitCost: [/^(unit|costo)\s*cost(o)?$/i, /^precio\s*costo$/i, /^cost(e)?$/i],
    margin: [/^margen$/i, /^margin$/i, /^markup$/i],
    sellingPrice: [/^(precio|price)\s*(venta|sell|pvp)$/i, /^pvp$/i, /^venta$/i],
    grossProfit: [/^utilidad\s*bruta$/i, /^gross\s*profit$/i, /^ganancia$/i],
    netCost: [/^costo\s*neto$/i, /^net\s*cost$/i],
    availableQty: [/^cantidad$/i, /^qty$/i, /^stock$/i, /^inventory$/i, /^disponible$/i],
    category: [/^categoria$/i, /^category$/i, /^tipo$/i, /^type$/i],
    
    // Patterns for project fields
    quantity: [/^cantidad$/i, /^qty$/i, /^cant$/i],
    totalCost: [/^costo\s*total$/i, /^total\s*cost$/i],
    totalPrice: [/^precio\s*total$/i, /^total\s*price$/i, /^total\s*venta$/i],
    profit: [/^ganancia$/i, /^utilidad$/i, /^profit$/i],
    
    // Project metadata
    projectName: [/^proyecto$/i, /^project$/i, /^nombre\s*proyecto$/i],
    clientName: [/^cliente$/i, /^client$/i, /^customer$/i]
  };
  
  // Map headers based on patterns
  headers.forEach((header, index) => {
    for (const [field, patterns] of Object.entries(fieldPatterns)) {
      if (patterns.some(pattern => pattern.test(header))) {
        mapping[header] = field;
        break;
      }
    }
    
    // If no mapping found, use index as string
    if (!mapping[header]) {
      mapping[header] = `column${index}`;
    }
  });
  
  return mapping;
}

/**
 * Convert raw data to structured objects using header mapping
 */
export function mapDataWithHeaders<T>(
  data: SheetData, 
  headerMapping: HeaderMapping
): T[] {
  if (data.length <= 1) {
    return [];
  }
  
  const headers = data[0].map(h => String(h || '').trim());
  const rows = data.slice(1);
  
  return rows
    .filter(row => row.some(cell => cell !== null && cell !== ''))
    .map(row => {
      const item: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        const field = headerMapping[header] || header;
        const value = row[index];
        
        // Convert empty strings to null
        if (value === '') {
          item[field] = null;
        } 
        // Try to convert numeric strings to numbers
        else if (typeof value === 'string' && !isNaN(Number(value))) {
          item[field] = Number(value);
        } 
        else {
          item[field] = value;
        }
      });
      
      return item as T;
    });
}

/**
 * Process Excel file with automatic header detection and mapping
 */
export async function processExcelFile<T>(
  file: File, 
  fileType: ImportFileType,
  customHeaderMapping?: HeaderMapping
): Promise<ImportResult<T>> {
  try {
    console.log(`[EXCEL PARSER] Iniciando processExcelFile para archivo: ${file.name}, tamaño: ${file.size} bytes, tipo: ${fileType}`);
    
    const workbook = await readExcelFile(file);
    console.log(`[EXCEL PARSER] Workbook leído correctamente, hojas: ${workbook.SheetNames.join(', ')}`);
    
    const sheetData = extractSheetData(workbook);
    console.log(`[EXCEL PARSER] Datos extraídos de la hoja, filas: ${sheetData.length}`);
    
    const headers = detectHeaders(sheetData);
    console.log(`[EXCEL PARSER] Headers detectados: ${headers.join(', ')}`);
    
    if (headers.length === 0) {
      console.log('[EXCEL PARSER] No se encontraron headers en el archivo');
      return { 
        success: false, 
        errors: ['No headers found in the Excel file'] 
      };
    }
    
    const headerMapping = customHeaderMapping || autoMapHeaders(headers, fileType);
    console.log('[EXCEL PARSER] Mapeo de headers:', headerMapping);
    
    const mappedData = mapDataWithHeaders<T>(sheetData, headerMapping);
    console.log(`[EXCEL PARSER] Datos mapeados: ${mappedData.length} filas`);
    
    return {
      success: true,
      data: mappedData
    };
  } catch (error) {
    console.error('[EXCEL PARSER] Error en processExcelFile:', error);
    return {
      success: false,
      errors: [(error as Error).message]
    };
  }
} 