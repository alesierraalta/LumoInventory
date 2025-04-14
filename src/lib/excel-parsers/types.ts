export interface InventoryItem {
  code: string;
  description: string;
  unitCost: number;
  margin: number;
  sellingPrice: number;
  grossProfit: number;
  netCost?: number;
  availableQty: number;
  category: string;
}

export interface CatalogItem {
  code: string;
  description: string;
  category: string;
}

export interface ProjectItem {
  code: string;
  description: string;
  quantity: number;
  unitCost: number;
  sellingPrice: number;
  totalCost: number;
  totalPrice: number;
  profit: number;
}

export interface ProjectImport {
  projectName: string;
  clientName?: string;
  items: ProjectItem[];
  totalCost: number;
  totalSellingPrice: number;
  totalProfit: number;
}

export interface HeaderMapping {
  [key: string]: string;
}

export enum ImportFileType {
  INVENTORY = 'INVENTORY',
  CATALOG = 'CATALOG',
  PROJECT = 'PROJECT',
}

export interface ImportResult<T> {
  success: boolean;
  data?: T[];
  errors?: string[];
}

export interface FileHandler<T> {
  parseFile: (file: File, headerMapping?: HeaderMapping) => Promise<ImportResult<T>>;
}

export interface Category {
  id: string;
  name: string;
}

export type SheetData = (string | number | null)[][]; 