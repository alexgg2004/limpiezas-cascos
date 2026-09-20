import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientesPage } from './pages/ClientesPage';
import { SitiosPage } from './pages/SitiosPage';
import { ServiciosPage } from './pages/ServiciosPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout title="Dashboard">
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <AppLayout title="Clientes">
              <ClientesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sitios"
        element={
          <ProtectedRoute>
            <AppLayout title="Sitios de limpieza">
              <SitiosPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/servicios"
        element={
          <ProtectedRoute>
            <AppLayout title="Servicios">
              <ServiciosPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
