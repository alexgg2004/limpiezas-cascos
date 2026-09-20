import { apiClient } from './client';
import type { UsuarioResumenDto } from '../types';

export const usuariosApi = {
  listar: () => apiClient.get<UsuarioResumenDto[]>('/api/usuarios').then((res) => res.data),
};
