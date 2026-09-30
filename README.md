# Limpiezas Cascos

Aplicación interna de gestión para una empresa de limpieza: clientes, sitios de limpieza y partes de servicio (con factura adjunta y operarios asignados). Acceso restringido — solo entran las cuentas de Google en una lista blanca, o cuentas con email/contraseña dadas de alta con una clave de invitación.

## Estructura del repositorio

```
limpiezas-cascos/
├── backend/     API REST en Spring Boot 3 + PostgreSQL — ver backend/README.md
├── frontend/    Web en React + TypeScript + Vite — ver frontend/README.md
├── docker-compose.yml   Levanta backend + PostgreSQL
└── .env         Variables de entorno para docker-compose (no se sube a git)
```

## Puesta en marcha rápida

```bash
# 1. Backend + base de datos (desde la raíz del repo)
docker compose up -d --build

# 2. Frontend (en otra terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Documentación específica de cada parte:

- **[backend/README.md](backend/README.md)** — referencia completa de la API, modelo de datos, seguridad y variables de entorno.
- **[frontend/README.md](frontend/README.md)** — estructura del proyecto React, cómo configurar el login con Google y estado actual de las pantallas.

## Estado actual

- **Backend**: API completa para clientes, sitios de limpieza y servicios (CRUD), varias facturas adjuntas por servicio (guardadas en Backblaze B2, compatible con S3), servicios asignables a varios usuarios y filtrables por cliente, y todos los datos visibles para cualquier usuario autenticado (no hay aislamiento por propietario). Login con Google restringido por lista blanca gestionable en caliente (tabla, no variable de entorno) + login con email/contraseña restringido por clave de invitación.
- **Frontend**: rutas y layout completos (Dashboard, Clientes, Sitios de limpieza, Servicios), responsive de escritorio a móvil, con modales reales de crear/ver/editar/eliminar conectadas a la API en los tres recursos, selector de operarios asignados, y un mapa de ubicación real de Google Maps (búsqueda de dirección, geocodificación automática, arrastrar el pin) en vez de la vista previa estática inicial. El Dashboard incluye un calendario mensual con los servicios reales, y permite crear un servicio pulsando cualquier día. Un servicio puede tener varias facturas adjuntas (guardadas en Backblaze B2, no en disco local), añadibles tanto al crear/editar como desde su ficha de detalle. La lista de Servicios tiene filtros reales (combobox buscable) por Cliente, Sitio y usuario asignado, y cada servicio muestra el cliente dueño de su sitio.

## Novedades

Cambios más recientes primero.

- **2026-10-01** — Cambiado el almacenamiento de facturas de Cloudflare R2 a **Backblaze B2**: R2 exige tarjeta de crédito para activarlo aunque te quedes dentro del tramo gratis, B2 no. Mismo `FileStorageService` (sigue siendo el SDK genérico de S3, solo cambian endpoint/región/credenciales) — variables de entorno renombradas de `R2_*` a `B2_ENDPOINT`/`B2_REGION`/`B2_KEY_ID`/`B2_APPLICATION_KEY`/`B2_BUCKET_NAME`.
- **2026-09-29** — Diseño responsive para móvil en todo el frontend: el menú lateral pasa a ser un panel deslizante con overlay en pantallas ≤860px (con botón de hamburguesa en el Topbar), las tablas de Clientes/Sitios/Servicios tienen scroll horizontal en vez de desbordar, los modales se comportan como una hoja inferior a pantalla completa en móvil, los formularios de dos columnas pasan a una sola, y el Dashboard/calendario/login ajustan su rejilla. De paso moví los estilos en línea de las rejillas de detalle (`ServicioDetalleModal`, `SitioDetalleModal`) a una clase CSS compartida (`.detail-grid`), porque el `style={{...}}` de React no puede responder a media queries.
- **2026-09-29** — Las facturas adjuntas se guardan en **Cloudflare R2** (compatible con S3) en vez de en disco local del contenedor — necesario para poder desplegar en plataformas sin disco persistente sin perder los archivos en cada redeploy. `FileStorageService` reescrito con el SDK de S3 (`software.amazon.awssdk:s3`); nuevas variables de entorno `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`. Sin configurar, la app sigue arrancando (falla solo si de verdad subes/ves/borras una factura), igual que ya pasaba con el login de Google sin configurar.
- **2026-09-24** — Corregido un bug real de sesión: el backend responde `403` (no `401`) cuando el JWT falta, no es válido o ha caducado, pero el interceptor de axios del frontend solo reaccionaba al `401` — la app se quedaba "colgada", logueada en apariencia pero mostrando errores de carga en cada pantalla, sin mandar nunca de vuelta al login. Ahora el interceptor trata ambos códigos igual.
- **2026-09-23** — Mapa de ubicación real de Google Maps (`@vis.gl/react-google-maps`), en vez de la vista previa estática con enlace de antes. En Sitios, la dirección escrita se geocodifica sola (ya no se piden latitud/longitud a mano), con búsqueda por dirección, arrastrar el pin o clic como respaldo manual; en el detalle de Servicios se puede buscar sobre el mapa del sitio sin modificar sus datos. Necesita `VITE_GOOGLE_MAPS_API_KEY`; sin ella cae a un modo simplificado sin romper nada.
- **2026-09-22** — Servicios asociados a su Cliente (antes solo a su Sitio): `ServicioResponseDto` añade `clienteId`/`nombreCliente` (derivado del sitio, no es un campo propio). La lista de Servicios ganó filtros reales por Cliente, Sitio (limitado al cliente elegido) y Asignado a, con un combobox buscable propio (`SearchableSelect`) en vez de un `<select>` nativo.
- **2026-09-20** — Varias facturas por servicio (antes solo una, se sustituía al subir otra): cambié la relación `Servicio`↔`FacturaAdjunta` de 1:1 a 1:N (incluyendo quitar a mano la restricción `UNIQUE` que quedaba en la base de datos — `ddl-auto=update` no la elimina sola) y los endpoints pasaron a `/api/servicios/{id}/facturas` (listar, añadir, ver una, borrar una). Aproveché para quitar código muerto en `ServicioService` que ya no usaba nadie (`subirFactura`, `descargarFactura`, la columna `rutaFactura`) — la subida real siempre había ido por `FacturaAdjuntaController`. En el frontend: se puede añadir factura(s) tanto al crear/editar un servicio como desde su ficha de detalle, con lista, "Ver" y eliminar por factura. También añadí un filtro real (no solo visual) por usuario asignado en la lista de Servicios, y ahora se puede crear un servicio pulsando cualquier día del calendario del Dashboard (abre la modal de "Nuevo servicio" con esa fecha ya puesta).
- **2026-09-20** — Calendario mensual en el Dashboard (`CalendarioMensual`), con los servicios reales pintados en su día y coloreados por estado. De paso arreglé un bug real: el "hoy" se calculaba con `Date.toISOString()` (UTC), que se desincroniza de la fecha local cerca de la medianoche según el huso horario — ahora hay un helper (`fechaLocalIso`) que usa el calendario local, como el resto de la app.
- **2026-09-20** — Reestructuración del repositorio: todo el backend se movió a `backend/` (antes vivía en la raíz), manteniendo `frontend/` y `docker-compose.yml` como están. Solo cambiaron las rutas de build/volumen en `docker-compose.yml`.
- **2026-09-20** — Modales reales conectadas a la API en Clientes, Sitios y Servicios (crear, ver detalle, editar, eliminar), con selector de operarios asignados (`AsignadosSelector`) y componente de vista previa de ubicación con enlace real a Google Maps. Añadidos los endpoints `PUT`/`DELETE` de clientes y `DELETE` de sitios/servicios que faltaban para que las modales de eliminar funcionaran.
- **2026-09-20** — Visibilidad de datos compartida entre todos los usuarios (antes cada usuario solo veía lo que él mismo había creado). Los servicios ahora se pueden asignar a uno o varios usuarios, y esa asignación se ve al consultar el servicio.
- **2026-09-20** — Registro con email/contraseña restringido con una clave de invitación (`INVITATION_CODE`); sin ella configurada, el registro queda cerrado por defecto.
- **2026-09-20** — Login con Google restringido a una lista blanca de correos. La lista se movió de una variable de entorno a una tabla en base de datos (`correos_permitidos`), gestionable vía API sin reiniciar el backend.
- **2026-09-20** — Scaffold inicial del frontend: Vite + React + TypeScript, routing, capa de API tipada, autenticación JWT persistida, layout (Sidebar/Topbar) y páginas de listado conectadas a la API real.
- **2026-09-10** — Diseño visual completo: pantallas (Login, Dashboard, Clientes, Servicios en lista y calendario), las 12 modales de creación/edición/detalle/borrado de Clientes, Sitios y Servicios, y el componente de mapa de ubicación.
- **Antes** — Backend inicial: API de autenticación (JWT), clientes, sitios de limpieza y servicios, con Docker y PostgreSQL.
