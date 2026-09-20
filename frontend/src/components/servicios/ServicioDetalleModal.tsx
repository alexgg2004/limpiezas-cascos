import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Modal } from '../ui/Modal';
import { MapaUbicacion } from '../ui/MapaUbicacion';
import { EstadoBadge } from '../ui/EstadoBadge';
import { facturasApi } from '../../api/facturas';
import { sitiosApi } from '../../api/sitios';
import type { ServicioResponseDto, SitioLimpiezaResponseDto } from '../../types';

interface Props {
  open: boolean;
  servicio: ServicioResponseDto | null;
  onClose: () => void;
  onEditar: () => void;
  onEliminar: () => void;
  onFacturaSubida: (servicio: ServicioResponseDto) => void;
}

export function ServicioDetalleModal({ open, servicio, onClose, onEditar, onEliminar, onFacturaSubida }: Props) {
  const [sitio, setSitio] = useState<SitioLimpiezaResponseDto | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorFactura, setErrorFactura] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !servicio) return;
    setSitio(null);
    sitiosApi
      .obtenerPorId(servicio.sitioId)
      .then(setSitio)
      .catch(() => setSitio(null));
  }, [open, servicio]);

  if (!servicio) return null;

  async function verFactura() {
    if (!servicio) return;
    try {
      const url = await facturasApi.obtenerUrlVisualizacion(servicio.id);
      window.open(url, '_blank', 'noopener');
    } catch {
      setErrorFactura('No se ha podido abrir la factura.');
    }
  }

  async function subirFactura(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = '';
    if (!archivo || !servicio) return;
    setSubiendo(true);
    setErrorFactura(null);
    try {
      await facturasApi.subir(servicio.id, archivo);
      onFacturaSubida({ ...servicio, tieneFacturaAdjunta: true });
    } catch {
      setErrorFactura('No se ha podido subir la factura.');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} width={580}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--teal-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-dark)" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="12" height="17" rx="2" />
              <rect x="9" y="2.4" width="6" height="3" rx="1" />
              <path d="M9 11.5h6M9 15h6" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>{servicio.nombreSitio}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>{sitio?.nombreCliente ?? ''}</div>
          </div>
        </div>
        <EstadoBadge estado={servicio.estado} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 16, background: 'var(--bg)', borderRadius: 12, marginBottom: 20 }}>
        <DetalleCampo label="Fecha" valor={servicio.fecha} />
        <DetalleCampo label="Horas" valor={servicio.horas != null ? `${servicio.horas} h` : '—'} />
        <DetalleCampo label="Precio / hora" valor={servicio.precioHora != null ? `${servicio.precioHora.toFixed(2)} €` : '—'} />
        <DetalleCampo
          label="Importe total"
          valor={servicio.totalImporte != null ? `${servicio.totalImporte.toFixed(2)} €` : '—'}
          destacado
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="field__label" style={{ marginBottom: 8 }}>
          Observaciones
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)', background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
          {servicio.observaciones || 'Sin observaciones.'}
        </div>
      </div>

      {sitio && (
        <div style={{ marginBottom: 20 }}>
          <div className="field__label" style={{ marginBottom: 8 }}>
            Sitio
          </div>
          <MapaUbicacion lat={sitio.latitud} lng={sitio.longitud} height={150} />
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <div className="field__label" style={{ marginBottom: 8 }}>
          Asignado a
        </div>
        {servicio.asignados.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Sin asignar</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {servicio.asignados.map((u) => (
              <span
                key={u.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 999,
                  background: 'var(--teal-100)',
                  color: 'var(--teal-dark)',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                {u.nombreCompleto || u.email}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 26 }}>
        <div className="field__label" style={{ marginBottom: 8 }}>
          Factura adjunta
        </div>
        {servicio.tieneFacturaAdjunta ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', border: '1px solid var(--line)', borderRadius: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--teal-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal-dark)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 4h6l5 5v11H8z" />
                <path d="M14 4v5h5" />
              </svg>
            </div>
            <div style={{ flexGrow: 1, fontSize: 13, color: 'var(--ink)' }}>Factura subida</div>
            <button type="button" className="btn btn--ghost" style={{ padding: '7px 12px', fontSize: 12.5 }} onClick={verFactura}>
              Ver
            </button>
            <button type="button" className="btn btn--ghost" style={{ padding: '7px 12px', fontSize: 12.5 }} onClick={() => fileInputRef.current?.click()} disabled={subiendo}>
              Reemplazar
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn--ghost" onClick={() => fileInputRef.current?.click()} disabled={subiendo}>
            {subiendo ? 'Subiendo...' : 'Subir factura'}
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="application/pdf,image/*" style={{ display: 'none' }} onChange={subirFactura} />
        {errorFactura && <div className="field-error">{errorFactura}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red-text)', cursor: 'pointer' }} onClick={onEliminar}>
          Eliminar servicio
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cerrar
          </button>
          <button type="button" className="btn btn--primary" onClick={onEditar}>
            Editar servicio
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DetalleCampo({ label, valor, destacado }: { label: string; valor: string; destacado?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: destacado ? 16 : 14, fontWeight: destacado ? 800 : 600, color: destacado ? 'var(--teal-dark)' : 'var(--ink)' }}>{valor}</div>
    </div>
  );
}
