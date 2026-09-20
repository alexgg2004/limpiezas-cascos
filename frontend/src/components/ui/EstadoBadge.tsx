import type { EstadoServicio } from '../../types';
import './EstadoBadge.css';

const LABELS: Record<EstadoServicio, string> = {
  PENDIENTE: 'Pendiente',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
};

export function EstadoBadge({ estado }: { estado: EstadoServicio }) {
  return (
    <span className={`estado-badge estado-badge--${estado.toLowerCase()}`}>
      <span className="estado-badge__dot" />
      {LABELS[estado]}
    </span>
  );
}
