import { CatalogItem, HeaderMapping, ImportResult, ImportFileType } from './types';
import { processExcelFile } from './excel-parser';
import path from 'path';

/**
 * Validate catalog data
 */
function validateCatalogData(items: CatalogItem[]): string[] {
  const errors: string[] = [];
  
  // Check for required fields
  items.forEach((item, index) => {
    if (!item.code) {
      errors.push(`Row ${index + 1}: Missing product code`);
    }
    
    if (!item.description) {
      errors.push(`Row ${index + 1}: Missing product description`);
    }
  });
  
  return errors;
}

/**
 * Get category from file name
 */
function getCategoryFromFileName(fileName: string): string {
  // Remove extension
  const baseName = path.basename(fileName, path.extname(fileName));
  
  // Clean up the name
  return baseName.replace(/[-_]/g, ' ').trim().toUpperCase();
}

/**
 * Process catalog data
 */
function processCatalogData(items: any[], fileName: string): CatalogItem[] {
  // Extract category from filename if possible
  const fileCategory = getCategoryFromFileName(fileName);
  
  return items.map(item => {
    return {
      code: String(item.code || '').trim(),
      description: String(item.description || '').trim(),
      // Use category from data if available, otherwise use filename-derived category
      category: item.category ? String(item.category).trim() : fileCategory
    };
  });
}

/**
 * Parse catalog Excel file
 */
export async function parseCatalogFile(
  file: File, 
  headerMapping?: HeaderMapping
): Promise<ImportResult<CatalogItem>> {
  const result = await processExcelFile<any>(file, ImportFileType.CATALOG, headerMapping);
  
  if (!result.success || !result.data) {
    return result as ImportResult<CatalogItem>;
  }
  
  // Process and normalize data
  const processedItems = processCatalogData(result.data, file.name);
  
  // Validate data
  const validationErrors = validateCatalogData(processedItems);
  
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