import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import './SearchableSelect.css';

export interface SearchableSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface Props {
  value: string; // '' = sin filtro
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  disabled?: boolean;
}

export function SearchableSelect({ value, onChange, options, placeholder, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;
  const displayValue = open ? query : (selected?.label ?? '');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function openDropdown() {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setHighlighted(-1);
  }

  function selectOption(v: string) {
    onChange(v);
    setOpen(false);
    setQuery('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        openDropdown();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted === -1) selectOption('');
      else if (filtered[highlighted]) selectOption(filtered[highlighted].value);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  }

  return (
    <div className={`searchable-select${disabled ? ' searchable-select--disabled' : ''}`} ref={containerRef}>
      <input
        type="text"
        className="searchable-select__input"
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={openDropdown}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlighted(-1);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setOpen(false);
          setQuery('');
        }}
      />

      {open && (
        <div className="searchable-select__dropdown">
          <div
            className={`searchable-select__option searchable-select__option--placeholder${value === '' ? ' searchable-select__option--active' : ''}${highlighted === -1 ? ' searchable-select__option--highlighted' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              selectOption('');
            }}
            onMouseEnter={() => setHighlighted(-1)}
          >
            {placeholder}
          </div>

          {filtered.length === 0 && <div className="searchable-select__empty">Sin resultados</div>}

          {filtered.map((o, i) => (
            <div
              key={o.value}
              className={`searchable-select__option${o.value === value ? ' searchable-select__option--active' : ''}${i === highlighted ? ' searchable-select__option--highlighted' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(o.value);
              }}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span>{o.label}</span>
              {o.sublabel && <span className="searchable-select__sublabel">{o.sublabel}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
