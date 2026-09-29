import { useEffect, useState } from 'react';
import { usuariosApi } from '../../api/usuarios';
import type { UsuarioResumenDto } from '../../types';
import './AsignadosSelector.css';

interface Props {
  value: number[];
  onChange: (ids: number[]) => void;
}

export function AsignadosSelector({ value, onChange }: Props) {
  const [usuarios, setUsuarios] = useState<UsuarioResumenDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    usuariosApi
      .listar()
      .then(setUsuarios)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  function toggle(id: number) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  if (loading) {
    return <div className="asignados-selector__state">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="asignados-selector__state asignados-selector__state--error">No se pudo cargar la lista de usuarios.</div>;
  }

  if (usuarios.length === 0) {
    return <div className="asignados-selector__state">No hay usuarios disponibles.</div>;
  }

  return (
    <div className="asignados-selector">
      {usuarios.map((u) => {
        const checked = value.includes(u.id);
        return (
          <label key={u.id} className="asignados-selector__item">
            <input type="checkbox" checked={checked} onChange={() => toggle(u.id)} />
            <div className="asignados-selector__avatar">{iniciales(u.nombreCompleto || u.email)}</div>
            <div className="asignados-selector__info">
              <div className="asignados-selector__name">{u.nombreCompleto || u.email}</div>
              {u.nombreCompleto && <div className="asignados-selector__email">{u.email}</div>}
            </div>
          </label>
        );
      })}
    </div>
  );
}

function iniciales(nombre: string) {
  return (
    nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  );
}
