import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { MapaUbicacion } from '../ui/MapaUbicacion';
import { sitiosApi } from '../../api/sitios';
import { clientesApi } from '../../api/clientes';
import type { ClienteResponseDto, SitioLimpiezaResponseDto } from '../../types';

interface Props {
  open: boolean;
  sitio: SitioLimpiezaResponseDto | null; // null = nuevo sitio
  clienteFijo?: number; // si se abre desde el detalle de un cliente concreto
  onClose: () => void;
  onSaved: (sitio: SitioLimpiezaResponseDto) => void;
}

const VACIO = {
  nombreDescriptivo: '',
  direccion: '',
  codigoPostal: '',
  ciudad: '',
  latitud: '',
  longitud: '',
  instruccionesAcceso: '',
  clienteId: '',
};

export function SitioFormModal({ open, sitio, clienteFijo, onClose, onSaved }: Props) {
  const [form, setForm] = useState(VACIO);
  const [clientes, setClientes] = useState<ClienteResponseDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      clientesApi.listar().then(setClientes).catch(() => setClientes([]));
      setForm(
        sitio
          ? {
              nombreDescriptivo: sitio.nombreDescriptivo,
              direccion: sitio.direccion ?? '',
              codigoPostal: sitio.codigoPostal ?? '',
              ciudad: sitio.ciudad ?? '',
              latitud: String(sitio.latitud),
              longitud: String(sitio.longitud),
              instruccionesAcceso: sitio.instruccionesAcceso ?? '',
              clienteId: String(sitio.clienteId),
            }
          : { ...VACIO, clienteId: clienteFijo ? String(clienteFijo) : '' },
      );
      setError(null);
    }
  }, [open, sitio, clienteFijo]);

  const lat = form.latitud.trim() !== '' ? Number(form.latitud) : null;
  const lng = form.longitud.trim() !== '' ? Number(form.longitud) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const latitud = Number(form.latitud);
    const longitud = Number(form.longitud);
    const clienteId = Number(form.clienteId);

    if (!form.clienteId || Number.isNaN(clienteId)) {
      setError('Selecciona el cliente al que pertenece este sitio.');
      return;
    }
    if (form.latitud.trim() === '' || form.longitud.trim() === '' || Number.isNaN(latitud) || Number.isNaN(longitud)) {
      setError('Introduce una latitud y una longitud válidas.');
      return;
    }

    setLoading(true);
    try {
      const dto = {
        nombreDescriptivo: form.nombreDescriptivo.trim(),
        direccion: form.direccion.trim() || undefined,
        codigoPostal: form.codigoPostal.trim() || undefined,
        ciudad: form.ciudad.trim() || undefined,
        latitud,
        longitud,
        instruccionesAcceso: form.instruccionesAcceso.trim() || undefined,
        clienteId,
      };
      const guardado = sitio ? await sitiosApi.actualizar(sitio.id, dto) : await sitiosApi.crear(dto);
      onSaved(guardado);
      onClose();
    } catch {
      setError('No se ha podido guardar el sitio. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={sitio ? 'Editar sitio de limpieza' : 'Nuevo sitio de limpieza'}
      subtitle={sitio ? 'Actualiza los datos de este sitio.' : 'Añade un nuevo local o vivienda a limpiar.'}
      width={560}
    >
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>
            Cliente <span className="field__required">*</span>
          </span>
          <select value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })} disabled={!!clienteFijo}>
            <option value="">Selecciona un cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>
            Nombre descriptivo <span className="field__required">*</span>
          </span>
          <input
            type="text"
            required
            value={form.nombreDescriptivo}
            onChange={(e) => setForm({ ...form, nombreDescriptivo: e.target.value })}
            placeholder="Ej. Portal A, Local principal..."
          />
        </label>

        <label className="field">
          <span>Dirección</span>
          <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Calle, número..." />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Código postal</span>
            <input type="text" value={form.codigoPostal} onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })} placeholder="28001" />
          </label>
          <label className="field">
            <span>Ciudad</span>
            <input type="text" value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} placeholder="Madrid" />
          </label>
        </div>

        <div className="field" style={{ marginBottom: 12 }}>
          <span>
            Ubicación <span className="field__required">*</span>
          </span>
          <MapaUbicacion lat={lat} lng={lng} editable height={170} />
        </div>

        <div className="field-row">
          <label className="field">
            <span>Latitud</span>
            <input type="text" inputMode="decimal" value={form.latitud} onChange={(e) => setForm({ ...form, latitud: e.target.value })} placeholder="40.4168" />
          </label>
          <label className="field">
            <span>Longitud</span>
            <input type="text" inputMode="decimal" value={form.longitud} onChange={(e) => setForm({ ...form, longitud: e.target.value })} placeholder="-3.7038" />
          </label>
        </div>

        <label className="field">
          <span>Instrucciones de acceso</span>
          <textarea
            rows={3}
            value={form.instruccionesAcceso}
            onChange={(e) => setForm({ ...form, instruccionesAcceso: e.target.value })}
            placeholder="Portero automático, ubicación de llaves, horario de acceso..."
          />
        </label>

        {error && <div className="form-error-banner">{error}</div>}

        <div className="modal-card__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Guardando...' : sitio ? 'Guardar cambios' : 'Crear sitio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
