import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { MapaUbicacion } from '../ui/MapaUbicacion';
import { AsignadosSelector } from './AsignadosSelector';
import { serviciosApi } from '../../api/servicios';
import { sitiosApi } from '../../api/sitios';
import { facturasApi } from '../../api/facturas';
import type { EstadoServicio, FacturaInfoResponseDto, ServicioResponseDto, SitioLimpiezaResponseDto } from '../../types';

interface Props {
  open: boolean;
  servicio: ServicioResponseDto | null; // null = nuevo servicio
  sitioFijo?: number;
  fechaInicial?: string; // prefill al crear (p.ej. al pulsar un día del calendario)
  onClose: () => void;
  onSaved: (servicio: ServicioResponseDto) => void;
}

const ESTADOS: { valor: EstadoServicio; label: string }[] = [
  { valor: 'PENDIENTE', label: 'Pendiente' },
  { valor: 'REALIZADO', label: 'Realizado' },
  { valor: 'CANCELADO', label: 'Cancelado' },
];

export function ServicioFormModal({ open, servicio, sitioFijo, fechaInicial, onClose, onSaved }: Props) {
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

  const [facturasExistentes, setFacturasExistentes] = useState<FacturaInfoResponseDto[]>([]);
  const [archivosNuevos, setArchivosNuevos] = useState<File[]>([]);
  const [borrandoFacturaId, setBorrandoFacturaId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    sitiosApi.listar().then(setSitios).catch(() => setSitios([]));
    setArchivosNuevos([]);

    if (servicio) {
      setSitioId(String(servicio.sitioId));
      setFecha(servicio.fecha);
      setHoras(servicio.horas != null ? String(servicio.horas) : '');
      setPrecioHora(servicio.precioHora != null ? String(servicio.precioHora) : '');
      setEstado(servicio.estado);
      setObservaciones(servicio.observaciones ?? '');
      setAsignadosIds(servicio.asignados.map((a) => a.id));
      setFacturasExistentes(servicio.facturas);
    } else {
      setSitioId(sitioFijo ? String(sitioFijo) : '');
      setFecha(fechaInicial ?? '');
      setHoras('');
      setPrecioHora('');
      setEstado('PENDIENTE');
      setObservaciones('');
      setAsignadosIds([]);
      setFacturasExistentes([]);
    }
    setError(null);
  }, [open, servicio, sitioFijo, fechaInicial]);

  const sitioSeleccionado = sitios.find((s) => String(s.id) === sitioId) ?? null;

  const totalCalculado = useMemo(() => {
    const h = Number(horas);
    const p = Number(precioHora);
    if (!horas || !precioHora || Number.isNaN(h) || Number.isNaN(p)) return null;
    return h * p;
  }, [horas, precioHora]);

  function agregarArchivos(e: ChangeEvent<HTMLInputElement>) {
    const seleccionados = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (seleccionados.length > 0) {
      setArchivosNuevos((prev) => [...prev, ...seleccionados]);
    }
  }

  function quitarArchivoNuevo(index: number) {
    setArchivosNuevos((prev) => prev.filter((_, i) => i !== index));
  }

  async function eliminarFacturaExistente(facturaId: number) {
    if (!servicio) return;
    setBorrandoFacturaId(facturaId);
    try {
      await facturasApi.eliminar(servicio.id, facturaId);
      setFacturasExistentes((prev) => prev.filter((f) => f.id !== facturaId));
    } catch {
      setError('No se ha podido eliminar la factura.');
    } finally {
      setBorrandoFacturaId(null);
    }
  }

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
      let guardado = servicio ? await serviciosApi.actualizar(servicio.id, dto) : await serviciosApi.crear(dto);

      for (const archivo of archivosNuevos) {
        await facturasApi.subir(guardado.id, archivo);
      }
      if (archivosNuevos.length > 0) {
        guardado = await serviciosApi.obtenerPorId(guardado.id);
      }

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

        <div className="field">
          <span>Facturas</span>

          {facturasExistentes.length > 0 && (
            <div className="factura-lista">
              {facturasExistentes.map((f) => (
                <div key={f.id} className="factura-lista__item">
                  <FacturaIcono />
                  <span className="factura-lista__nombre" title={f.nombreOriginal}>
                    {f.nombreOriginal}
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => eliminarFacturaExistente(f.id)}
                    disabled={borrandoFacturaId === f.id}
                    aria-label="Eliminar factura"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          {archivosNuevos.length > 0 && (
            <div className="factura-lista">
              {archivosNuevos.map((archivo, i) => (
                <div key={`${archivo.name}-${i}`} className="factura-lista__item factura-lista__item--pendiente">
                  <FacturaIcono />
                  <span className="factura-lista__nombre" title={archivo.name}>
                    {archivo.name}
                  </span>
                  <span className="factura-lista__badge">Se subirá al guardar</span>
                  <button type="button" className="icon-btn" onClick={() => quitarArchivoNuevo(i)} aria-label="Quitar archivo">
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="btn btn--ghost" style={{ marginTop: 8 }} onClick={() => fileInputRef.current?.click()}>
            Añadir factura
          </button>
          <input ref={fileInputRef} type="file" accept="application/pdf,image/*" multiple style={{ display: 'none' }} onChange={agregarArchivos} />
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

function FacturaIcono() {
  return (
    <div className="factura-lista__icono">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal-dark)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 4h6l5 5v11H8z" />
        <path d="M14 4v5h5" />
      </svg>
    </div>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-.8 12.2A2 2 0 0 1 14.2 21H9.8a2 2 0 0 1-2-1.8L7 7" />
    </svg>
  );
}
