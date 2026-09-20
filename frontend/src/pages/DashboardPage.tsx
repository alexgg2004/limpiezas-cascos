import { useEffect, useState } from 'react';
import { clientesApi } from '../api/clientes';
import { sitiosApi } from '../api/sitios';
import { serviciosApi } from '../api/servicios';
import { EstadoBadge } from '../components/ui/EstadoBadge';
import type { ClienteResponseDto, ServicioResponseDto, SitioLimpiezaResponseDto } from '../types';
import './DashboardPage.css';

// Fecha de referencia calculada una sola vez al cargar el módulo (no en cada render).
const ahora = Date.now();
const hoy = new Date(ahora).toISOString().slice(0, 10);
const enUnaSemana = new Date(ahora + 7 * 86400000).toISOString().slice(0, 10);
const fechaLegible = new Date(ahora).toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function DashboardPage() {
  const [clientes, setClientes] = useState<ClienteResponseDto[]>([]);
  const [sitios, setSitios] = useState<SitioLimpiezaResponseDto[]>([]);
  const [servicios, setServicios] = useState<ServicioResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([clientesApi.listar(), sitiosApi.listar(), serviciosApi.listar()])
      .then(([clientesData, sitiosData, serviciosData]) => {
        setClientes(clientesData);
        setSitios(sitiosData);
        setServicios(serviciosData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const pendientes = servicios.filter((s) => s.estado === 'PENDIENTE');
  const proximos7Dias = pendientes.filter((s) => s.fecha >= hoy && s.fecha <= enUnaSemana);
  const proximosServicios = [...pendientes]
    .filter((s) => s.fecha >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .slice(0, 6);

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <div className="page-title">Hola de nuevo</div>
          <div className="page-subtitle">{fechaLegible}</div>
        </div>
      </div>

      {loading && <div className="state-message">Cargando datos...</div>}
      {error && <div className="state-message state-message--error">No se han podido cargar los datos del servidor.</div>}

      {!loading && !error && (
        <>
          <div className="dashboard__stats">
            <StatCard label="Servicios pendientes" value={pendientes.length} />
            <StatCard label="Próximos 7 días" value={proximos7Dias.length} />
            <StatCard label="Clientes activos" value={clientes.length} />
            <StatCard label="Sitios registrados" value={sitios.length} />
          </div>

          <div className="card dashboard__upcoming">
            <div className="dashboard__upcoming-header">Próximos servicios</div>
            {proximosServicios.length === 0 ? (
              <div className="state-message">No hay servicios pendientes próximos.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Sitio</th>
                    <th>Horas</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {proximosServicios.map((s) => (
                    <tr key={s.id}>
                      <td>{s.fecha}</td>
                      <td>{s.nombreSitio}</td>
                      <td>{s.horas ?? '—'} h</td>
                      <td>
                        <EstadoBadge estado={s.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card dashboard__stat">
      <div className="dashboard__stat-value">{value}</div>
      <div className="dashboard__stat-label">{label}</div>
    </div>
  );
}
