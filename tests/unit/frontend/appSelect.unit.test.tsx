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
});
