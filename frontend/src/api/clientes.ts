import { apiClient } from './client';
import type { ClienteRequestDto, ClienteResponseDto } from '../types';

export const clientesApi = {
  listar: () => apiClient.get<ClienteResponseDto[]>('/api/clientes').then((res) => res.data),

  crear: (data: ClienteRequestDto) =>
    apiClient.post<ClienteResponseDto>('/api/clientes', data).then((res) => res.data),

  actualizar: (id: number, data: ClienteRequestDto) =>
    apiClient.put<ClienteResponseDto>(`/api/clientes/${id}`, data).then((res) => res.data),

  eliminar: (id: number) => apiClient.delete<void>(`/api/clientes/${id}`).then((res) => res.data),
};
