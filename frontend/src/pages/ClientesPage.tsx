import { useEffect, useState } from 'react';
import { clientesApi } from '../api/clientes';
import { ClienteFormModal } from '../components/clientes/ClienteFormModal';
import { ClienteDetalleModal } from '../components/clientes/ClienteDetalleModal';
import { EliminarClienteDialog } from '../components/clientes/EliminarClienteDialog';
import type { ClienteResponseDto } from '../types';

export function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<ClienteResponseDto | null>(null);
  const [clienteDetalle, setClienteDetalle] = useState<ClienteResponseDto | null>(null);
  const [clienteEliminando, setClienteEliminando] = useState<ClienteResponseDto | null>(null);

  useEffect(() => {
    clientesApi
      .listar()
      .then(setClientes)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function handleSaved(cliente: ClienteResponseDto) {
    setClientes((prev) => {
      const existe = prev.some((c) => c.id === cliente.id);
      return existe ? prev.map((c) => (c.id === cliente.id ? cliente : c)) : [...prev, cliente];
    });
  }

  function handleDeleted(id: number) {
    setClientes((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Clientes</div>
          <div className="page-subtitle">
            {loading ? 'Cargando...' : `${clientes.length} clientes registrados`}
          </div>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setModalNuevoAbierto(true)}>
          <IconPlus />
          Nuevo cliente
        </button>
      </div>

      <div className="card">
        {loading && <div className="state-message">Cargando clientes...</div>}
        {error && <div className="state-message state-message--error">No se han podido cargar los clientes.</div>}
        {!loading && !error && clientes.length === 0 && (
          <div className="state-message">Todavía no hay clientes registrados.</div>
        )}
        {!loading && !error && clientes.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>NIF / CIF</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>{c.nifCif || '—'}</td>
                  <td>{c.telefono || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" title="Ver detalle" onClick={() => setClienteDetalle(c)}>
                        <IconEye />
                      </button>
                      <button type="button" className="icon-btn" title="Editar" onClick={() => setClienteEditando(c)}>
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

      <ClienteFormModal open={modalNuevoAbierto} cliente={null} onClose={() => setModalNuevoAbierto(false)} onSaved={handleSaved} />

      <ClienteFormModal
        open={clienteEditando !== null}
        cliente={clienteEditando}
        onClose={() => setClienteEditando(null)}
        onSaved={(c) => {
          handleSaved(c);
          setClienteDetalle((actual) => (actual && actual.id === c.id ? c : actual));
        }}
      />

      <ClienteDetalleModal
        open={clienteDetalle !== null}
        cliente={clienteDetalle}
        onClose={() => setClienteDetalle(null)}
        onEditar={() => {
          setClienteEditando(clienteDetalle);
          setClienteDetalle(null);
        }}
        onEliminar={() => {
          setClienteEliminando(clienteDetalle);
          setClienteDetalle(null);
        }}
      />

      <EliminarClienteDialog cliente={clienteEliminando} onClose={() => setClienteEliminando(null)} onDeleted={handleDeleted} />
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
