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
                   (auth, clientes, sitios, servicios, facturas)
  components/
    auth/          ProtectedRoute y GoogleSignInButton (Google Identity Services)
    layout/         Sidebar, Topbar y AppLayout (armazón de la app)
    ui/             Componentes visuales reutilizables (EstadoBadge, ...)
  context/          AuthContext — sesión JWT persistida en localStorage
  hooks/            useAuth
  pages/            Una página por ruta (Login, Dashboard, Clientes, Sitios, Servicios)
  styles/           tokens.css (paleta/tipografía), global.css, components.css
  types/            Tipos TS calcados de los DTOs del backend (com.app.dto)
```

## Estado actual

Esto es el **esquema/armazón** de la aplicación: rutas, autenticación, capa de API
tipada y el layout (Sidebar/Topbar) ya funcionan contra el backend real. Las páginas
de listado (Clientes, Sitios, Servicios) muestran datos reales en tablas sencillas,
pero todavía no implementan los formularios, modales, filtros ni la vista de
calendario que ya están diseñados en el mockup de Claude Design — se irán
incorporando pantalla a pantalla.

Rutas disponibles:

| Ruta         | Página     | Protegida |
| ------------ | ---------- | --------- |
| `/login`     | Login      | No        |
| `/`          | Dashboard  | Sí        |
| `/clientes`  | Clientes   | Sí        |
| `/sitios`    | Sitios     | Sí        |
| `/servicios` | Servicios  | Sí        |

## Notas técnicas

- La sesión se guarda como JWT en `localStorage`; el interceptor de axios lo añade
  como cabecera `Authorization` y redirige a `/login` si el backend responde 401.
- El backend, por ahora, solo expone `PUT`/detalle para `sitios` y `servicios`;
  `clientes` solo tiene `GET`/`POST` — los módulos de API en `src/api/` lo reflejan
  con comentarios `// TODO` donde falta el endpoint correspondiente.
- La paleta y tipografías (`src/styles/tokens.css`) están calcadas del diseño
  publicado en Claude Design para mantener consistencia visual.
