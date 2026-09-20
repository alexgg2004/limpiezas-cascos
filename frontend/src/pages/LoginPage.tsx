import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import './LoginPage.css';

const currentYear = new Date().getFullYear();

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch {
      setError('Credenciales incorrectas. Comprueba tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleCredential = useCallback(
    async (idToken: string) => {
      setError(null);
      setLoading(true);
      try {
        await loginWithGoogle(idToken);
        navigate('/', { replace: true });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setError('Tu cuenta de Google no tiene acceso a esta aplicación.');
        } else {
          setError('No se ha podido iniciar sesión con Google. Inténtalo de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    },
    [loginWithGoogle, navigate],
  );

  return (
    <div className="login">
      <div className="login__panel">
        <div className="login__brand">
          <svg width="28" height="26" viewBox="0 0 28 24">
            <path d="M14 2c4.6 6.3 8 10.9 8 15A8 8 0 1 1 6 17c0-4.1 3.4-8.7 8-15Z" fill="currentColor" />
            <circle cx="22" cy="4.5" r="2.1" fill="var(--green)" />
          </svg>
          <span>
            Limpiezas <em>Cascos</em>
          </span>
        </div>

        <div className="login__pitch">
          <h1>Organiza cada servicio de limpieza en un solo lugar.</h1>
          <p>Gestiona clientes, sitios y partes de servicio, desde la oficina o en el propio local.</p>
        </div>

        <div className="login__footer">© {currentYear} Limpiezas Cascos</div>
      </div>

      <div className="login__form-side">
        <div className="login__card">
          <h2>Iniciar sesión</h2>
          <p className="login__subtitle">Acceso restringido a cuentas de Google autorizadas.</p>

          <div className="login__google">
            <GoogleSignInButton onCredential={handleGoogleCredential} />
          </div>

          {error && <div className="login__error">{error}</div>}

          <div className="login__divider">
            <span />
            <em>o con email y contraseña</em>
            <span />
          </div>

          <form onSubmit={handleSubmit}>
            <label className="login__field">
              <span>Correo electrónico</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@empresa.es"
              />
            </label>

            <label className="login__field">
              <span>Contraseña</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            <button type="submit" className="login__submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
