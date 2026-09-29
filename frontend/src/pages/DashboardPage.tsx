import { useEffect, useState } from 'react';
import { clientesApi } from '../api/clientes';
import { sitiosApi } from '../api/sitios';
import { serviciosApi } from '../api/servicios';
import { EstadoBadge } from '../components/ui/EstadoBadge';
import { CalendarioMensual } from '../components/dashboard/CalendarioMensual';
import { ServicioFormModal } from '../components/servicios/ServicioFormModal';
import { fechaLocalIso } from '../utils/fecha';
import type { ClienteResponseDto, ServicioResponseDto, SitioLimpiezaResponseDto } from '../types';
import './DashboardPage.css';

// Fecha de referencia calculada una sola vez al cargar el módulo (no en cada render).
const ahora = Date.now();
const hoy = fechaLocalIso(new Date(ahora));
const enUnaSemana = fechaLocalIso(new Date(ahora + 7 * 86400000));
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

  const [fechaNuevoServicio, setFechaNuevoServicio] = useState<string | null>(null);

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

          <div className="dashboard__main">
            <CalendarioMensual servicios={servicios} onDiaClick={setFechaNuevoServicio} />

            <div className="card dashboard__upcoming">
              <div className="dashboard__upcoming-header">Próximos servicios</div>
              {proximosServicios.length === 0 ? (
                <div className="state-message">No hay servicios pendientes próximos.</div>
              ) : (
                <div className="dashboard__upcoming-list">
                  {proximosServicios.map((s) => (
                    <div key={s.id} className="dashboard__upcoming-item">
                      <div className="dashboard__upcoming-item-main">
                        <div className="dashboard__upcoming-item-sitio">{s.nombreSitio}</div>
                        <div className="dashboard__upcoming-item-fecha">
                          {s.fecha} · {s.horas ?? '—'} h
                        </div>
                      </div>
                      <EstadoBadge estado={s.estado} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ServicioFormModal
        open={fechaNuevoServicio !== null}
        servicio={null}
        fechaInicial={fechaNuevoServicio ?? undefined}
        onClose={() => setFechaNuevoServicio(null)}
        onSaved={(s) => setServicios((prev) => [...prev, s])}
      />
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
