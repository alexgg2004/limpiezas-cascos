import { useEffect, useState } from 'react';
import { sitiosApi } from '../api/sitios';
import { SitioFormModal } from '../components/sitios/SitioFormModal';
import { SitioDetalleModal } from '../components/sitios/SitioDetalleModal';
import { EliminarSitioDialog } from '../components/sitios/EliminarSitioDialog';
import type { SitioLimpiezaResponseDto } from '../types';

export function SitiosPage() {
  const [sitios, setSitios] = useState<SitioLimpiezaResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [sitioEditando, setSitioEditando] = useState<SitioLimpiezaResponseDto | null>(null);
  const [sitioDetalle, setSitioDetalle] = useState<SitioLimpiezaResponseDto | null>(null);
  const [sitioEliminando, setSitioEliminando] = useState<SitioLimpiezaResponseDto | null>(null);

  useEffect(() => {
    sitiosApi
      .listar()
      .then(setSitios)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(sitio: SitioLimpiezaResponseDto) {
    setSitios((prev) => {
      const existe = prev.some((s) => s.id === sitio.id);
      return existe ? prev.map((s) => (s.id === sitio.id ? sitio : s)) : [...prev, sitio];
    });
  }

  function handleDeleted(id: number) {
    setSitios((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Sitios de limpieza</div>
          <div className="page-subtitle">
            {loading ? 'Cargando...' : `${sitios.length} sitios registrados`}
          </div>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setModalNuevoAbierto(true)}>
          <IconPlus />
          Nuevo sitio
        </button>
      </div>

      <div className="card">
        {loading && <div className="state-message">Cargando sitios...</div>}
        {error && <div className="state-message state-message--error">No se han podido cargar los sitios.</div>}
        {!loading && !error && sitios.length === 0 && (
          <div className="state-message">Todavía no hay sitios de limpieza registrados.</div>
        )}
        {!loading && !error && sitios.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Ciudad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sitios.map((s) => (
                <tr key={s.id}>
                  <td>{s.nombreDescriptivo}</td>
                  <td>{s.nombreCliente}</td>
                  <td>{s.direccion || '—'}</td>
                  <td>{s.ciudad || '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" title="Ver detalle" onClick={() => setSitioDetalle(s)}>
                        <IconEye />
                      </button>
                      <button type="button" className="icon-btn" title="Editar" onClick={() => setSitioEditando(s)}>
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

      <SitioFormModal open={modalNuevoAbierto} sitio={null} onClose={() => setModalNuevoAbierto(false)} onSaved={handleSaved} />

      <SitioFormModal
        open={sitioEditando !== null}
        sitio={sitioEditando}
        onClose={() => setSitioEditando(null)}
        onSaved={(s) => {
          handleSaved(s);
          setSitioDetalle((actual) => (actual && actual.id === s.id ? s : actual));
        }}
      />

      <SitioDetalleModal
        open={sitioDetalle !== null}
        sitio={sitioDetalle}
        onClose={() => setSitioDetalle(null)}
        onEditar={() => {
          setSitioEditando(sitioDetalle);
          setSitioDetalle(null);
        }}
        onEliminar={() => {
          setSitioEliminando(sitioDetalle);
          setSitioDetalle(null);
        }}
      />

      <EliminarSitioDialog sitio={sitioEliminando} onClose={() => setSitioEliminando(null)} onDeleted={handleDeleted} />
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
