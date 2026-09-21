import { useMemo, useState } from 'react';
import { fechaLocalIso } from '../../utils/fecha';
import type { EstadoServicio, ServicioResponseDto } from '../../types';
import './CalendarioMensual.css';

interface Props {
  servicios: ServicioResponseDto[];
  onDiaClick?: (fecha: string) => void;
}

interface Dia {
  fecha: string; // yyyy-MM-dd
  dayNum: number;
  enMes: boolean;
  esHoy: boolean;
  chips: { id: number; label: string; estado: EstadoServicio }[];
  extra: number;
}

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function CalendarioMensual({ servicios, onDiaClick }: Props) {
  const ahora = new Date();
  const [año, setAño] = useState(ahora.getFullYear());
  const [mes, setMes] = useState(ahora.getMonth()); // 0-indexado

  const hoyIso = useMemo(() => fechaLocalIso(new Date()), []);

  const serviciosPorDia = useMemo(() => {
    const mapa = new Map<string, ServicioResponseDto[]>();
    for (const s of servicios) {
      const lista = mapa.get(s.fecha) ?? [];
      lista.push(s);
      mapa.set(s.fecha, lista);
    }
    return mapa;
  }, [servicios]);

  const dias: Dia[] = useMemo(() => {
    const primerDelMes = new Date(año, mes, 1);
    const offset = (primerDelMes.getDay() + 6) % 7; // lunes = 0
    const inicio = new Date(año, mes, 1 - offset);

    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      const fecha = fechaLocalIso(d);
      const delDia = serviciosPorDia.get(fecha) ?? [];
      return {
        fecha,
        dayNum: d.getDate(),
        enMes: d.getMonth() === mes,
        esHoy: fecha === hoyIso,
        chips: delDia.slice(0, 2).map((s) => ({ id: s.id, label: s.nombreSitio, estado: s.estado })),
        extra: Math.max(0, delDia.length - 2),
      };
    });
  }, [año, mes, serviciosPorDia, hoyIso]);

  function cambiarMes(delta: number) {
    const d = new Date(año, mes + delta, 1);
    setAño(d.getFullYear());
    setMes(d.getMonth());
  }

  function irAHoy() {
    setAño(ahora.getFullYear());
    setMes(ahora.getMonth());
  }

  return (
    <div className="card calendario">
      <div className="calendario__header">
        <div className="calendario__nav">
          <button type="button" className="icon-btn calendario__nav-btn" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <div className="calendario__mes">
            {MESES[mes]} {año}
          </div>
          <button type="button" className="icon-btn calendario__nav-btn" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <button type="button" className="calendario__hoy" onClick={irAHoy}>
            Hoy
          </button>
        </div>

        <div className="calendario__leyenda">
          <span className="calendario__leyenda-item">
            <span className="calendario__dot calendario__dot--pendiente" />
            Pendiente
          </span>
          <span className="calendario__leyenda-item">
            <span className="calendario__dot calendario__dot--realizado" />
            Realizado
          </span>
          <span className="calendario__leyenda-item">
            <span className="calendario__dot calendario__dot--cancelado" />
            Cancelado
          </span>
        </div>
      </div>

      <div className="calendario__dias-semana">
        {DIAS_SEMANA.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="calendario__grid">
        {dias.map((d) => (
          <div
            key={d.fecha}
            className={`calendario__celda${d.enMes ? '' : ' calendario__celda--fuera'}${d.esHoy ? ' calendario__celda--hoy' : ''}${onDiaClick ? ' calendario__celda--clicable' : ''}`}
            onClick={onDiaClick ? () => onDiaClick(d.fecha) : undefined}
            title={onDiaClick ? 'Añadir servicio este día' : undefined}
          >
            <div className="calendario__numero">{d.dayNum}</div>
            {d.chips.map((c) => (
              <div key={c.id} className={`calendario__chip calendario__chip--${c.estado.toLowerCase()}`} title={c.label}>
                {c.label}
              </div>
            ))}
            {d.extra > 0 && <div className="calendario__extra">+{d.extra} más</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
