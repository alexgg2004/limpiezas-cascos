import { useContext } from 'react';
import { SearchContext } from '../context/SearchContext';

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error('useSearch debe usarse dentro de <SearchProvider>');
  }
  return ctx;
}
