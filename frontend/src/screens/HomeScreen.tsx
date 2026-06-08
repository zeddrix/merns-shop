import { memo, useEffect } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Product from '../components/Product';
import StaggerGrid, {
  StaggerGridItem,
  staggerItemVariants
} from '../components/motion/StaggerGrid';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useScrollToTopOnPageChange } from '../hooks/useScrollToTopOnPageChange';
import Message from '../components/Message';
import ApiUnreachablePanel from '../components/ApiUnreachablePanel';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import CatalogFilters from '../components/CatalogFilters';
import Meta from '../components/Meta';
import { DEFAULT_META_TITLE, ROBOTS_INDEX_FOLLOW, ROBOTS_NOINDEX_FOLLOW } from '../constants/seo';
import { listProducts, listTopProducts } from '../features/productSlice';
import { isApiUnreachableMessage } from '../utils/getErrorMessage';
import { isRegisterWelcomeState } from '../utils/authRedirect';
import { getCatalogSearchString } from '../utils/authModalUrl';
import {
  buildHomeCanonicalPath,
  buildOrganizationJsonLd,
  buildPersonJsonLd,
  buildSearchMetaDescription,
  buildSearchTitle,
  DEFAULT_META_DESCRIPTION,
  buildWebsiteJsonLd
} from '../utils/seoMeta';

const HomeScreen = () => {
  const location = useLocation();
  const registerWelcome = isRegisterWelcomeState(location.state)
    ? location.state.registerWelcome
    : null;
  const { keyword, pageNumber } = useParams<{
    keyword?: string;
    pageNumber?: string;
  }>();
  const [searchParams] = useSearchParams();
  const page = pageNumber ?? '1';

  const dispatch = useAppDispatch();

  const productList = useAppSelector((state) => state.productList);
  const { loading, error, products, page: currentPage, pages } = productList;
  const productTopRated = useAppSelector((state) => state.productTopRated);
  const filterQuery = getCatalogSearchString(location.search);
  const brand = searchParams.get('brand') ?? '';
  const category = searchParams.get('category') ?? '';
  const subcategory = searchParams.get('subcategory') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sort = searchParams.get('sort') ?? '';

  const apiUnreachable =
    isApiUnreachableMessage(error) || isApiUnreachableMessage(productTopRated.error);

  useScrollToTopOnPageChange('home-heading', page, !loading && !apiUnreachable && !error);

  const hasFilterQuery = Boolean(brand || category || subcategory || minPrice || maxPrice || sort);
  const showCarousel = !keyword && !hasFilterQuery;

  const listParams = {
    keyword: keyword ?? '',
    pageNumber: page,
    brand,
    category,
    subcategory,
    minPrice,
    maxPrice,
    sort
  };

  const handleApiRetry = () => {
    dispatch(listProducts(listParams));
    if (showCarousel) {
      dispatch(listTopProducts());
    }
  };

  useEffect(() => {
    dispatch(
      listProducts({
        keyword: keyword ?? '',
        pageNumber: page,
        brand,
        category,
        subcategory,
        minPrice,
        maxPrice,
        sort
      })
    );
  }, [dispatch, keyword, page, brand, category, subcategory, minPrice, maxPrice, sort]);

  const canonicalPath = buildHomeCanonicalPath({
    keyword,
    pageNumber: page,
    hasFilterQuery
  });
  const metaTitle = keyword ? buildSearchTitle(keyword) : DEFAULT_META_TITLE;
  const metaDescription = keyword ? buildSearchMetaDescription(keyword) : DEFAULT_META_DESCRIPTION;
  const robots = keyword ? ROBOTS_NOINDEX_FOLLOW : ROBOTS_INDEX_FOLLOW;
  const jsonLd = keyword
    ? undefined
    : [buildWebsiteJsonLd(), buildOrganizationJsonLd(), buildPersonJsonLd()];
  const reducedMotion = usePrefersReducedMotion();
  const listKey = `${keyword ?? ''}-${page}-${filterQuery}`;
  const itemVariants = staggerItemVariants(reducedMotion);

  const lcpPreloadImage =
    showCarousel && productTopRated.products[0]?.image
      ? productTopRated.products[0].image
      : undefined;

  return (
    <>
      <Meta
        title={metaTitle}
        description={metaDescription}
        canonicalPath={canonicalPath}
        robots={robots}
        jsonLd={jsonLd}
        preloadImage={lcpPreloadImage}
      />
      {showCarousel ? (
        <ProductCarousel />
      ) : keyword ? (
        <Link to="/" className="btn btn-light" data-testid="search-go-back">
          Go Back
        </Link>
      ) : null}
      {registerWelcome ? (
        <Message variant="success" data-testid="register-welcome">
          Welcome, {registerWelcome}
        </Message>
      ) : null}
      <h1 data-testid="home-heading">Latest Products</h1>
      <CatalogFilters keyword={keyword} />
      {apiUnreachable ? (
        <ApiUnreachablePanel onRetry={handleApiRetry} />
      ) : loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger" data-testid="home-products-error">
          {error}
        </Message>
      ) : (
        <>
          {products.length === 0 && keyword ? (
            <Message data-testid="search-empty">No products found for your search</Message>
          ) : null}
          <StaggerGrid listKey={listKey} className="row g-3" data-testid="product-list">
            {products.map((product) => (
              <StaggerGridItem
                key={product._id}
                className="col-sm-12 col-md-6 col-lg-4 col-xl-3"
                variants={itemVariants}
              >
                <Product product={product} />
              </StaggerGridItem>
            ))}
          </StaggerGrid>
          <Paginate
            pages={pages ?? 1}
            page={currentPage ?? 1}
            keyword={keyword ?? ''}
            searchQuery={filterQuery}
            scrollTargetTestId="home-heading"
          />
        </>
      )}
    </>
  );
};

export default memo(HomeScreen);
