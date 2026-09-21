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

- **Backend**: API completa para clientes, sitios de limpieza y servicios (CRUD), factura adjunta por servicio, servicios asignables a varios usuarios, y todos los datos visibles para cualquier usuario autenticado (no hay aislamiento por propietario). Login con Google restringido por lista blanca gestionable en caliente (tabla, no variable de entorno) + login con email/contraseña restringido por clave de invitación.
- **Frontend**: rutas y layout completos (Dashboard, Clientes, Sitios de limpieza, Servicios), con modales reales de crear/ver/editar/eliminar conectadas a la API en los tres recursos, selector de operarios asignados, y vista previa de ubicación con enlace a Google Maps. El Dashboard incluye un calendario mensual con los servicios reales, y permite crear un servicio pulsando cualquier día. Un servicio puede tener varias facturas adjuntas, añadibles tanto al crear/editar como desde su ficha de detalle. La lista de Servicios tiene un filtro real por usuario asignado. Pendiente: vista de calendario dentro de la pantalla de Servicios y el resto de sus filtros (por ahora son solo visuales, diseñados pero no conectados).

## Novedades

Cambios más recientes primero.

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
