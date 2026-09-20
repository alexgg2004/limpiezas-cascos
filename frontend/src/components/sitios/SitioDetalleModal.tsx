import { Modal } from '../ui/Modal';
import { MapaUbicacion } from '../ui/MapaUbicacion';
import type { SitioLimpiezaResponseDto } from '../../types';

interface Props {
  open: boolean;
  sitio: SitioLimpiezaResponseDto | null;
  onClose: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

export function SitioDetalleModal({ open, sitio, onClose, onEditar, onEliminar }: Props) {
  if (!sitio) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={sitio.nombreDescriptivo}
      subtitle={sitio.nombreCliente}
      width={560}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, padding: 16, background: 'var(--bg)', borderRadius: 12, marginBottom: 20 }}>
        <DetalleCampo label="Dirección" valor={sitio.direccion} />
        <DetalleCampo label="C.P." valor={sitio.codigoPostal} />
        <DetalleCampo label="Ciudad" valor={sitio.ciudad} />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="field__label" style={{ marginBottom: 8 }}>
          Ubicación
        </div>
        <MapaUbicacion lat={sitio.latitud} lng={sitio.longitud} height={180} />
      </div>

      <div style={{ marginBottom: 26 }}>
        <div className="field__label" style={{ marginBottom: 8 }}>
          Instrucciones de acceso
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)', background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
          {sitio.instruccionesAcceso || 'Sin instrucciones registradas.'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--red-text)', cursor: 'pointer' }} onClick={onEliminar}>
          Eliminar sitio
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

function DetalleCampo({ label, valor }: { label: string; valor: string | null }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: valor ? 'var(--ink)' : 'var(--ink-3)', fontWeight: 600 }}>{valor || '—'}</div>
    </div>
  );
}
