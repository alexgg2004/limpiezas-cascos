import { apiClient } from './client';
import type { FacturaInfoResponseDto } from '../types';

export const facturasApi = {
  listar: (servicioId: number) =>
    apiClient.get<FacturaInfoResponseDto[]>(`/api/servicios/${servicioId}/facturas`).then((res) => res.data),

  subir: (servicioId: number, archivo: File) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return apiClient
      .post<FacturaInfoResponseDto>(`/api/servicios/${servicioId}/facturas`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },

  eliminar: (servicioId: number, facturaId: number) =>
    apiClient.delete<void>(`/api/servicios/${servicioId}/facturas/${facturaId}`).then((res) => res.data),

  // El endpoint requiere el token JWT, así que no se puede enlazar directamente
  // (un <a href> no manda cabeceras). Se descarga como blob y se genera una URL local.
  obtenerUrlVisualizacion: (servicioId: number, facturaId: number) =>
    apiClient
      .get(`/api/servicios/${servicioId}/facturas/${facturaId}`, { responseType: 'blob' })
      .then((res) => URL.createObjectURL(res.data)),
};
