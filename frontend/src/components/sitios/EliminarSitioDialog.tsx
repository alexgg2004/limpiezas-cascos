import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { sitiosApi } from '../../api/sitios';
import type { SitioLimpiezaResponseDto } from '../../types';

interface Props {
  sitio: SitioLimpiezaResponseDto | null;
  onClose: () => void;
  onDeleted: (id: number) => void;
}

export function EliminarSitioDialog({ sitio, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!sitio) return;
    setLoading(true);
    setError(null);
    try {
      await sitiosApi.eliminar(sitio.id);
      onDeleted(sitio.id);
      onClose();
    } catch {
      setError('No se ha podido eliminar. Comprueba que no tenga servicios registrados.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      open={sitio !== null}
      title="¿Eliminar sitio de limpieza?"
      message={`Esta acción no se puede deshacer. Se eliminará «${sitio?.nombreDescriptivo ?? ''}» de ${sitio?.nombreCliente ?? ''}.`}
      loading={loading}
      error={error}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
