import { useEffect, useState } from 'react';
import { serviciosApi } from '../api/servicios';
import { EstadoBadge } from '../components/ui/EstadoBadge';
import { ServicioFormModal } from '../components/servicios/ServicioFormModal';
import { ServicioDetalleModal } from '../components/servicios/ServicioDetalleModal';
import { EliminarServicioDialog } from '../components/servicios/EliminarServicioDialog';
import type { ServicioResponseDto } from '../types';

export function ServiciosPage() {
  const [servicios, setServicios] = useState<ServicioResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<ServicioResponseDto | null>(null);
  const [servicioDetalle, setServicioDetalle] = useState<ServicioResponseDto | null>(null);
  const [servicioEliminando, setServicioEliminando] = useState<ServicioResponseDto | null>(null);

  useEffect(() => {
    serviciosApi
      .listar()
      .then(setServicios)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(servicio: ServicioResponseDto) {
    setServicios((prev) => {
      const existe = prev.some((s) => s.id === servicio.id);
      return existe ? prev.map((s) => (s.id === servicio.id ? servicio : s)) : [...prev, servicio];
    });
  }

  function handleDeleted(id: number) {
    setServicios((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Servicios</div>
          <div className="page-subtitle">
            {loading ? 'Cargando...' : `${servicios.length} partes de servicio`}
          </div>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setModalNuevoAbierto(true)}>
          <IconPlus />
          Nuevo servicio
        </button>
      </div>

      <div className="card">
        {loading && <div className="state-message">Cargando servicios...</div>}
        {error && <div className="state-message state-message--error">No se han podido cargar los servicios.</div>}
        {!loading && !error && servicios.length === 0 && (
          <div className="state-message">Todavía no hay servicios registrados.</div>
        )}
        {!loading && !error && servicios.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Sitio</th>
                <th>Horas</th>
                <th>Importe</th>
                <th>Estado</th>
                <th>Asignados</th>
                <th>Factura</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id}>
                  <td>{s.fecha}</td>
                  <td>{s.nombreSitio}</td>
                  <td>{s.horas ?? '—'} h</td>
                  <td>{s.totalImporte != null ? `${s.totalImporte.toFixed(2)} €` : '—'}</td>
                  <td>
                    <EstadoBadge estado={s.estado} />
                  </td>
                  <td>
                    {s.asignados.length > 0 ? (
                      s.asignados.map((u) => u.nombreCompleto || u.email).join(', ')
                    ) : (
                      <span style={{ color: 'var(--ink-3)' }}>Sin asignar</span>
                    )}
                  </td>
                  <td>{s.tieneFacturaAdjunta ? 'Sí' : '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" title="Ver detalle" onClick={() => setServicioDetalle(s)}>
                        <IconEye />
                      </button>
                      <button type="button" className="icon-btn" title="Editar" onClick={() => setServicioEditando(s)}>
                        <IconPencil />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ServicioFormModal open={modalNuevoAbierto} servicio={null} onClose={() => setModalNuevoAbierto(false)} onSaved={handleSaved} />

      <ServicioFormModal
        open={servicioEditando !== null}
        servicio={servicioEditando}
        onClose={() => setServicioEditando(null)}
        onSaved={(s) => {
          handleSaved(s);
          setServicioDetalle((actual) => (actual && actual.id === s.id ? s : actual));
        }}
      />

      <ServicioDetalleModal
        open={servicioDetalle !== null}
        servicio={servicioDetalle}
        onClose={() => setServicioDetalle(null)}
        onEditar={() => {
          setServicioEditando(servicioDetalle);
          setServicioDetalle(null);
        }}
        onEliminar={() => {
          setServicioEliminando(servicioDetalle);
          setServicioDetalle(null);
        }}
        onFacturaSubida={(s) => {
          handleSaved(s);
          setServicioDetalle(s);
        }}
      />

      <EliminarServicioDialog servicio={servicioEliminando} onClose={() => setServicioEliminando(null)} onDeleted={handleDeleted} />
    </div>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20.5 4.7 17 16 5.7a1.5 1.5 0 0 1 2.1 0l1.2 1.2a1.5 1.5 0 0 1 0 2.1L8 20.3l-4 .2Z" />
    </svg>
  );
}
