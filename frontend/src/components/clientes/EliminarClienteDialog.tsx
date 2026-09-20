import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { clientesApi } from '../../api/clientes';
import type { ClienteResponseDto } from '../../types';

interface Props {
  cliente: ClienteResponseDto | null;
  onClose: () => void;
  onDeleted: (id: number) => void;
}

export function EliminarClienteDialog({ cliente, onClose, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!cliente) return;
    setLoading(true);
    setError(null);
    try {
      await clientesApi.eliminar(cliente.id);
      onDeleted(cliente.id);
      onClose();
    } catch {
      setError('No se ha podido eliminar. Comprueba que no tenga sitios de limpieza asociados.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmDialog
      open={cliente !== null}
      title="¿Eliminar cliente?"
      message={`Esta acción no se puede deshacer. Se eliminará «${cliente?.nombre ?? ''}» y no podrá recuperarse.`}
      loading={loading}
      error={error}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
