import { InventoryItem, HeaderMapping, ImportResult, ImportFileType } from './types';
import { processExcelFile } from './excel-parser';

/**
 * Validate inventory data
 */
function validateInventoryData(items: InventoryItem[]): string[] {
  const errors: string[] = [];
  
  // Check for required fields
  items.forEach((item, index) => {
    if (!item.code) {
      errors.push(`Row ${index + 1}: Missing product code`);
    }
    
    if (!item.description) {
      errors.push(`Row ${index + 1}: Missing product description`);
    }
    
    if (typeof item.unitCost !== 'number' || isNaN(item.unitCost)) {
      errors.push(`Row ${index + 1}: Invalid unit cost`);
    }
    
    if (typeof item.sellingPrice !== 'number' || isNaN(item.sellingPrice)) {
      errors.push(`Row ${index + 1}: Invalid selling price`);
    }
    
    if (!item.category) {
      errors.push(`Row ${index + 1}: Missing category`);
    }
  });
  
  return errors;
}

/**
 * Process and normalize inventory data
 */
function processInventoryData(items: any[]): InventoryItem[] {
  return items.map(item => {
    // Calculate missing values if possible
    const unitCost = Number(item.unitCost) || 0;
    const sellingPrice = Number(item.sellingPrice) || 0;
    const margin = item.margin !== undefined ? Number(item.margin) : 
      (unitCost > 0 ? ((sellingPrice - unitCost) / sellingPrice) * 100 : 0);
    const grossProfit = item.grossProfit !== undefined ? Number(item.grossProfit) : 
      (sellingPrice - unitCost);
    
    return {
      code: String(item.code || '').trim(),
      description: String(item.description || '').trim(),
      unitCost,
      margin,
      sellingPrice,
      grossProfit,
      netCost: item.netCost !== undefined ? Number(item.netCost) : unitCost,
      availableQty: Number(item.availableQty) || 0,
      category: String(item.category || '').trim()
    };
  });
}

/**
 * Parse inventory Excel file
 */
export async function parseInventoryFile(
  file: File, 
  headerMapping?: HeaderMapping
): Promise<ImportResult<InventoryItem>> {
  const result = await processExcelFile<any>(file, ImportFileType.INVENTORY, headerMapping);
  
  if (!result.success || !result.data) {
    return result as ImportResult<InventoryItem>;
  }
  
  // Process and normalize data
  const processedItems = processInventoryData(result.data);
  
  // Validate data
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
} 