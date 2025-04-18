export interface InventoryItem {
  code: string;
  description: string;
  category: string;
  unitCost: number;
  fixedCostPct: number;
  fixedCost: number;
  totalUnitCost: number;
  sellingPrice: number;
  distributorPrice: number;
  distributorMargin: number;
  intermediatePrice: number;
  intermediateMargin: number;
  margin: number;
  grossProfit: number;
  netCost?: number;
  availableQty: number;
  inTransitQty: number;
  warehouseQty: number;
  preSaleQty: number;
  soldQty: number;
  routeQty: number;
  routePct: number;
  isInvestmentRecovered: boolean;
  image?: string | null;
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
  INVENTORY = 'inventory',
  PROJECTS = 'projects',
  CUSTOM = 'custom'
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