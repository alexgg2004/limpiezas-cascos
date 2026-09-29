import { createContext, useMemo, useState, type ReactNode } from 'react';

interface SearchContextValue {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');

  const value = useMemo<SearchContextValue>(() => ({ searchTerm, setSearchTerm }), [searchTerm]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}
