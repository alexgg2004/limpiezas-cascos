import axios from 'axios';
import { AUTH_TOKEN_KEY } from '../context/AuthContext';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // El backend devuelve 403 (no 401) cuando el token falta, no es válido o ha
    // caducado, ya que JwtFilter simplemente deja la petición sin autenticar en
    // vez de lanzar un 401 explícito. Tratamos ambos como "sesión no válida".
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
