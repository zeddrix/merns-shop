import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import AppSelect from '../../../frontend/src/components/AppSelect';

describe('AppSelect', () => {
  it('renders_selected_label_and_fires_onChange', async () => {
    const onChange = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <AppSelect
          value="2"
          data-testid="test-select"
          onChange={onChange}
          options={[
            { value: '1', label: 'One' },
            { value: '2', label: 'Two' }
          ]}
        />
      );
    });

    const trigger = container.querySelector('[data-testid="test-select-trigger"]');
    expect(trigger?.textContent).toContain('Two');

    await act(async () => {
      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const option = container.querySelector('[data-testid="test-select-option-1"]');
    await act(async () => {
      option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalledWith('1');
    root.unmount();
    container.remove();
  });

  it('searchable_filters_options', async () => {
    const onChange = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <AppSelect
          searchable
          value=""
          data-testid="country-select"
          onChange={onChange}
          options={[
            { value: 'Philippines', label: 'Philippines' },
            { value: 'United States', label: 'United States' }
          ]}
        />
      );
    });

    await act(async () => {
      container
        .querySelector('[data-testid="country-select-trigger"]')
        ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const search = container.querySelector(
      '[data-testid="country-select-search"]'
    ) as HTMLInputElement;
    await act(async () => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setValue?.call(search, 'phil');
      search.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(
      container.querySelector('[data-testid="country-select-option-Philippines"]')
    ).not.toBeNull();
    expect(
      container.querySelector('[data-testid="country-select-option-United States"]')
    ).toBeNull();

    root.unmount();
    container.remove();
  });

  it('shows_placeholder_when_value_empty', async () => {
    const onChange = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <AppSelect
          value=""
          placeholder="Select country…"
          data-testid="country-select"
          onChange={onChange}
          options={[
            { value: 'Philippines', label: 'Philippines' },
            { value: 'United States', label: 'United States' }
          ]}
        />
      );
    });

    const trigger = container.querySelector('[data-testid="country-select-trigger"]');
    expect(trigger?.textContent).toContain('Select country…');
    expect(trigger?.textContent).not.toContain('Philippines');

    root.unmount();
    container.remove();
  });
});
