import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import OrderStatusBadge from '../../../frontend/src/components/OrderStatusBadge';

describe('OrderStatusBadge', () => {
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

  it('shows_to_pay_for_unpaid', async () => {
    await act(async () => {
      root.render(<OrderStatusBadge kind="unpaid" testId="order-payment-badge" />);
    });
    expect(container.querySelector('[data-testid="order-payment-badge"]')?.textContent).toBe(
      'To Pay'
    );
  });

  it('shows_paid_with_date', async () => {
    await act(async () => {
      root.render(
        <OrderStatusBadge kind="paid" dateLabel="2026-01-01" testId="order-paid-message" />
      );
    });
    expect(container.querySelector('[data-testid="order-paid-message"]')?.textContent).toBe(
      'Paid on 2026-01-01'
    );
  });
});
