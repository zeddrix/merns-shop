import { Helmet } from 'react-helmet-async';
import { DEFAULT_META_TITLE, DEVELOPER_NAME, ROBOTS_INDEX_FOLLOW } from '../constants/seo';
import {
  buildCanonicalUrl,
  DEFAULT_META_DESCRIPTION,
  defaultOgImageUrl,
  type JsonLdValue,
  type RobotsDirective
} from '../utils/seoMeta';
import { DISPLAY_BRAND_NAME } from '../constants/brand';

interface MetaProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  robots?: RobotsDirective;
  ogImage?: string;
  ogType?: 'website' | 'product';
  keywords?: string;
  jsonLd?: JsonLdValue;
  preloadImage?: string;
}

const Meta = ({
  title = DEFAULT_META_TITLE,
  description = DEFAULT_META_DESCRIPTION,
  canonicalPath = '/',
  robots = ROBOTS_INDEX_FOLLOW,
  ogImage,
  ogType = 'website',
  keywords,
  jsonLd,
  preloadImage
}: MetaProps) => {
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const imageUrl = ogImage ?? defaultOgImageUrl();
  const jsonLdEntries = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content={DEVELOPER_NAME} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      {preloadImage ? (
        <link rel="preload" as="image" href={preloadImage} fetchPriority="high" />
      ) : null}
      <meta property="og:site_name" content={DISPLAY_BRAND_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content={ogType} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      {jsonLdEntries.map((entry, index) => (
        <script key={`jsonld-${index}`} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  );
};

export default Meta;
