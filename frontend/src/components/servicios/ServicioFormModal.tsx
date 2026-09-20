import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { MapaUbicacion } from '../ui/MapaUbicacion';
import { AsignadosSelector } from './AsignadosSelector';
import { serviciosApi } from '../../api/servicios';
import { sitiosApi } from '../../api/sitios';
import type { EstadoServicio, ServicioResponseDto, SitioLimpiezaResponseDto } from '../../types';

interface Props {
  open: boolean;
  servicio: ServicioResponseDto | null; // null = nuevo servicio
  sitioFijo?: number;
  onClose: () => void;
  onSaved: (servicio: ServicioResponseDto) => void;
}

const ESTADOS: { valor: EstadoServicio; label: string }[] = [
  { valor: 'PENDIENTE', label: 'Pendiente' },
  { valor: 'REALIZADO', label: 'Realizado' },
  { valor: 'CANCELADO', label: 'Cancelado' },
];

export function ServicioFormModal({ open, servicio, sitioFijo, onClose, onSaved }: Props) {
  const [sitios, setSitios] = useState<SitioLimpiezaResponseDto[]>([]);
  const [sitioId, setSitioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [horas, setHoras] = useState('');
  const [precioHora, setPrecioHora] = useState('');
  const [estado, setEstado] = useState<EstadoServicio>('PENDIENTE');
  const [observaciones, setObservaciones] = useState('');
  const [asignadosIds, setAsignadosIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    sitiosApi.listar().then(setSitios).catch(() => setSitios([]));

    if (servicio) {
      setSitioId(String(servicio.sitioId));
      setFecha(servicio.fecha);
      setHoras(servicio.horas != null ? String(servicio.horas) : '');
      setPrecioHora(servicio.precioHora != null ? String(servicio.precioHora) : '');
      setEstado(servicio.estado);
      setObservaciones(servicio.observaciones ?? '');
      setAsignadosIds(servicio.asignados.map((a) => a.id));
    } else {
      setSitioId(sitioFijo ? String(sitioFijo) : '');
      setFecha('');
      setHoras('');
      setPrecioHora('');
      setEstado('PENDIENTE');
      setObservaciones('');
      setAsignadosIds([]);
    }
    setError(null);
  }, [open, servicio, sitioFijo]);

  const sitioSeleccionado = sitios.find((s) => String(s.id) === sitioId) ?? null;

  const totalCalculado = useMemo(() => {
    const h = Number(horas);
    const p = Number(precioHora);
    if (!horas || !precioHora || Number.isNaN(h) || Number.isNaN(p)) return null;
    return h * p;
  }, [horas, precioHora]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const sitioIdNum = Number(sitioId);
    if (!sitioId || Number.isNaN(sitioIdNum)) {
      setError('Selecciona el sitio de limpieza donde se realiza el servicio.');
      return;
    }
    if (!fecha) {
      setError('Indica la fecha del servicio.');
      return;
    }

    setLoading(true);
    try {
      const dto = {
        fecha,
        horas: horas.trim() !== '' ? Number(horas) : undefined,
        precioHora: precioHora.trim() !== '' ? Number(precioHora) : undefined,
        observaciones: observaciones.trim() || undefined,
        estado,
        sitioId: sitioIdNum,
        asignadosIds,
      };
      const guardado = servicio ? await serviciosApi.actualizar(servicio.id, dto) : await serviciosApi.crear(dto);
      onSaved(guardado);
      onClose();
    } catch {
      setError('No se ha podido guardar el servicio. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={servicio ? 'Editar servicio' : 'Nuevo servicio'}
      subtitle={servicio ? 'Modifica los datos de este parte de servicio.' : 'Registra un nuevo parte de servicio.'}
      width={560}
    >
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>
            Sitio de limpieza <span className="field__required">*</span>
          </span>
          <select value={sitioId} onChange={(e) => setSitioId(e.target.value)} disabled={!!sitioFijo}>
            <option value="">Selecciona un sitio de limpieza</option>
            {sitios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombreDescriptivo} — {s.nombreCliente}
              </option>
            ))}
          </select>
        </label>

        {sitioSeleccionado && (
          <div className="field" style={{ marginBottom: 20 }}>
            <MapaUbicacion lat={sitioSeleccionado.latitud} lng={sitioSeleccionado.longitud} height={150} />
          </div>
        )}

        <label className="field">
          <span>
            Fecha <span className="field__required">*</span>
          </span>
          <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Horas</span>
            <input type="text" inputMode="decimal" value={horas} onChange={(e) => setHoras(e.target.value)} placeholder="0" />
          </label>
          <label className="field">
            <span>Precio / hora</span>
            <input type="text" inputMode="decimal" value={precioHora} onChange={(e) => setPrecioHora(e.target.value)} placeholder="0,00" />
          </label>
        </div>

        <div className="computed-total">
          <span>Importe total (calculado)</span>
          <span>{totalCalculado != null ? `${totalCalculado.toFixed(2)} €` : '—'}</span>
        </div>

        <div className="field">
          <span>
            Estado <span className="field__required">*</span>
          </span>
          <div className="segmented">
            {ESTADOS.map((e) => (
              <button
                key={e.valor}
                type="button"
                className={`segmented__option${estado === e.valor ? ` segmented__option--active-${e.valor.toLowerCase()}` : ''}`}
                onClick={() => setEstado(e.valor)}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span>Observaciones</span>
          <textarea rows={3} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Añade notas sobre el servicio..." />
        </label>

        <div className="field">
          <span>Asignado a</span>
          <AsignadosSelector value={asignadosIds} onChange={setAsignadosIds} />
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <div className="modal-card__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Guardando...' : servicio ? 'Guardar cambios' : 'Crear servicio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
