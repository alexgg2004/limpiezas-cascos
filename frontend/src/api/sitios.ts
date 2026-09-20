import { apiClient } from './client';
import type { SitioLimpiezaRequestDto, SitioLimpiezaResponseDto } from '../types';

export const sitiosApi = {
  listar: () =>
    apiClient.get<SitioLimpiezaResponseDto[]>('/api/sitios').then((res) => res.data),

  crear: (data: SitioLimpiezaRequestDto) =>
    apiClient.post<SitioLimpiezaResponseDto>('/api/sitios', data).then((res) => res.data),

  obtenerPorId: (id: number) =>
    apiClient.get<SitioLimpiezaResponseDto>(`/api/sitios/${id}`).then((res) => res.data),

  actualizar: (id: number, data: SitioLimpiezaRequestDto) =>
    apiClient.put<SitioLimpiezaResponseDto>(`/api/sitios/${id}`, data).then((res) => res.data),

  eliminar: (id: number) => apiClient.delete<void>(`/api/sitios/${id}`).then((res) => res.data),
};
