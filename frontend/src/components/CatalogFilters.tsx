import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Row, Col, Form, Button } from 'react-bootstrap';
import axios from 'axios';
import type { ProductMetaResponse } from '../types';

interface CatalogFiltersProps {
  keyword?: string;
}

const CatalogFilters = ({ keyword = '' }: CatalogFiltersProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    const loadMeta = async () => {
      const { data } = await axios.get<ProductMetaResponse>('/api/products/meta');
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
    const query = params.toString();
    const base = keyword ? `/search/${keyword}` : '/';
    navigate(query ? `${base}?${query}` : base);
  };

  const clearFilters = () => {
    const base = keyword ? `/search/${keyword}` : '/';
    navigate(base);
  };

  const hasActiveFilters = Boolean(
    brand || category || subcategory || minPrice || maxPrice || sort
  );

  return (
    <div className="mb-4 p-3 border rounded bg-light" data-testid="catalog-filters">
      <Row className="g-2">
        <Col md={4} lg={2}>
          <Form.Group controlId="filter-brand">
            <Form.Label>Brand</Form.Label>
            <Form.Select
              value={brand}
              data-testid="filter-brand"
              onChange={(e) => applyFilters({ brand: e.target.value })}
            >
              <option value="">All brands</option>
              {meta.brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} lg={2}>
          <Form.Group controlId="filter-category">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={category}
              data-testid="filter-category"
              onChange={(e) => applyFilters({ category: e.target.value, subcategory: '' })}
            >
              <option value="">All categories</option>
              {meta.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} lg={2}>
          <Form.Group controlId="filter-subcategory">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={subcategory}
              data-testid="filter-subcategory"
              onChange={(e) => applyFilters({ subcategory: e.target.value })}
            >
              <option value="">All types</option>
              {meta.subcategories.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4} lg={2}>
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
        <Col md={4} lg={2}>
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
        <Col md={4} lg={2}>
          <Form.Group controlId="filter-sort">
            <Form.Label>Sort</Form.Label>
            <Form.Select
              value={sort}
              data-testid="filter-sort"
              onChange={(e) => applyFilters({ sort: e.target.value })}
            >
              <option value="">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Release Year</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      {hasActiveFilters && (
        <Button
          variant="link"
          className="px-0 mt-2"
          data-testid="filter-clear"
          onClick={clearFilters}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default CatalogFilters;
