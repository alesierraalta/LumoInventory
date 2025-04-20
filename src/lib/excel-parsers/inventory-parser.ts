import { InventoryItem, HeaderMapping, ImportResult, ImportFileType } from './types';
import { processExcelFile } from './excel-parser';
import * as XLSX from 'xlsx';
import { extractSheetData } from './excel-parser';

// Función de logging para depuración
function logImport(message: string, data?: any) {
  console.log(`[INVENTORY PARSER] ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Data too complex to stringify:', data);
    }
  }
}

/**
 * Validate inventory data
 */
function validateInventoryData(items: InventoryItem[]): string[] {
  logImport(`Validando ${items.length} items de inventario`);
  const errors: string[] = [];
  
  // Check for required fields
  items.forEach((item, index) => {
    if (!item.code) {
      const error = `Row ${index + 1}: Missing product code`;
      errors.push(error);
      logImport(error);
    }
    
    if (!item.description) {
      const error = `Row ${index + 1}: Missing product description`;
      errors.push(error);
      logImport(error);
    }
    
    if (typeof item.unitCost !== 'number' || isNaN(item.unitCost)) {
      const error = `Row ${index + 1}: Invalid unit cost`;
      errors.push(error);
      logImport(error);
    }
    
    if (typeof item.sellingPrice !== 'number' || isNaN(item.sellingPrice)) {
      const error = `Row ${index + 1}: Invalid selling price`;
      errors.push(error);
      logImport(error);
    }
    
    if (!item.category) {
      const error = `Row ${index + 1}: Missing category`;
      errors.push(error);
      logImport(error);
    }
  });
  
  logImport(`Validación completada con ${errors.length} errores`);
  return errors;
}

// Mapeo de encabezados para el formato de inventario
const INVENTORY_HEADER_MAPPING: HeaderMapping = {
  'SKU': 'code',
  'Código': 'code',
  'Descripción': 'description',
  'Descripcion': 'description',
  'Categoría': 'category',
  'Categoria': 'category',
  'Costo Unitario': 'unitCost',
  'Costo unitario': 'unitCost',
  'Costo': 'unitCost',
  '% Costo Fijo': 'fixedCostPct',
  'Costo Fijo': 'fixedCost',
  'Costo Unitario Total': 'totalUnitCost',
  'Precio de Venta': 'sellingPrice',
  'Precio venta': 'sellingPrice',
  'PVP': 'sellingPrice',
  'Margen': 'margin',
  'Cantidad': 'availableQty',
  'Stock': 'availableQty',
  'Inventario': 'availableQty'
};

/**
 * Detect file format based on headers
 */
export const detectFormat = (worksheet: XLSX.WorkSheet): ImportFileType => {
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];
  if (data.length === 0) return ImportFileType.CUSTOM;
  
  const headers = data[0] as string[];
  const hasInventoryHeaders = headers.some(h => INVENTORY_HEADER_MAPPING[h]);
  
  return hasInventoryHeaders ? ImportFileType.INVENTORY : ImportFileType.CUSTOM;
};

/**
 * Process and normalize inventory data
 */
function processInventoryData(items: any[]): InventoryItem[] {
  logImport(`Procesando ${items.length} items de inventario`);
  const processedItems = items.map((item, index) => {
    logImport(`Procesando item ${index + 1}`);
    
    // Calculate missing values if possible
    const unitCost = Number(item.unitCost) || 0;
    const sellingPrice = Number(item.sellingPrice) || 0;
    const fixedCostPct = Number(item.fixedCostPct) || 2;
    const fixedCost = item.fixedCost !== undefined ? Number(item.fixedCost) : (unitCost * (fixedCostPct / 100));
    const totalUnitCost = item.totalUnitCost !== undefined ? Number(item.totalUnitCost) : (unitCost + fixedCost);
    const margin = item.margin !== undefined ? Number(item.margin) : 
      (sellingPrice > 0 ? ((sellingPrice - totalUnitCost) / sellingPrice) * 100 : 0);
    const grossProfit = item.grossProfit !== undefined ? Number(item.grossProfit) : 
      (sellingPrice - totalUnitCost);
    
    // Log original data
    logImport(`Item original:`, {
      code: item.code,
      description: item.description,
      category: item.category,
      unitCost: item.unitCost,
      sellingPrice: item.sellingPrice
    });
    
    const processedItem = {
      code: String(item.code || '').trim(),
      description: String(item.description || '').trim(),
      category: String(item.category || '').trim(),
      unitCost,
      fixedCostPct,
      fixedCost,
      totalUnitCost,
      sellingPrice,
      distributorPrice: Number(item.distributorPrice) || sellingPrice * 0.75,
      distributorMargin: Number(item.distributorMargin) || 25,
      intermediatePrice: Number(item.intermediatePrice) || sellingPrice * 0.85,
      intermediateMargin: Number(item.intermediateMargin) || 15,
      margin,
      grossProfit,
      netCost: item.netCost !== undefined ? Number(item.netCost) : totalUnitCost,
      availableQty: Number(item.availableQty) || 0,
      inTransitQty: Number(item.inTransitQty) || 0,
      warehouseQty: Number(item.warehouseQty) || Number(item.availableQty) || 0,
      preSaleQty: Number(item.preSaleQty) || 0,
      soldQty: Number(item.soldQty) || 0,
      routeQty: Number(item.routeQty) || 0,
      routePct: Number(item.routePct) || 0,
      isInvestmentRecovered: Boolean(item.isInvestmentRecovered) || false,
      image: item.image || null
    };
    
    // Log processed item
    logImport(`Item procesado:`, {
      code: processedItem.code,
      description: processedItem.description,
      category: processedItem.category,
      unitCost: processedItem.unitCost,
      sellingPrice: processedItem.sellingPrice
    });
    
    return processedItem;
  });
  
  logImport(`Procesamiento completado para ${processedItems.length} items`);
  return processedItems;
}

/**
 * Parse inventory Excel file
 */
export async function parseInventoryFile(
  file: File, 
  headerMapping?: HeaderMapping
): Promise<ImportResult<InventoryItem>> {
  logImport(`Iniciando parseInventoryFile para archivo: ${file.name}, tamaño: ${file.size} bytes`);
  
  const result = await processExcelFile<any>(file, ImportFileType.INVENTORY, headerMapping || INVENTORY_HEADER_MAPPING);
  
  if (!result.success || !result.data) {
    logImport(`Error al procesar el archivo: ${result.errors?.join(', ')}`);
    return result as ImportResult<InventoryItem>;
  }
  
  logImport(`Archivo procesado exitosamente, obtenidos ${result.data.length} registros`);
  
  // Process and normalize data
  const processedItems = processInventoryData(result.data);
  
  // Validate data
  const validationErrors = validateInventoryData(processedItems);
  
  if (validationErrors.length > 0) {
    logImport(`Validación fallida con ${validationErrors.length} errores`);
    return {
      success: false,
      errors: validationErrors
    };
  }
  
  logImport(`Procesamiento completo, retornando ${processedItems.length} items validados`);
  return {
    success: true,
    data: processedItems
  };
}

/**
 * Process inventory file directly
 */
export const processInventoryFile = async (file: File): Promise<ImportResult<InventoryItem>> => {
  try {
    // Read the workbook
    const reader = new FileReader();
    const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    
    const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const fileType = detectFormat(worksheet);
    
    if (fileType !== ImportFileType.INVENTORY) {
      return {
        success: false,
        errors: ['El archivo no parece contener datos de inventario válidos']
      };
    }
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet) as any[];
    
    if (!data || data.length === 0) {
      return {
        success: false,
        errors: ['No se encontraron datos en el archivo Excel']
      };
    }
    
    // Map the data using our headers
    const mappedData = data.map(row => {
      const mappedRow: Record<string, any> = {};
      
      Object.entries(row).forEach(([key, value]) => {
        const mappedKey = INVENTORY_HEADER_MAPPING[key] || key;
        mappedRow[mappedKey] = value;
      });
      
      return mappedRow;
    });
    
    // Process and validate the data
    const processedItems = processInventoryData(mappedData);
    const validationErrors = validateInventoryData(processedItems);
    
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors
      };
    }
    
    return {
      success: true,
      data: processedItems
    };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message]
    };
  }
};

export function parseInventoryExcel(file: ArrayBuffer): InventoryItem[] {
  try {
    // Load workbook from the uploaded file
    const workbook = XLSX.read(file);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (!data || data.length === 0) {
      throw new Error('No data found in the Excel file');
    }
    
    // Detect format and map fields accordingly
    const firstRow = data[0] as any;
    const items: InventoryItem[] = [];
    
    // Check if it's the Legend 2025 format
    const isLegendFormat = 'Código' in firstRow && 'Categoría' in firstRow && 'Descripción' in firstRow && 'EN TRÁNSITO' in firstRow;
    
    // Check if it's a simple format (minimum required fields)
    const isSimpleFormat = 'code' in firstRow && 'description' in firstRow && 'unitCost' in firstRow;
    
    // Map fields based on detected format
    for (const row of data) {
      const item = row as any;
      
      if (isLegendFormat) {
        // Legend 2025 inventory format
        const product: InventoryItem = {
          code: item['Código'] || '',
          description: item['Descripción'] || '',
          category: item['Categoría'] || '',
          unitCost: parseFloat(item['Costo EXW']) || 0,
          fixedCostPct: parseFloat(item['% COSTO FIJO']) || 2,
          fixedCost: parseFloat(item['Costo Fijo - CF']) || 0,
          totalUnitCost: parseFloat(item['Costo Unitario EXW+CF']) || 0,
          sellingPrice: parseFloat(item['PVP Cliente Final']) || 0,
          distributorPrice: parseFloat(item['PVP Distribuidor']) || 0,
          distributorMargin: parseFloat(item['Margen Distribuidor']) || 0,
          intermediatePrice: parseFloat(item['PVP Intermediario']) || 0,
          intermediateMargin: parseFloat(item['Margen Intermediario']) || 0,
          margin: parseFloat(item['Margen Cliente Final']) || 0,
          grossProfit: item['Costo Unitario EXW+CF'] && item['PVP Cliente Final'] 
            ? parseFloat(item['PVP Cliente Final']) - parseFloat(item['Costo Unitario EXW+CF'])
            : 0,
          netCost: parseFloat(item['Costo Unitario EXW+CF']) || parseFloat(item['Costo EXW']) || 0,
          inTransitQty: parseInt(item['EN TRÁNSITO']) || 0,
          warehouseQty: parseInt(item['EN ALMACÉN']) || 0,
          preSaleQty: parseInt(item['PRE VENTA']) || 0,
          soldQty: parseInt(item['VENTA']) || 0,
          availableQty: parseInt(item['DISPONIBLE ALMACÉN']) || 0,
          routeQty: parseInt(item['DISPONIBLE EN RUTA']) || 0,
          routePct: parseFloat(item['% DISPONIBLE RUTA']) || 0,
          isInvestmentRecovered: item['INVERSION RECUPERADA'] === 'SI' || item['INVERSION RECUPERADA'] === 'YES' || false,
          image: item['Imagen'] || null
        };
        items.push(product);
      } else if (isSimpleFormat) {
        // Simple format with minimum required fields
        const product: InventoryItem = {
          code: item.code,
          description: item.description,
          category: item.category || '',
          unitCost: parseFloat(item.unitCost) || 0,
          sellingPrice: parseFloat(item.sellingPrice) || 0,
          margin: parseFloat(item.margin) || 0,
          grossProfit: parseFloat(item.grossProfit) || 0,
          availableQty: parseInt(item.availableQty) || 0,
          // Set default values for new fields
          fixedCostPct: 2,
          fixedCost: (parseFloat(item.unitCost) * 0.02) || 0,
          totalUnitCost: parseFloat(item.unitCost) * 1.02 || 0,
          distributorPrice: parseFloat(item.distributorPrice) || parseFloat(item.unitCost) * 2 || 0,
          distributorMargin: parseFloat(item.distributorMargin) || 50,
          intermediatePrice: parseFloat(item.intermediatePrice) || parseFloat(item.unitCost) * 2.5 || 0,
          intermediateMargin: parseFloat(item.intermediateMargin) || 60,
          netCost: parseFloat(item.netCost) || parseFloat(item.unitCost) || 0,
          inTransitQty: parseInt(item.inTransitQty) || 0,
          warehouseQty: parseInt(item.warehouseQty) || parseInt(item.availableQty) || 0,
          preSaleQty: parseInt(item.preSaleQty) || 0,
          soldQty: parseInt(item.soldQty) || 0,
          routeQty: parseInt(item.routeQty) || 0,
          routePct: parseFloat(item.routePct) || 0,
          isInvestmentRecovered: item.isInvestmentRecovered || false,
          image: item.image || null
        };
        items.push(product);
      } else {
        // Try to detect common field names and map accordingly
        const product: InventoryItem = {
          code: item.code || item.Code || item.CODE || item.código || item.Código || item.SKU || item.sku || item.Sku || '',
          description: item.description || item.Description || item.DESC || item.desc || item.descripción || item.Descripción || '',
          category: item.category || item.Category || item.CATEGORY || item.categoría || item.Categoría || '',
          unitCost: parseFloat(item.unitCost || item.cost || item.Cost || item.COST || item.costo || item.Costo || 0),
          sellingPrice: parseFloat(item.sellingPrice || item.price || item.Price || item.PRICE || item.precio || item.Precio || 0),
          margin: parseFloat(item.margin || item.Margin || item.MARGIN || item.margen || item.Margen || 0),
          grossProfit: parseFloat(item.grossProfit || item.profit || item.Profit || item.PROFIT || item.utilidad || item.Utilidad || 0),
          availableQty: parseInt(item.availableQty || item.stock || item.Stock || item.STOCK || item.inventario || item.Inventario || 0),
          // Set default values for new fields
          fixedCostPct: 2,
          fixedCost: 0,
          totalUnitCost: 0,
          distributorPrice: 0,
          distributorMargin: 0,
          intermediatePrice: 0,
          intermediateMargin: 0,
          netCost: 0,
          inTransitQty: 0,
          warehouseQty: 0,
          preSaleQty: 0,
          soldQty: 0,
          routeQty: 0,
          routePct: 0,
          isInvestmentRecovered: false,
          image: null
        };
        
        // Calculate missing values
        product.fixedCost = product.unitCost * 0.02;
        product.totalUnitCost = product.unitCost * 1.02;
        product.distributorPrice = product.sellingPrice * 0.75; // Assume distributor gets 25% discount
        product.distributorMargin = ((product.distributorPrice - product.totalUnitCost) / product.distributorPrice) * 100;
        product.intermediatePrice = product.sellingPrice * 0.85; // Assume intermediary gets 15% discount
        product.intermediateMargin = ((product.intermediatePrice - product.totalUnitCost) / product.intermediatePrice) * 100;
        product.netCost = product.totalUnitCost;
        product.warehouseQty = product.availableQty;
        
        items.push(product);
      }
    }
    
    return items;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${(error as Error).message}`);
  }
} 