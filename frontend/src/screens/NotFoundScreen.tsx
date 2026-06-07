import { Link } from 'react-router-dom';
import Meta from '../components/Meta';
import { ROBOTS_NOINDEX_NOFOLLOW } from '../constants/seo';
import { buildNotFoundMetaDescription, buildNotFoundTitle } from '../utils/seoMeta';

const NotFoundScreen = () => (
  <>
    <Meta
      title={buildNotFoundTitle()}
      description={buildNotFoundMetaDescription()}
      canonicalPath="/404"
      robots={ROBOTS_NOINDEX_NOFOLLOW}
    />
    <div data-testid="not-found-page">
      <h1>Page Not Found</h1>
      <p>The page you requested does not exist or may have moved.</p>
      <Link to="/" className="btn btn-primary" data-testid="not-found-home-link">
        Back to shop
      </Link>
    </div>
  </>
);

export default NotFoundScreen;
