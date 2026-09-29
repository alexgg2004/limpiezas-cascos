import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useSearch } from '../../hooks/useSearch';
import './AppLayout.css';

export function AppLayout({
  title,
  children,
  showSearch = true,
  searchPlaceholder,
}: {
  title: string;
  children: ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
}) {
  const { setSearchTerm } = useSearch();
  const [navAbierto, setNavAbierto] = useState(false);

  useEffect(() => {
    setSearchTerm('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNavAbierto(false);
  }, [title]);

  return (
    <div className="app-layout">
      <Sidebar open={navAbierto} onClose={() => setNavAbierto(false)} />
      <div className="app-layout__main">
        <Topbar
          title={title}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          onMenuClick={() => setNavAbierto((v) => !v)}
        />
        <div className="app-layout__content">{children}</div>
      </div>
    </div>
  );
}
