import './MapaUbicacion.css';

interface Props {
  lat: number | null;
  lng: number | null;
  editable?: boolean;
  height?: number;
}

/**
 * Vista previa de la ubicación de un sitio. No embebe Google Maps en vivo
 * (eso exigiría una API key de Google Maps JavaScript API) — es un marcador
 * visual con las coordenadas y un enlace real que abre la ubicación en
 * Google Maps en una pestaña nueva.
 */
export function MapaUbicacion({ lat, lng, editable = false, height = 180 }: Props) {
  const tieneCoordenadas = lat != null && lng != null;
  const url = tieneCoordenadas ? `https://www.google.com/maps?q=${lat},${lng}` : undefined;

  return (
    <div className="mapa-ubicacion" style={{ height }}>
      <div className="mapa-ubicacion__zoom">
        <div className="mapa-ubicacion__zoom-btn">+</div>
        <div className="mapa-ubicacion__zoom-btn">−</div>
      </div>

      {editable && (
        <div className="mapa-ubicacion__hint">Introduce las coordenadas para ubicar el sitio</div>
      )}

      {tieneCoordenadas ? (
        <div className="mapa-ubicacion__pin">
          <svg width="30" height="30" viewBox="0 0 28 24">
            <path d="M14 2c4.6 6.3 8 10.9 8 15A8 8 0 1 1 6 17c0-4.1 3.4-8.7 8-15Z" fill="var(--teal)" />
            <circle cx="14" cy="11.5" r="3.4" fill="#fff" />
          </svg>
        </div>
      ) : (
        <div className="mapa-ubicacion__empty">Sin coordenadas todavía</div>
      )}

      {tieneCoordenadas && (
        <div className="mapa-ubicacion__coords">
          {lat!.toFixed(4)}, {lng!.toFixed(4)}
        </div>
      )}

      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="mapa-ubicacion__link">
          Abrir en Google Maps
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      )}
    </div>
  );
}
