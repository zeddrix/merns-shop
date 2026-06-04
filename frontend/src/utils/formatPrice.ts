const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const formatPrice = (amount: number): string => formatter.format(amount);

export const calcSavingsPercent = (listPrice: number, price: number): number => {
  if (listPrice <= 0 || price >= listPrice) {
    return 0;
  }
  return Math.round(((listPrice - price) / listPrice) * 100);
};

export const calcSavingsAmount = (listPrice: number, price: number): number =>
  Math.max(0, Math.round((listPrice - price) * 100) / 100);
