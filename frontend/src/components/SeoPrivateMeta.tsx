import Meta from './Meta';
import { ROBOTS_NOINDEX_NOFOLLOW } from '../constants/seo';

interface SeoPrivateMetaProps {
  canonicalPath: string;
}

const SeoPrivateMeta = ({ canonicalPath }: SeoPrivateMetaProps) => (
  <Meta robots={ROBOTS_NOINDEX_NOFOLLOW} canonicalPath={canonicalPath} />
);

export default SeoPrivateMeta;
