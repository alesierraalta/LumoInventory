/**
 * Utility functions for the application
 */

/**
 * Format a number as currency (CLP)
 * @param value - The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return '$0';
  }
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Calculate profit margin as a percentage
 * @param cost - The cost value
 * @param price - The selling price
 * @returns Formatted margin percentage string
 */
export function calculateMargin(cost: number, price: number): string {
  if (cost === 0 || price === 0) return '0%';
  
  const margin = ((price - cost) / price) * 100;
  return `${margin.toFixed(1)}%`;
} 