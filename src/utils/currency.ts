/**
 * Format numeric amount into localized currency display
 * Default is Colombian Peso (COP) with clean formatting: $ 50.000
 */
export function formatCurrency(amount: number, currency: string = 'COP'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$ 0';
  }

  const cleanCurrency = currency?.toUpperCase() || 'COP';

  try {
    if (cleanCurrency === 'COP') {
      const formatted = Math.round(amount).toLocaleString('es-CO');
      return `$ ${formatted}`;
    }

    if (cleanCurrency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }

    if (cleanCurrency === 'EUR') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount);
    }

    if (cleanCurrency === 'MXN') {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(amount);
    }

    return `$ ${amount.toLocaleString()}`;
  } catch (error) {
    return `$ ${amount}`;
  }
}

/**
 * Calculate discount percentage between original price and current price
 */
export function calculateDiscountPercentage(price: number, originalPrice?: number | null): number {
  if (!originalPrice || originalPrice <= price) return 0;
  const discount = ((originalPrice - price) / originalPrice) * 100;
  return Math.round(discount);
}
