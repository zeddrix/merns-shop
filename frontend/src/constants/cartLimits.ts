export const MAX_QTY_SELECT = 10;

export const capQtyOptions = (stock: number): number =>
  Math.min(Math.max(stock, 0), MAX_QTY_SELECT);
