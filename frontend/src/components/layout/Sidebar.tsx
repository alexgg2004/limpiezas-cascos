import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, icon: IconHome },
  { to: '/clientes', label: 'Clientes', icon: IconUsers },
  { to: '/sitios', label: 'Sitios de limpieza', icon: IconPin },
  { to: '/servicios', label: 'Servicios', icon: IconClipboard },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const iniciales = getIniciales(user?.nombreCompleto || user?.email || '?');

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <svg width="26" height="24" viewBox="0 0 28 24" className="sidebar__logo">
          <path
            d="M14 2c4.6 6.3 8 10.9 8 15A8 8 0 1 1 6 17c0-4.1 3.4-8.7 8-15Z"
            fill="currentColor"
          />
          <circle cx="22" cy="4.5" r="2.1" fill="var(--green)" />
        </svg>
        <div className="sidebar__wordmark">
          Limpiezas
          <br />
          <span>Cascos</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, end, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__user">
        <div className="sidebar__avatar">{iniciales}</div>
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">{user?.nombreCompleto || user?.email}</div>
          <div className="sidebar__user-role">Administrador</div>
        </div>
        <button
          type="button"
          className="sidebar__logout"
          onClick={logout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <IconLogout />
        </button>
      </div>
    </aside>
  );
}

function getIniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';
}

function IconHome() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.2 20c0-3.4 2.6-6.1 5.8-6.1s5.8 2.7 5.8 6.1" />
      <circle cx="17.3" cy="9" r="2.4" />
      <path d="M15.6 14.1c2.5.4 4.3 2.6 4.3 5.9" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-7.4 7-12.4a7 7 0 1 0-14 0C5 13.6 12 21 12 21Z" />
      <circle cx="12" cy="8.6" r="2.4" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <rect x="9" y="2.4" width="6" height="3" rx="1" />
      <path d="M9 11.5h6M9 15h6M9 8h3" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" />
      <path d="M14 16l4-4-4-4" />
      <path d="M18 12H9" />
    </svg>
  );
}
