import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Product from '../../../frontend/src/components/Product';
import type { Product as ProductType } from '../../../frontend/src/types';

const sampleProduct: ProductType = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test Phone',
  image: '/images/sample.jpg',
  brand: 'TestBrand',
  category: 'Electronics',
  subcategory: 'Phones',
  modelKey: 'test-phone',
  releaseYear: 2024,
  condition: 'New',
  description: 'A test product',
  reviews: [],
  rating: 4,
  numReviews: 12,
  variants: [
    {
      sku: 'test-128gb',
      label: '128GB',
      listPrice: 999,
      price: 899,
      countInStock: 5
    }
  ],
  user: '507f1f77bcf86cd799439012',
  priceFrom: 899,
  listPriceFrom: 999,
  inStock: true
};

describe('Product', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders_single_link_to_product_detail', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Product product={sampleProduct} />
        </MemoryRouter>
      );
    });

    const links = container.querySelectorAll('a[href="/product/507f1f77bcf86cd799439011"]');
    expect(links).toHaveLength(1);
    expect(container.querySelector('[data-testid="product-price-display"]')).not.toBeNull();
  });

  it('price_display_is_inside_product_card_link', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Product product={sampleProduct} />
        </MemoryRouter>
      );
    });

    const cardLink = container.querySelector(
      'a[data-testid="product-card-507f1f77bcf86cd799439011"]'
    );
    const priceDisplay = container.querySelector('[data-testid="product-price-display"]');
    expect(cardLink?.contains(priceDisplay ?? null)).toBe(true);
  });
});
