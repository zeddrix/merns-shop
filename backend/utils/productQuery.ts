export const PRODUCTS_PER_PAGE = 2;

export const calculateTotalPages = (count: number, pageSize = PRODUCTS_PER_PAGE): number => {
  return Math.ceil(count / pageSize);
};

export const buildKeywordFilter = (keyword?: string) => {
  if (!keyword) {
    return {};
  }

  return {
    name: {
      $regex: keyword,
      $options: 'i'
    }
  };
};
