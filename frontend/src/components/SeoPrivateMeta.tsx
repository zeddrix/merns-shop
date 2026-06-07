import Meta from './Meta';
import { ROBOTS_NOINDEX_NOFOLLOW } from '../constants/seo';
import { buildPrivateMetaDescription } from '../utils/seoMeta';

interface SeoPrivateMetaProps {
  canonicalPath: string;
}

const SeoPrivateMeta = ({ canonicalPath }: SeoPrivateMetaProps) => (
  <Meta
    robots={ROBOTS_NOINDEX_NOFOLLOW}
    canonicalPath={canonicalPath}
    description={buildPrivateMetaDescription()}
  />
);

export default SeoPrivateMeta;
