import { apiClient } from './client';
import type { ServicioRequestDto, ServicioResponseDto, ServiciosFiltro } from '../types';

export const serviciosApi = {
  listar: (filtro: ServiciosFiltro = {}) =>
    apiClient
      .get<ServicioResponseDto[]>('/api/servicios', { params: filtro })
      .then((res) => res.data),

  crear: (data: ServicioRequestDto) =>
    apiClient.post<ServicioResponseDto>('/api/servicios', data).then((res) => res.data),

  obtenerPorId: (id: number) =>
    apiClient.get<ServicioResponseDto>(`/api/servicios/${id}`).then((res) => res.data),

  actualizar: (id: number, data: ServicioRequestDto) =>
    apiClient.put<ServicioResponseDto>(`/api/servicios/${id}`, data).then((res) => res.data),

  eliminar: (id: number) => apiClient.delete<void>(`/api/servicios/${id}`).then((res) => res.data),
};
