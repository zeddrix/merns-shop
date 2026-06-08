import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import Rating from '../../../frontend/src/components/Rating';

describe('Rating', () => {
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

  it('renders five star icons and review text', () => {
    act(() => {
      root.render(<Rating value={4.5} text="12 reviews" />);
    });

    expect(container.querySelector('[data-testid="product-rating"]')).toBeTruthy();
    expect(container.textContent).toContain('12 reviews');
    expect(container.querySelectorAll('svg').length).toBe(5);
  });
});
