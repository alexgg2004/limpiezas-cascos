import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { clientesApi } from '../../api/clientes';
import type { ClienteResponseDto } from '../../types';

interface Props {
  open: boolean;
  cliente: ClienteResponseDto | null; // null = nuevo cliente
  onClose: () => void;
  onSaved: (cliente: ClienteResponseDto) => void;
}

const VACIO = { nombre: '', nifCif: '', telefono: '', email: '' };

export function ClienteFormModal({ open, cliente, onClose, onSaved }: Props) {
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        cliente
          ? {
              nombre: cliente.nombre,
              nifCif: cliente.nifCif ?? '',
              telefono: cliente.telefono ?? '',
              email: cliente.email ?? '',
            }
          : VACIO,
      );
      setError(null);
    }
  }, [open, cliente]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const dto = {
        nombre: form.nombre.trim(),
        nifCif: form.nifCif.trim() || undefined,
        telefono: form.telefono.trim() || undefined,
        email: form.email.trim() || undefined,
      };
      const guardado = cliente ? await clientesApi.actualizar(cliente.id, dto) : await clientesApi.crear(dto);
      onSaved(guardado);
      onClose();
    } catch {
      setError('No se ha podido guardar el cliente. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cliente ? 'Editar cliente' : 'Nuevo cliente'}
      subtitle={cliente ? 'Actualiza los datos de este cliente.' : 'Añade un nuevo cliente a tu cartera.'}
    >
      <form onSubmit={handleSubmit}>
        <label className="field">
          <span>
            Nombre <span className="field__required">*</span>
          </span>
          <input
            type="text"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej. Residencial Los Álamos"
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>NIF / CIF</span>
            <input type="text" value={form.nifCif} onChange={(e) => setForm({ ...form, nifCif: e.target.value })} placeholder="B12345678" />
          </label>
          <label className="field">
            <span>Teléfono</span>
            <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="912 345 678" />
          </label>
        </div>

        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contacto@empresa.es" />
        </label>

        {error && <div className="form-error-banner">{error}</div>}

        <div className="modal-card__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Guardando...' : cliente ? 'Guardar cambios' : 'Guardar cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
