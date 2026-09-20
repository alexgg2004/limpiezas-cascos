import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { sitiosApi } from '../../api/sitios';
import type { ClienteResponseDto, SitioLimpiezaResponseDto } from '../../types';

interface Props {
  open: boolean;
  cliente: ClienteResponseDto | null;
  onClose: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

export function ClienteDetalleModal({ open, cliente, onClose, onEditar, onEliminar }: Props) {
  const [sitios, setSitios] = useState<SitioLimpiezaResponseDto[]>([]);
  const [loadingSitios, setLoadingSitios] = useState(true);

  useEffect(() => {
    if (!open || !cliente) return;
    setLoadingSitios(true);
    sitiosApi
      .listar()
      .then((todos) => setSitios(todos.filter((s) => s.clienteId === cliente.id)))
      .catch(() => setSitios([]))
      .finally(() => setLoadingSitios(false));
  }, [open, cliente]);

  if (!cliente) return null;

  const iniciales = cliente.nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <Modal open={open} onClose={onClose} title="" width={560}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--teal-100)',
            color: 'var(--teal-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {iniciales}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18.5, color: 'var(--ink)' }}>{cliente.nombre}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>{cliente.nifCif || 'Sin NIF/CIF registrado'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: 'var(--bg)', borderRadius: 12, marginBottom: 22 }}>
        <DetalleLinea label="Email" valor={cliente.email} />
        <DetalleLinea label="Teléfono" valor={cliente.telefono} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Sitios de limpieza</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 26 }}>
        {loadingSitios && <div className="state-message">Cargando sitios...</div>}
        {!loadingSitios && sitios.length === 0 && <div className="state-message">Este cliente todavía no tiene sitios de limpieza.</div>}
        {!loadingSitios &&
          sitios.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', border: '1px solid var(--line)', borderRadius: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal-dark)" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 21s7-7.4 7-12.4a7 7 0 1 0-14 0C5 13.6 12 21 12 21Z" />
                <circle cx="12" cy="8.6" r="2.4" />
              </svg>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{s.nombreDescriptivo}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {[s.direccion, s.ciudad].filter(Boolean).join(', ') || 'Sin dirección'}
                </div>
              </div>
            </div>
          ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red-text)', cursor: 'pointer' }} onClick={onEliminar}>
          Eliminar cliente
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="btn btn--primary" onClick={onEditar}>
            Editar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DetalleLinea({ label, valor }: { label: string; valor: string | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'var(--ink-2)', width: 70, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13.5, color: valor ? 'var(--ink)' : 'var(--ink-3)' }}>{valor || 'No indicado'}</span>
    </div>
  );
}
