import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import './styles/global.css';
import './styles/components.css';
import './styles/forms.css';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import App from './App.tsx';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function MapsProvider({ children }: { children: ReactNode }) {
  if (!GOOGLE_MAPS_API_KEY) return <>{children}</>;
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      {children}
    </APIProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <MapsProvider>
            <App />
          </MapsProvider>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
