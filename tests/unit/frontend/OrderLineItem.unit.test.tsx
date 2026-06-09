import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import OrderLineItem from '../../../frontend/src/components/OrderLineItem';

describe('OrderLineItem', () => {
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

  it('renders_qty_price_and_total_with_single_price_testid', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <OrderLineItem
            item={{
              product: 'prod-1',
              name: 'Test Product (128GB)',
              image: '/img.jpg',
              price: 99.99,
              qty: 2
            }}
          />
        </MemoryRouter>
      );
    });

    expect(container.querySelectorAll('[data-testid="order-line-qty-price"]')).toHaveLength(1);
    expect(container.querySelector('[data-testid="order-line-total"]')?.textContent).toBe(
      '$199.98'
    );
  });
});
