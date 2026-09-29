# Limpiezas Cascos — Frontend

Aplicación web (React + TypeScript + Vite) para la gestión de clientes, sitios de limpieza y partes de servicio. Consume la API del backend Spring Boot que vive en [`../backend`](../backend).

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no corre en localhost:8080
npm run dev
```

El backend debe estar levantado (`docker-compose up` en la raíz del repo, o ejecutando la app Spring Boot) para que el login y las páginas de datos funcionen.

### Login con Google (acceso restringido)

Solo las cuentas de Google que estén en la lista blanca del backend pueden entrar. Pasos:

1. En [Google Cloud Console → Credenciales](https://console.cloud.google.com/apis/credentials),
   crea un **ID de cliente de OAuth 2.0** de tipo "Aplicación web". En
   "Orígenes autorizados de JavaScript" añade `http://localhost:5173` (y el
   dominio real cuando despliegues). No hace falta "URI de redirección".
2. Copia el Client ID y ponlo en **ambos** sitios (deben coincidir):
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID=...`
   - `.env` en la raíz del repo (lo lee el backend) → `GOOGLE_CLIENT_ID=...`
3. En el mismo `.env` de la raíz, añade los correos autorizados en
   `GOOGLE_ALLOWED_EMAILS=persona1@gmail.com,persona2@gmail.com` (separados por
   coma, sin espacios necesarios — se normalizan). Si la lista está vacía,
   **nadie** puede entrar por Google (fallo seguro por defecto).
4. Reinicia el backend para que recoja las variables nuevas.

Quien inicie sesión con una cuenta de Google no incluida en la lista recibe un
403 y ve el mensaje "Tu cuenta de Google no tiene acceso a esta aplicación".
La primera vez que entra alguien autorizado, el backend le crea su `Usuario`
automáticamente (rol `ROLE_USER`); no hace falta registrarlo a mano.

### Google Maps (mapa interactivo y geocodificación)

El componente de ubicación (`MapaUbicacion`) usa Google Maps de verdad — buscar
una dirección con autocompletado, arrastrar el pin, geocodificación automática
de la dirección escrita — en vez de la vista previa estática de antes. Para
activarlo hace falta una API key de **Google Maps JavaScript API** con
**Maps JavaScript API**, **Places API** y **Geocoding API** habilitadas
(exige facturación activada en el proyecto de Google Cloud, aunque el uso
normal de esta app se queda dentro del nivel gratuito mensual):

1. Créala en [console.cloud.google.com/google/maps-apis/credentials](https://console.cloud.google.com/google/maps-apis/credentials).
2. Ponla en `frontend/.env` → `VITE_GOOGLE_MAPS_API_KEY=...`.
3. Reinicia `npm run dev`.

Sin esta clave, `MapaUbicacion` no se rompe: cae a un modo simplificado (sin
mapa interactivo, solo coordenadas + enlace a Google Maps).

### Probar desde otro dispositivo o red (ngrok, túneles)

`vite.config.ts` trae un proxy interno (`/api` → `http://localhost:8080`) y
`allowedHosts: true`. Pensado para exponer **solo** el frontend con un túnel
(`ngrok http 5173`, Cloudflare Tunnel...) sin tener que abrir también el
backend ni tocar CORS: el propio Vite reenvía las llamadas a la API a tu
backend local por dentro. El login con Google no funciona desde un dominio de
túnel salvo que añadas ese origen exacto a "Orígenes de JavaScript
autorizados" en Google Cloud Console — para pruebas puntuales es más simple
usar el registro con email/contraseña.

### Registro con email/contraseña (clave de invitación)

`POST /api/auth/register` (el registro manual con email y contraseña, alternativo
a Google) exige además una `claveInvitacion` que debe coincidir con
`INVITATION_CODE` en el `.env` de la raíz del repo. Si `INVITATION_CODE` está
vacía, el registro queda cerrado del todo (nadie puede crear cuenta por esta
vía). No hay pantalla de registro en el frontend todavía — de momento es un
endpoint pensado para darse de alta a mano (Postman, curl...) o para una futura
pantalla de invitación.

## Estructura

