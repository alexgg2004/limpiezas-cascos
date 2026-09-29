import { useCallback, useEffect, useRef, useState } from 'react';
import { Map, Marker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import './MapaUbicacion.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

// Madrid — centro por defecto cuando todavía no hay coordenadas.
const DEFAULT_CENTER = { lat: 40.4168, lng: -3.7038 };

export type MapaUbicacionMode = 'view' | 'search' | 'edit';

export interface DireccionDetectada {
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
}

interface Props {
  lat: number | null;
  lng: number | null;
  height?: number;
  mode?: MapaUbicacionMode;
  onChange?: (lat: number, lng: number, direccion?: DireccionDetectada) => void;
}

export function MapaUbicacion({ lat, lng, height = 180, mode = 'view', onChange }: Props) {
  if (!GOOGLE_MAPS_API_KEY) {
    return <MapaFallback lat={lat} lng={lng} height={height} mode={mode} />;
  }

  const tieneCoordenadas = lat != null && lng != null;
  const posicion = tieneCoordenadas ? { lat: lat!, lng: lng! } : DEFAULT_CENTER;
  const editable = mode === 'edit';
  const buscable = mode === 'search';

  const handleSitioSeleccionado = useCallback(
    (place: google.maps.places.PlaceResult) => {
      const loc = place.geometry?.location;
      if (!loc) return;
      const detalles = editable ? extraerDireccion(place) : undefined;
      onChange?.(loc.lat(), loc.lng(), detalles);
    },
    [editable, onChange],
  );

  return (
    <div className="mapa-ubicacion" style={{ height }}>
      <Map
        defaultCenter={posicion}
        defaultZoom={tieneCoordenadas ? 16 : 6}
        gestureHandling="greedy"
        disableDefaultUI={false}
        fullscreenControl={false}
        streetViewControl={false}
        mapTypeControl={false}
        clickableIcons={false}
        onClick={
          editable
            ? (e) => {
                if (e.detail.latLng) onChange?.(e.detail.latLng.lat, e.detail.latLng.lng);
              }
            : undefined
        }
      >
        <RecentradorMapa lat={lat} lng={lng} />

        {tieneCoordenadas && (
          <Marker
            position={posicion}
            draggable={editable}
            onDragEnd={(e) => {
              const pos = e.latLng;
              if (pos) onChange?.(pos.lat(), pos.lng());
            }}
          />
        )}
      </Map>

      {buscable && (
        <BuscadorLugar
          placeholder={editable ? 'Buscar dirección...' : 'Buscar en el mapa...'}
          onPlaceSelected={handleSitioSeleccionado}
        />
      )}

      {!tieneCoordenadas && <div className="mapa-ubicacion__empty">Sin coordenadas todavía</div>}

      {tieneCoordenadas && (
        <div className="mapa-ubicacion__coords">
          {lat!.toFixed(4)}, {lng!.toFixed(4)}
        </div>
      )}

      {tieneCoordenadas && (
        <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer" className="mapa-ubicacion__link">
          Abrir en Google Maps
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      )}
    </div>
  );
}

/** Centra suavemente el mapa cuando las coordenadas cambian desde fuera (p.ej. al elegir otro sitio). */
function RecentradorMapa({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  const posicionAnterior = useRef<string | null>(null);

  useEffect(() => {
    if (!map || lat == null || lng == null) return;
    const clave = `${lat},${lng}`;
    if (posicionAnterior.current === clave) return;
    posicionAnterior.current = clave;
    map.panTo({ lat, lng });
    if ((map.getZoom() ?? 0) < 14) map.setZoom(16);
  }, [map, lat, lng]);

  return null;
}

function BuscadorLugar({
  placeholder,
  onPlaceSelected,
}: {
  placeholder: string;
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
}) {
  const placesLib = useMapsLibrary('places');
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;
    const ac = new placesLib.Autocomplete(inputRef.current, {
      fields: ['geometry', 'address_components', 'formatted_address', 'name'],
    });
    setAutocomplete(ac);
    return () => google.maps.event.clearInstanceListeners(ac);
  }, [placesLib]);

  useEffect(() => {
    if (!autocomplete) return;
    const listener = autocomplete.addListener('place_changed', () => {
      onPlaceSelected(autocomplete.getPlace());
      if (inputRef.current) inputRef.current.value = '';
      inputRef.current?.blur();
    });
    return () => listener.remove();
  }, [autocomplete, onPlaceSelected]);

  return (
    <div className="mapa-ubicacion__buscador">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M20 20l-4.8-4.8" />
      </svg>
      <input ref={inputRef} type="text" placeholder={placeholder} />
    </div>
  );
}

function extraerDireccion(place: google.maps.places.PlaceResult): DireccionDetectada {
  const comps = place.address_components ?? [];
  const get = (tipo: string) => comps.find((c) => c.types.includes(tipo))?.long_name;

  const numero = get('street_number');
  const calle = get('route');
  const direccion = [calle, numero].filter(Boolean).join(' ') || place.formatted_address || place.name || undefined;
  const ciudad = get('locality') || get('postal_town') || get('administrative_area_level_2');
  const codigoPostal = get('postal_code');

  return { direccion, ciudad, codigoPostal };
}

function MapaFallback({ lat, lng, height, mode }: { lat: number | null; lng: number | null; height: number; mode: MapaUbicacionMode }) {
  const tieneCoordenadas = lat != null && lng != null;
  const url = tieneCoordenadas ? `https://www.google.com/maps?q=${lat},${lng}` : undefined;

  return (
    <div className="mapa-ubicacion mapa-ubicacion--fallback" style={{ height }}>
      <div className="mapa-ubicacion__hint">
        {mode === 'edit' ? 'Introduce las coordenadas para ubicar el sitio' : 'Configura VITE_GOOGLE_MAPS_API_KEY para el mapa interactivo'}
      </div>

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
