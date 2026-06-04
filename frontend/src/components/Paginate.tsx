import { Link } from 'react-router-dom';
import { Pagination } from 'react-bootstrap';

interface PaginateProps {
  pages: number;
  page: number;
  isAdmin?: boolean;
  keyword?: string;
  searchQuery?: string;
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
  searchQuery = ''
}: PaginateProps) => {
  if (pages <= 1) return null;

  const visible = getVisiblePages(pages, page);
  const prevPath = buildPath(page - 1, isAdmin, keyword, searchQuery);
  const nextPath = buildPath(page + 1, isAdmin, keyword, searchQuery);

  return (
    <Pagination data-testid="pagination">
      <Pagination.Item disabled={page <= 1} data-testid="pagination-prev">
        {page > 1 ? <Link to={prevPath}>Previous</Link> : <span>Previous</span>}
      </Pagination.Item>
      {visible.map((item, idx) =>
        item === 'ellipsis' ? (
          <Pagination.Ellipsis key={`ellipsis-${idx}`} disabled data-testid="pagination-ellipsis" />
        ) : (
          <Pagination.Item
            key={item}
            active={item === page}
            data-testid={`pagination-page-${item}`}
          >
            <Link to={buildPath(item, isAdmin, keyword, searchQuery)}>{item}</Link>
          </Pagination.Item>
        )
      )}
      <Pagination.Item disabled={page >= pages} data-testid="pagination-next">
        {page < pages ? <Link to={nextPath}>Next</Link> : <span>Next</span>}
      </Pagination.Item>
    </Pagination>
  );
};

export default Paginate;
