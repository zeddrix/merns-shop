import { useEffect, useId, useRef, useState } from 'react';

export interface AppSelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string | number;
  options: AppSelectOption[];
  onChange: (value: string) => void;
  'data-testid': string;
  id?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const AppSelect = ({
  value,
  options,
  onChange,
  'data-testid': testId,
  id: idProp,
  disabled = false,
  className = '',
  ariaLabel
}: AppSelectProps) => {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const stringValue = String(value);
  const selected = options.find((o) => o.value === stringValue) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectValue = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`app-select ${open ? 'app-select--open' : ''} ${className}`.trim()}
      data-testid={testId}
    >
      <button
        type="button"
        id={id}
        className="app-select-trigger"
        data-testid={`${testId}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ?? selected?.label}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="app-select-value">{selected?.label ?? ''}</span>
        <span className="app-select-chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul className="app-select-menu" role="listbox" aria-labelledby={id}>
          {options.map((option) => (
            <li key={option.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={option.value === stringValue}
                className={`app-select-option${option.value === stringValue ? ' app-select-option--selected' : ''}`}
                data-testid={`${testId}-option-${option.value}`}
                onClick={() => selectValue(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AppSelect;
