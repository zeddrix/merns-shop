export const ORDERS_PER_PAGE_DEFAULT = 100;
export const ORDERS_PER_PAGE_MAX = 100;

export const parseOrderPagination = (query: {
  page?: string | number;
  limit?: string | number;
}): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, Number(query.page) || 1);
  const rawLimit = Number(query.limit) || ORDERS_PER_PAGE_DEFAULT;
  const limit = Math.min(Math.max(1, rawLimit), ORDERS_PER_PAGE_MAX);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

export const calculateOrderPages = (total: number, limit: number): number =>
  Math.ceil(total / limit) || 1;
