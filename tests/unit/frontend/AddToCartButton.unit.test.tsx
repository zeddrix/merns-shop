import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import AddToCartButton, {
  type AddToCartButtonState
} from '../../../frontend/src/components/AddToCartButton';

describe('AddToCartButton', () => {
  const renderButton = async (state: AddToCartButtonState, disabled = false) => {
    const onClick = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<AddToCartButton state={state} disabled={disabled} onClick={onClick} />);
    });

    return { container, root, onClick };
  };

  it('renders_idle_state_with_product_add_cart_testid', async () => {
    const { container, root } = await renderButton('idle');

    const button = container.querySelector('[data-testid="product-add-cart"]');
    expect(button).not.toBeNull();
    expect(button?.classList.contains('product-add-cart-btn--added')).toBe(false);

    const idleLayer = container.querySelector('.product-add-cart-btn__layer--idle');
    const successLayer = container.querySelector('.product-add-cart-btn__layer--success');
    expect(idleLayer?.getAttribute('aria-hidden')).toBe('false');
    expect(successLayer?.getAttribute('aria-hidden')).toBe('true');
    expect(idleLayer?.textContent).toBe('Add To Cart');

    root.unmount();
    container.remove();
  });

  it('renders_added_state_with_product_add_cart_added_testid', async () => {
    const { container, root } = await renderButton('added');

    const button = container.querySelector('[data-testid="product-add-cart-added"]');
    expect(button).not.toBeNull();
    expect(button?.classList.contains('product-add-cart-btn--added')).toBe(true);

    const idleLayer = container.querySelector('.product-add-cart-btn__layer--idle');
    const successLayer = container.querySelector('.product-add-cart-btn__layer--success');
    expect(idleLayer?.getAttribute('aria-hidden')).toBe('true');
    expect(successLayer?.getAttribute('aria-hidden')).toBe('false');
    expect(successLayer?.textContent).toBe('Added to cart!');

    root.unmount();
    container.remove();
  });

  it('renders_loading_state_with_spinner_and_disabled_button', async () => {
    const { container, root } = await renderButton('loading');

    const button = container.querySelector(
      '[data-testid="product-add-cart-loading"]'
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.disabled).toBe(true);
    expect(button.classList.contains('product-add-cart-btn--loading')).toBe(true);
    expect(container.querySelector('[data-testid="product-add-cart-spinner"]')).not.toBeNull();

    const loadingLayer = container.querySelector('.product-add-cart-btn__layer--loading');
    expect(loadingLayer?.getAttribute('aria-hidden')).toBe('false');

    root.unmount();
    container.remove();
  });

  it('renders_error_state_with_product_add_cart_error_testid', async () => {
    const { container, root } = await renderButton('error');

    const button = container.querySelector('[data-testid="product-add-cart-error"]');
    expect(button).not.toBeNull();
    expect(button?.classList.contains('product-add-cart-btn--error')).toBe(true);

    const errorLayer = container.querySelector('.product-add-cart-btn__layer--error');
    expect(errorLayer?.getAttribute('aria-hidden')).toBe('false');
    expect(errorLayer?.textContent).toBe("Couldn't add — try again");

    root.unmount();
    container.remove();
  });

  it('fires_onClick_when_clicked', async () => {
    const { container, root, onClick } = await renderButton('idle');

    const button = container.querySelector('[data-testid="product-add-cart"]');
    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onClick).toHaveBeenCalledTimes(1);

    root.unmount();
    container.remove();
  });

  it('respects_disabled_prop', async () => {
    const { container, root } = await renderButton('idle', true);

    const button = container.querySelector('[data-testid="product-add-cart"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    root.unmount();
    container.remove();
  });
});
