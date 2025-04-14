import { ProjectItem, ProjectImport, HeaderMapping, ImportResult, ImportFileType } from './types';
import { processExcelFile } from './excel-parser';
import path from 'path';

/**
 * Validate project items data
 */
function validateProjectData(items: ProjectItem[]): string[] {
  const errors: string[] = [];
  
  // Check for required fields
  items.forEach((item, index) => {
    if (!item.code) {
      errors.push(`Row ${index + 1}: Missing product code`);
    }
    
    if (!item.description) {
      errors.push(`Row ${index + 1}: Missing product description`);
    }
    
    if (typeof item.quantity !== 'number' || isNaN(item.quantity) || item.quantity <= 0) {
      errors.push(`Row ${index + 1}: Invalid quantity`);
    }
    
    if (typeof item.unitCost !== 'number' || isNaN(item.unitCost)) {
      errors.push(`Row ${index + 1}: Invalid unit cost`);
    }
    
    if (typeof item.sellingPrice !== 'number' || isNaN(item.sellingPrice)) {
      errors.push(`Row ${index + 1}: Invalid selling price`);
    }
  });
  
  return errors;
}

/**
 * Process project data
 */
function processProjectData(items: any[], fileName: string): ProjectImport {
  // Extract project name from filename if possible
  const projectName = path.basename(fileName, path.extname(fileName));
  
  // Get client name if present in data
  const clientName = items.find(item => item.clientName)?.clientName || undefined;
  
  // Process items
  const processedItems: ProjectItem[] = items.map(item => {
    const quantity = Number(item.quantity) || 0;
    const unitCost = Number(item.unitCost) || 0;
    const sellingPrice = Number(item.sellingPrice) || 0;
    const totalCost = item.totalCost !== undefined ? Number(item.totalCost) : (quantity * unitCost);
    const totalPrice = item.totalPrice !== undefined ? Number(item.totalPrice) : (quantity * sellingPrice);
    const profit = item.profit !== undefined ? Number(item.profit) : (totalPrice - totalCost);
    
    return {
      code: String(item.code || '').trim(),
      description: String(item.description || '').trim(),
      quantity,
      unitCost,
      sellingPrice,
      totalCost,
      totalPrice,
      profit
    };
  });
  
  // Calculate totals
  const totalCost = processedItems.reduce((sum, item) => sum + item.totalCost, 0);
  const totalSellingPrice = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalProfit = processedItems.reduce((sum, item) => sum + item.profit, 0);
  
  return {
    projectName,
    clientName,
    items: processedItems,
    totalCost,
    totalSellingPrice,
    totalProfit
  };
}

/**
 * Parse project Excel file
 */
export async function parseProjectFile(
  file: File, 
  headerMapping?: HeaderMapping
): Promise<ImportResult<ProjectImport>> {
  const result = await processExcelFile<any>(file, ImportFileType.PROJECT, headerMapping);
  
  if (!result.success || !result.data) {
    return {
      success: false,
      errors: result.errors || ['Failed to process project file']
    };
  }
  
  try {
    // Process and normalize data
    const processedProject = processProjectData(result.data, file.name);
    
    // Validate data
    const validationErrors = validateProjectData(processedProject.items);
    
    if (validationErrors.length > 0) {
      return {
        success: false,
        errors: validationErrors
      };
    }
    
    return {
      success: true,
      data: [processedProject]
    };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message]
    };
  }
} 