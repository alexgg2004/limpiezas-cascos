import { useSearch } from '../../hooks/useSearch';
import './Topbar.css';

export function Topbar({
  title,
  showSearch = true,
  searchPlaceholder = 'Buscar...',
  onMenuClick,
}: {
  title: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onMenuClick: () => void;
}) {
  const { searchTerm, setSearchTerm } = useSearch();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button type="button" className="topbar__menu-btn" onClick={onMenuClick} aria-label="Abrir menú">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="topbar__title">{title}</div>
      </div>

      {showSearch && (
        <div className="topbar__actions">
          <div className="topbar__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M20 20l-4.8-4.8" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </div>
        </div>
      )}
    </header>
  );
}
