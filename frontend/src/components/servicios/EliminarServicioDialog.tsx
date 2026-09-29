import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { serviciosApi } from '../../api/servicios';
import type { ServicioResponseDto } from '../../types';

interface Props {
  servicio: ServicioResponseDto | null;
  onClose: () => void;
  onDeleted: (id: number) => void;
}

export function EliminarServicioDialog({ servicio, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!servicio) return;
    setLoading(true);
    setError(null);
    try {
      await serviciosApi.eliminar(servicio.id);
      onDeleted(servicio.id);
      onClose();
    } catch {
      setError('No se ha podido eliminar el servicio.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      open={servicio !== null}
      title="¿Eliminar servicio?"
      message={`Esta acción no se puede deshacer. Se eliminará el parte de servicio de «${servicio?.nombreSitio ?? ''}» del ${servicio?.fecha ?? ''}, junto con su factura adjunta si la tuviera.`}
      loading={loading}
      error={error}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
