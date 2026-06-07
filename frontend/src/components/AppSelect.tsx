import { useEffect, useId, useMemo, useRef, useState } from 'react';

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
  searchable?: boolean;
  searchPlaceholder?: string;
  placeholder?: string;
}

const AppSelect = ({
  value,
  options,
  onChange,
  'data-testid': testId,
  id: idProp,
  disabled = false,
  className = '',
  ariaLabel,
  searchable = false,
  searchPlaceholder = 'Search…',
  placeholder
}: AppSelectProps) => {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const stringValue = String(value);
  const hasValue = stringValue.length > 0;
  const selected = hasValue ? options.find((o) => o.value === stringValue) : undefined;
  const displayLabel = selected?.label ?? placeholder ?? '';
  const showPlaceholderStyle = !selected && Boolean(placeholder);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchable, searchQuery]);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      return;
    }
    if (searchable) {
      searchRef.current?.focus();
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
      if (event.key === 'Enter' && searchable && filteredOptions.length > 0) {
        const target = event.target as HTMLElement;
        if (target.dataset.testid === `${testId}-search`) {
          event.preventDefault();
          const first = filteredOptions[0];
          if (first) {
            onChange(first.value);
          }
          setOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, searchable, filteredOptions, onChange, testId]);

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
        aria-label={ariaLabel ?? selected?.label ?? placeholder}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span
          className={`app-select-value${showPlaceholderStyle ? ' app-select-value--placeholder' : ''}`}
        >
          {displayLabel}
        </span>
        <span className="app-select-chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul className="app-select-menu" role="listbox" aria-labelledby={id}>
          {searchable && (
            <li role="presentation" className="app-select-search-wrap">
              <input
                ref={searchRef}
                type="search"
                className="app-select-search"
                data-testid={`${testId}-search`}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onClick={(event) => event.stopPropagation()}
              />
            </li>
          )}
          {filteredOptions.map((option) => (
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
          {filteredOptions.length === 0 && (
            <li role="presentation" className="app-select-empty">
              No matches
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default AppSelect;
