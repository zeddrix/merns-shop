import { Link } from 'react-router-dom';
import { Pagination } from 'react-bootstrap';

interface PaginateProps {
  pages: number;
  page: number;
  isAdmin?: boolean;
  keyword?: string;
}

const Paginate = ({ pages, page, isAdmin = false, keyword = '' }: PaginateProps) => {
  if (pages <= 1) return null;

  return (
    <Pagination data-testid="pagination">
      {[...Array(pages).keys()].map((x) => {
        const pageNum = x + 1;
        const to = !isAdmin
          ? keyword
            ? `/search/${keyword}/page/${pageNum}`
            : `/page/${pageNum}`
          : `/admin/productlist/${pageNum}`;

        return (
          <Pagination.Item
            key={pageNum}
            active={pageNum === page}
            as={Link}
            to={to}
            data-testid={`pagination-page-${pageNum}`}
          >
            {pageNum}
          </Pagination.Item>
        );
      })}
    </Pagination>
  );
};

export default Paginate;
