import './Topbar.css';

export function Topbar({ title }: { title: string }) {
  return (
    <header className="topbar">
      <div className="topbar__title">{title}</div>

      <div className="topbar__actions">
        <div className="topbar__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M20 20l-4.8-4.8" />
          </svg>
          <span>Buscar...</span>
        </div>
      </div>
    </header>
  );
}
