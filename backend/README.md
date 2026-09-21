# Limpiezas Cascos — Backend

API REST en Spring Boot para la gestión de clientes, sitios de limpieza y partes de servicio. Autenticación JWT, con dos vías de acceso restringidas (lista blanca de Google y clave de invitación) — ver [Seguridad](#seguridad).

## Stack

- Java 17, Spring Boot 3.3 (Web, Data JPA, Security, Validation)
- PostgreSQL
- JWT (`io.jsonwebtoken`)
- Verificación de ID tokens de Google (`google-api-client`)
- `ddl-auto=update` — Hibernate crea/actualiza el esquema solo, no hay migraciones versionadas (Flyway/Liquibase)

**Nota sobre `ddl-auto=update`**: solo añade tablas/columnas, nunca quita restricciones. Si tu base de datos viene de antes del 2026-09-20 (cuando `facturas_adjuntas.servicio_id` era `UNIQUE`, porque un servicio solo tenía una factura), tienes que quitar esa restricción a mano una vez antes de que una segunda factura en el mismo servicio deje de fallar:
```sql
ALTER TABLE facturas_adjuntas DROP CONSTRAINT ukrb3rspn4ncqmvgm7ps5ueog3k;
-- (el nombre puede variar; consulta \d facturas_adjuntas si el ALTER falla)
```

## Puesta en marcha

**Con Docker (recomendado)** — desde la raíz del repositorio, no desde aquí:

```bash
docker compose up -d --build
```

Lee las variables desde el `.env` de la raíz del repo (ver [Variables de entorno](#variables-de-entorno)).

**Local, sin Docker** (necesita un PostgreSQL accesible):

```bash
cd backend
mvn spring-boot:run
```

Sin variables de entorno definidas, `spring.datasource.url` etc. quedan vacías y el arranque falla — exporta las mismas variables que usa `docker-compose.yml` (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, ...) en tu shell o en la configuración de ejecución de tu IDE.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Sí | Conexión a PostgreSQL |
| `JWT_SECRET` | Sí | Clave para firmar los JWT (HS256, ≥32 bytes) |
| `UPLOAD_DIR` (`app.upload.dir`) | Sí | Carpeta donde se guardan las facturas adjuntas |
| `GOOGLE_CLIENT_ID` | No* | Client ID de OAuth de Google. Sin ella, `/api/auth/google` responde `503` |
| `GOOGLE_ALLOWED_EMAILS` | No | Solo se usa **una vez**, para migrar su valor a la tabla `correos_permitidos` si esta está vacía al arrancar. Después de esa migración inicial no se vuelve a leer — la lista se gestiona por API (ver [Correos permitidos](#correos-permitidos-lista-blanca-de-google)) |
| `INVITATION_CODE` | No* | Clave exigida en `POST /api/auth/register`. Vacía = registro cerrado por defecto |
| `PORT` | No | Puerto del servidor (por defecto `8080`) |

\* No exigidas por Spring, pero sin ellas esa función concreta queda deshabilitada por defecto (fallo seguro).

## Seguridad

- **JWT stateless**: `POST /api/auth/login`, `/api/auth/register` o `/api/auth/google` devuelven un token que hay que mandar como `Authorization: Bearer <token>`. Todo lo demás bajo `/api/**` exige ese token (`SecurityConfig` + `JwtFilter`); solo `/api/auth/**` es público.
- **Login con Google**: el frontend obtiene un ID token con Google Identity Services y lo manda a `POST /api/auth/google`. `GoogleTokenVerifier` valida firma, emisor y audiencia (frente al `GOOGLE_CLIENT_ID` configurado). Si el email verificado del token no está en la tabla `correos_permitidos`, responde `403`. La primera vez que entra alguien autorizado se le crea un `Usuario` automáticamente, con una contraseña aleatoria inutilizable (ese campo es obligatorio en la tabla pero no se usa para este tipo de acceso).
- **Registro con email/contraseña**: `POST /api/auth/register` exige además `claveInvitacion`, comparada en tiempo constante (`MessageDigest.isEqual`) contra `app.registro.clave-invitacion`. Sin esa propiedad configurada, nadie puede registrarse por esta vía.
- **Sin roles por endpoint todavía**: existe el enum `Rol` (`ROLE_USER`, `ROLE_ADMIN`) pero ningún endpoint distingue por rol — cualquier usuario autenticado puede hacer cualquier operación sobre cualquier dato (ver siguiente punto).
- **Datos compartidos, no aislados por usuario**: clientes, sitios y servicios son visibles y editables por cualquier usuario autenticado, independientemente de quién los creó. `Cliente.usuario` guarda quién lo dio de alta a título informativo, pero no se usa para filtrar ni restringir acceso.

## Modelo de datos

| Entidad | Campos propios | Relaciones |
|---|---|---|
| `Usuario` | `email` (único), `password` (hash bcrypt), `nombreCompleto`, `nifCif`, `rol` | — |
| `Cliente` | `nombre`, `nifCif`, `telefono`, `email` | `usuario` (creador, N:1) · `sitios` (1:N) |
| `SitioLimpieza` | `nombreDescriptivo`, `direccion`, `codigoPostal`, `ciudad`, `latitud`, `longitud`, `instruccionesAcceso` | `cliente` (N:1) |
| `Servicio` | `fecha`, `horas`, `precioHora`, `totalImporte`, `observaciones`, `estado` (`PENDIENTE`\|`REALIZADO`\|`CANCELADO`) | `sitio` (N:1) · `facturas` (1:N) · `asignados` (N:M con `Usuario`, tabla `servicios_asignados`) |
| `FacturaAdjunta` | `nombreOriginal`, `nombreGuardado`, `tipoContenido`, `tamanoBytes`, `fechaSubida` | `servicio` (N:1) — un servicio puede tener varias |
| `CorreoPermitido` | `email` (único), `fechaAlta` | — (lista blanca de Google, ver abajo) |

`totalImporte` se recalcula en el backend como `horas × precioHora` — no se toma del valor que mande el cliente.

## API

Todos los endpoints están bajo `/api`. Salvo los de `/api/auth`, todos exigen `Authorization: Bearer <token>`.

### Autenticación (`/api/auth`) — públicos

| Método | Ruta | Body | Respuesta |
|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` | `200` `{ token, email, nombreCompleto }` · `400` credenciales inválidas |
| POST | `/api/auth/register` | `{ email, password, nombreCompleto?, nifCif?, claveInvitacion }` | `200` texto OK · `403` clave de invitación incorrecta · `400` email ya registrado |
| POST | `/api/auth/google` | `{ idToken }` | `200` `{ token, email, nombreCompleto }` · `400` token inválido / email no verificado · `403` email no está en la lista blanca · `503` Google no configurado (`GOOGLE_CLIENT_ID` vacío) |

### Clientes (`/api/clientes`)

| Método | Ruta | Body | Notas |
|---|---|---|---|
| GET | `/api/clientes` | — | Lista todos los clientes |
| POST | `/api/clientes` | `ClienteRequestDto` | El creador se guarda en `Cliente.usuario` (informativo) |
| PUT | `/api/clientes/{id}` | `ClienteRequestDto` | |
| DELETE | `/api/clientes/{id}` | — | `400` si el cliente tiene sitios asociados |

`ClienteRequestDto` / `ClienteResponseDto`: `nombre` (obligatorio), `nifCif`, `telefono`, `email`.

### Sitios de limpieza (`/api/sitios`)

| Método | Ruta | Body | Notas |
|---|---|---|---|
| GET | `/api/sitios` | — | Lista todos los sitios (endpoint en `GestionController`) |
| POST | `/api/sitios` | `SitioLimpiezaRequestDto` | |
| GET | `/api/sitios/{id}` | — | |
| PUT | `/api/sitios/{id}` | `SitioLimpiezaRequestDto` | |
| DELETE | `/api/sitios/{id}` | — | `400` si el sitio tiene servicios registrados |

`SitioLimpiezaRequestDto`: `nombreDescriptivo` (obligatorio), `direccion`, `codigoPostal`, `ciudad`, `latitud` (obligatoria), `longitud` (obligatoria), `instruccionesAcceso`, `clienteId` (obligatorio).
`SitioLimpiezaResponseDto` añade `nombreCliente`.

### Servicios (`/api/servicios`)

| Método | Ruta | Body / Query | Notas |
|---|---|---|---|
| GET | `/api/servicios` | Query: `clienteId`, `estado`, `fechaInicio`, `fechaFin` (ISO `yyyy-MM-dd`), `cercaniaFecha`, `soloFuturos` (bool) | Todos los filtros son opcionales y combinables |
| POST | `/api/servicios` | `ServicioRequestDto` | |
| GET | `/api/servicios/{id}` | — | |
| PUT | `/api/servicios/{id}` | `ServicioRequestDto` | Sustituye por completo la lista de `asignados` |
| DELETE | `/api/servicios/{id}` | — | Sin restricciones. Cascada borra sus filas de `FacturaAdjunta` en BD, pero **no** borra los archivos del disco (ver aviso abajo) |

`ServicioRequestDto`: `fecha` (obligatoria), `horas`, `precioHora`, `observaciones`, `estado` (obligatorio), `sitioId` (obligatorio), `asignadosIds` (lista de IDs de `Usuario`, opcional — vacía o ausente = sin asignar).

`ServicioResponseDto` añade `totalImporte` (calculado), `nombreSitio`, `facturas` (lista de `FacturaInfoResponseDto`, puede estar vacía) y `asignados` (lista de `{ id, nombreCompleto, email }`).

`estado` como filtro en el GET se valida contra el enum; un valor no reconocido responde `400`.

⚠️ Borrar un servicio (`DELETE /api/servicios/{id}`) elimina en cascada sus filas de `facturas_adjuntas` en base de datos, pero no llama a `FileStorageService.eliminarArchivo` — los ficheros PDF/imagen correspondientes quedan huérfanos en `uploads/facturas`. Solo se limpian del disco cuando se borra una factura individualmente (`DELETE /api/servicios/{id}/facturas/{facturaId}`). Ya existía esta limitación antes de que un servicio pudiera tener varias facturas; no la he corregido porque no se pidió.

### Facturas de un servicio (`/api/servicios/{servicioId}/facturas`)

Un servicio puede tener **varias** facturas adjuntas (antes era una única factura que se sustituía al subir otra).

| Método | Ruta | Body | Notas |
|---|---|---|---|
| GET | `/api/servicios/{servicioId}/facturas` | — | Lista, más reciente primero |
| POST | `/api/servicios/{servicioId}/facturas` | multipart `archivo` | Añade una factura más; no sustituye las existentes |
| GET | `/api/servicios/{servicioId}/facturas/{facturaId}` | — | Devuelve el binario (PDF/imagen) de esa factura concreta, para visualizar |
| DELETE | `/api/servicios/{servicioId}/facturas/{facturaId}` | — | Borra esa factura (fila en BD + archivo en disco) |

`FacturaInfoResponseDto`: `id`, `nombreOriginal`, `tamanoBytes`, `fechaSubida`.

### Correos permitidos — lista blanca de Google (`/api/correos-permitidos`)

Gestiona en caliente quién puede entrar por `POST /api/auth/google`, sin reiniciar el backend.

| Método | Ruta | Body | Notas |
|---|---|---|---|
| GET | `/api/correos-permitidos` | — | Ordenados por fecha de alta |
| POST | `/api/correos-permitidos` | `{ email }` | `400` si ya está en la lista |
| DELETE | `/api/correos-permitidos/{id}` | — | `400` si intentas quitarte el acceso a ti mismo |

### Usuarios (`/api/usuarios`)

| Método | Ruta | Notas |
|---|---|---|
| GET | `/api/usuarios` | Lista `{ id, nombreCompleto, email }` de todos los usuarios — la usa el frontend para elegir a quién asignar un servicio |

### Errores

No hay un formato de error único, y hay una inconsistencia real que conviene conocer:

- La mayoría de comprobaciones de negocio devuelven `ResponseEntity.badRequest()`/`.status(...)` directamente desde el controlador, con el código HTTP que corresponde (`400`, `403`, `503`...) y el mensaje como **texto plano** (`Content-Type: text/plain`), p. ej. `Error: clave de invitación incorrecta`. Así responden `/api/auth/**` y `/api/correos-permitidos`.
- Los servicios más nuevos (`SitioLimpiezaService`, `ServicioService`) lanzan `ResponseStatusException` con el código que debería ser (`404`, `400`...), pero como también extiende `RuntimeException`, cae en `GlobalExceptionHandler` **antes** de que Spring gestione el `ResponseStatusException` como toca — así que el código HTTP real siempre acaba siendo `400`, aunque el cuerpo mencione el código previsto: `{"timestamp": "...", "error": "404 NOT_FOUND \"Sitio no encontrado\""}`. Verificado en vivo: un `GET /api/sitios/99999` inexistente responde `400`, no `404`. Es un bug conocido, no lo he corregido porque no se pidió — si os basáis en el código HTTP en el frontend para estos casos (en vez de en el texto del mensaje), avisad y lo arreglo.
- Validación de DTOs (`@Valid` fallido) responde `400` con el formato JSON por defecto de Spring (`errors: [...]`).

## Estructura de carpetas

```
backend/src/main/java/com/app/
├── controller/    Endpoints REST
├── service/       Lógica de negocio
├── repository/    Spring Data JPA
├── model/         Entidades JPA
├── dto/           Records de entrada/salida (uno por recurso, como clase contenedora)
├── security/      JWT, filtro, verificación de Google, lista blanca
└── exception/     Manejador global de errores
```
