export const PAGINATION_SCROLL_TARGET_KEY = 'merns-shop.pagination-scroll-target';

export function markPaginationScrollTarget(scrollTargetTestId: string): void {
  sessionStorage.setItem(PAGINATION_SCROLL_TARGET_KEY, scrollTargetTestId);
}

export function hasPaginationScrollTarget(scrollTargetTestId: string): boolean {
  return sessionStorage.getItem(PAGINATION_SCROLL_TARGET_KEY) === scrollTargetTestId;
}

export function consumePaginationScrollTarget(scrollTargetTestId: string): boolean {
  const stored = sessionStorage.getItem(PAGINATION_SCROLL_TARGET_KEY);
  if (stored !== scrollTargetTestId) {
    return false;
  }
  sessionStorage.removeItem(PAGINATION_SCROLL_TARGET_KEY);
  return true;
}
