import { useEffect, useRef, useState } from 'react';
import type { GoogleCredentialResponse } from '../../types/google-identity';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

interface Props {
  onCredential: (idToken: string) => void;
}

/**
 * Botón "Iniciar sesión con Google" (Google Identity Services). Se limita a
 * obtener el ID token del navegador; la verificación de firma y la lista de
 * correos permitidos ocurren siempre en el backend (POST /api/auth/google).
 */
export function GoogleSignInButton({ onCredential }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(Boolean(window.google?.accounts?.id));

  useEffect(() => {
    if (scriptReady) return;
    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setScriptReady(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [scriptReady]);

  useEffect(() => {
    if (!scriptReady || !containerRef.current || !CLIENT_ID) return;

    window.google!.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response: GoogleCredentialResponse) => onCredential(response.credential),
      cancel_on_tap_outside: true,
    });

    window.google!.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 312,
    });
  }, [scriptReady, onCredential]);

  if (!CLIENT_ID) {
    return (
      <div className="google-signin google-signin--disabled">
        Login con Google no configurado (falta VITE_GOOGLE_CLIENT_ID)
      </div>
    );
  }

  return <div ref={containerRef} className="google-signin" />;
}
