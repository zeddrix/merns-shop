import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Row, Col, Form, Collapse, Button } from 'react-bootstrap';
import AppSelect from './AppSelect';
import axios from 'axios';
import type { ProductMetaResponse } from '../types';
import { buildCacheKey, getCached, setCached } from '../utils/fetchCache';
import { useIsDesktop } from '../hooks/useIsDesktop';

const META_CACHE_TTL_MS = 60_000;

interface CatalogFiltersProps {
  keyword?: string;
}

const CatalogFilters = ({ keyword = '' }: CatalogFiltersProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [meta, setMeta] = useState<ProductMetaResponse>({
    brands: [],
    categories: [],
    subcategories: []
  });

  const brand = searchParams.get('brand') ?? '';
  const category = searchParams.get('category') ?? '';
  const subcategory = searchParams.get('subcategory') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sort = searchParams.get('sort') ?? '';

  const hasActiveFilters = Boolean(
    brand || category || subcategory || minPrice || maxPrice || sort
  );

  const activeFilterCount = [brand, category, subcategory, minPrice, maxPrice, sort].filter(
    Boolean
  ).length;

  const [filtersOpen, setFiltersOpen] = useState(() => hasActiveFilters);

  useEffect(() => {
    if (hasActiveFilters) {
      setFiltersOpen(true);
    }
  }, [hasActiveFilters]);

  useEffect(() => {
    const loadMeta = async () => {
      const cacheKey = buildCacheKey('/api/products/meta');
      const cached = getCached<ProductMetaResponse>(cacheKey);
      if (cached) {
        setMeta(cached);
        return;
      }

      const { data } = await axios.get<ProductMetaResponse>('/api/products/meta');
      setCached(cacheKey, data, META_CACHE_TTL_MS);
      setMeta(data);
    };
    void loadMeta();
  }, []);

  const applyFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete('pageNumber');
    params.delete('auth');
    params.delete('redirect');
    const query = params.toString();
    const base = keyword ? `/search/${keyword}` : '/';
    navigate(query ? `${base}?${query}` : base);
  };

  const clearFilters = () => {
    const base = keyword ? `/search/${keyword}` : '/';
    navigate(base);
  };

  const panelOpen = isDesktop || filtersOpen;

  return (
    <div className="mb-4" data-testid="catalog-filters">
      {!isDesktop && (
        <Button
          variant="outline-secondary"
          className="catalog-filters-toggle"
          data-testid="catalog-filters-toggle"
          aria-expanded={panelOpen}
          aria-controls="catalog-filters-panel"
          onClick={() => setFiltersOpen((open) => !open)}
        >
          <i className="fas fa-sliders-h" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="catalog-filters-toggle__badge" data-testid="catalog-filters-badge">
              {activeFilterCount}
            </span>
          )}
        </Button>
      )}
      <Collapse in={panelOpen}>
        <div
          id="catalog-filters-panel"
          className="p-3 border rounded bg-light"
          data-testid="catalog-filters-panel"
        >
          <Row className="g-2">
            <Col xs={12} sm={6} md={4} lg={2}>
              <Form.Group controlId="filter-brand">
                <Form.Label>Brand</Form.Label>
                <AppSelect
                  value={brand}
                  data-testid="filter-brand"
                  onChange={(value) => applyFilters({ brand: value })}
                  options={[
                    { value: '', label: 'All brands' },
                    ...meta.brands.map((b) => ({ value: b, label: b }))
                  ]}
                />
              </Form.Group>
            </Col>
            <Col md={4} lg={2}>
              <Form.Group controlId="filter-category">
                <Form.Label>Category</Form.Label>
                <AppSelect
                  value={category}
                  data-testid="filter-category"
                  onChange={(value) => applyFilters({ category: value, subcategory: '' })}
                  options={[
                    { value: '', label: 'All categories' },
                    ...meta.categories.map((c) => ({ value: c, label: c }))
                  ]}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} lg={2}>
              <Form.Group controlId="filter-subcategory">
                <Form.Label>Type</Form.Label>
                <AppSelect
                  value={subcategory}
                  data-testid="filter-subcategory"
                  onChange={(value) => applyFilters({ subcategory: value })}
                  options={[
                    { value: '', label: 'All types' },
                    ...meta.subcategories.map((s) => ({ value: s, label: s }))
                  ]}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} lg={2}>
              <Form.Group controlId="filter-min-price">
                <Form.Label>Min price</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={minPrice}
                  placeholder="0"
                  data-testid="filter-min-price"
                  onChange={(e) => applyFilters({ minPrice: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} lg={2}>
              <Form.Group controlId="filter-max-price">
                <Form.Label>Max price</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={maxPrice}
                  placeholder="Any"
                  data-testid="filter-max-price"
                  onChange={(e) => applyFilters({ maxPrice: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col xs={12} sm={6} md={4} lg={2}>
              <Form.Group controlId="filter-sort">
                <Form.Label>Sort</Form.Label>
                <AppSelect
                  value={sort}
                  data-testid="filter-sort"
                  onChange={(value) => applyFilters({ sort: value })}
                  options={[
                    { value: '', label: 'Newest' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                    { value: 'rating', label: 'Top Rated' },
                    { value: 'newest', label: 'Release Year' }
                  ]}
                />
              </Form.Group>
            </Col>
          </Row>
          {hasActiveFilters && (
            <button
              type="button"
              className="link-subtle px-0 mt-2"
              data-testid="filter-clear"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      </Collapse>
    </div>
  );
};

export default CatalogFilters;