```
src/
  api/            Cliente HTTP (axios) y un módulo por recurso del backend
                   (auth, clientes, sitios, servicios, facturas, usuarios)
  components/
    auth/          ProtectedRoute y GoogleSignInButton (Google Identity Services)
    layout/         Sidebar (menú deslizante en móvil), Topbar, AppLayout
    dashboard/      CalendarioMensual
    clientes/, sitios/, servicios/   Modales de crear/ver/editar/eliminar de cada
                    recurso; servicios/ incluye AsignadosSelector
    ui/             Componentes reutilizables: SearchableSelect (combobox
                    buscable), MapaUbicacion (Google Maps), Modal, EstadoBadge,
                    ConfirmDialog
  context/          AuthContext (sesión JWT) y SearchContext (buscador del Topbar)
  hooks/            useAuth, useSearch
  pages/            Una página por ruta (Login, Dashboard, Clientes, Sitios, Servicios)
  styles/           tokens.css (paleta/tipografía), global.css, components.css, forms.css
  types/            Tipos TS calcados de los DTOs del backend (com.app.dto)
```

## Estado actual

App funcional completa sobre las cuatro pantallas (Dashboard, Clientes, Sitios
de limpieza, Servicios), responsive de escritorio a móvil:

- **Clientes, Sitios y Servicios**: listado en tabla (con scroll horizontal en
  pantallas estrechas) y modales reales de crear/ver/editar/eliminar
  conectadas a la API.
- **Búsqueda y filtros**: buscador de texto libre por pantalla en el Topbar
  (`SearchContext`/`useSearch`) y, en Servicios, filtros adicionales por
  Cliente, Sitio (limitado al cliente elegido) y Asignado a mediante un
  combobox buscable propio (`SearchableSelect`) — cada servicio muestra y se
  puede filtrar también por el cliente dueño de su sitio.
- **Mapa de ubicación real** (`MapaUbicacion`, con `@vis.gl/react-google-maps`):
  en Sitios se geocodifica sola la dirección escrita (ya no se piden
  latitud/longitud a mano), con búsqueda de dirección, arrastrar el pin o clic
  como respaldo manual; en el detalle de Servicios se puede buscar sobre el
  mapa del sitio sin modificar sus datos. Ver [Google Maps](#google-maps-mapa-interactivo-y-geocodificación).
- **Dashboard**: calendario mensual con los servicios reales pintados por
  estado, estadísticas y próximos servicios; crea un servicio pulsando
  cualquier día.
- **Facturas**: varias por servicio, con subida/listado/visualización/borrado
  individual, tanto al crear/editar un servicio como desde su ficha de
  detalle.
- **Responsive**: menú lateral como panel deslizante en pantallas ≤860px,
  tablas con scroll horizontal, modales a pantalla completa tipo hoja inferior
  en móvil, formularios de dos columnas a una sola, y ajustes de rejilla en
  Dashboard/calendario/login. Ver [Notas técnicas](#notas-técnicas).

Rutas disponibles:

| Ruta         | Página     | Protegida |
| ------------ | ---------- | --------- |
| `/login`     | Login      | No        |
| `/`          | Dashboard  | Sí        |
| `/clientes`  | Clientes   | Sí        |
| `/sitios`    | Sitios     | Sí        |
| `/servicios` | Servicios  | Sí        |

## Notas técnicas

- La sesión se guarda como JWT en `localStorage`; el interceptor de axios
  (`src/api/client.ts`) lo añade como cabecera `Authorization` y redirige a
  `/login` si el backend responde `401` **o `403`** — el backend usa `403`
  (no `401`) cuando el token falta, no es válido o ha caducado (`JwtFilter`
  simplemente deja la petición sin autenticar en vez de lanzar un `401`
  explícito), así que hay que tratar ambos como "sesión no válida" o la app se
  queda mostrando errores de carga sin avisar de que hay que volver a entrar.
- Responsive: el punto de corte del menú lateral (panel deslizante en vez de
  fijo) es `860px` (`Sidebar.css`, `AppLayout.css`, `Topbar.css`); ajustes más
  finos de móvil puro usan `640px`/`560px`/`420px` según el componente. Los
  estilos en línea de React **no** responden a media queries — por eso las
  rejillas de detalle (`ServicioDetalleModal`, `SitioDetalleModal`) usan la
  clase compartida `.detail-grid` de `styles/components.css` en vez de
  `style={{ gridTemplateColumns: ... }}`.
- La paleta y tipografías (`src/styles/tokens.css`) están calcadas del diseño
  publicado en Claude Design para mantener consistencia visual.
