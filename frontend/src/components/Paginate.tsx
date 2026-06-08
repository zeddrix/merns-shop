import { Link } from 'react-router-dom';
import { Pagination } from 'react-bootstrap';
import { markPaginationScrollTarget } from '../utils/paginationScroll';

interface PaginateProps {
  pages: number;
  page: number;
  isAdmin?: boolean;
  keyword?: string;
  searchQuery?: string;
  scrollTargetTestId?: string;
}

const buildPath = (
  pageNum: number,
  isAdmin: boolean,
  keyword: string,
  searchQuery: string
): string => {
  if (isAdmin) {
    return `/admin/productlist/${pageNum}`;
  }
  const querySuffix = searchQuery ? `?${searchQuery}` : '';
  if (keyword) {
    return `/search/${keyword}/page/${pageNum}${querySuffix}`;
  }
  return pageNum === 1 ? `/${querySuffix}` : `/page/${pageNum}${querySuffix}`;
};

const getVisiblePages = (pages: number, current: number): (number | 'ellipsis')[] => {
  if (pages <= 7) {
    return [...Array(pages).keys()].map((x) => x + 1);
  }
  const result: (number | 'ellipsis')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(pages - 1, current + 1);
  if (start > 2) result.push('ellipsis');
  for (let i = start; i <= end; i += 1) {
    result.push(i);
  }
  if (end < pages - 1) result.push('ellipsis');
  result.push(pages);
  return result;
};

const Paginate = ({
  pages,
  page,
  isAdmin = false,
  keyword = '',
  searchQuery = '',
  scrollTargetTestId
}: PaginateProps) => {
  if (pages <= 1) return null;

  const visible = getVisiblePages(pages, page);
  const prevPath = buildPath(page - 1, isAdmin, keyword, searchQuery);
  const nextPath = buildPath(page + 1, isAdmin, keyword, searchQuery);
  const ariaLabel = isAdmin ? 'Admin product list pages' : 'Product pages';

  const handlePageNav = () => {
    if (scrollTargetTestId) {
      markPaginationScrollTarget(scrollTargetTestId);
    }
  };

  return (
    <nav aria-label={ariaLabel} className="pagination-section" data-testid="pagination-section">
      <span className="pagination-summary" data-testid="pagination-summary">
        Page {page} of {pages}
      </span>
      <Pagination className="pagination-wrap" data-testid="pagination">
        <Pagination.Item
          className="pagination-nav-item"
          disabled={page <= 1}
          data-testid="pagination-prev"
          onClick={page > 1 ? handlePageNav : undefined}
        >
          {page > 1 ? (
            <Link to={prevPath} aria-label="Previous page">
              &lsaquo;
            </Link>
          ) : (
            <span aria-label="Previous page">&lsaquo;</span>
          )}
        </Pagination.Item>
        {visible.map((item, idx) =>
          item === 'ellipsis' ? (
            <Pagination.Ellipsis
              key={`ellipsis-${idx}`}
              disabled
              data-testid="pagination-ellipsis"
            />
          ) : (
            <Pagination.Item
              key={item}
              active={item === page}
              data-testid={`pagination-page-${item}`}
              onClick={item !== page ? handlePageNav : undefined}
            >
              <Link to={buildPath(item, isAdmin, keyword, searchQuery)}>{item}</Link>
            </Pagination.Item>
          )
        )}
        <Pagination.Item
          className="pagination-nav-item"
          disabled={page >= pages}
          data-testid="pagination-next"
          onClick={page < pages ? handlePageNav : undefined}
        >
          {page < pages ? (
            <Link to={nextPath} aria-label="Next page">
              &rsaquo;
            </Link>
          ) : (
            <span aria-label="Next page">&rsaquo;</span>
          )}
        </Pagination.Item>
      </Pagination>
    </nav>
  );
};

export default Paginate;
