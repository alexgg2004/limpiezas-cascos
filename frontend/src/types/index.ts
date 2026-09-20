// Tipos calcados de los DTOs de com.app.dto en el backend.
// Mantener sincronizados manualmente si el backend cambia.

export type EstadoServicio = 'PENDIENTE' | 'REALIZADO' | 'CANCELADO';

// --- Auth (AuthDtos) ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombreCompleto?: string;
  nifCif?: string;
  claveInvitacion: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  nombreCompleto: string;
}

// --- Cliente (ClienteDtos) ---

export interface ClienteRequestDto {
  nombre: string;
  nifCif?: string;
  telefono?: string;
  email?: string;
}

export interface ClienteResponseDto {
  id: number;
  nombre: string;
  nifCif: string | null;
  telefono: string | null;
  email: string | null;
}

// --- SitioLimpieza (SitioLimpiezaDtos) ---

export interface SitioLimpiezaRequestDto {
  nombreDescriptivo: string;
  direccion?: string;
  codigoPostal?: string;
  ciudad?: string;
  latitud: number;
  longitud: number;
  instruccionesAcceso?: string;
  clienteId: number;
}

export interface SitioLimpiezaResponseDto {
  id: number;
  nombreDescriptivo: string;
  direccion: string | null;
  codigoPostal: string | null;
  ciudad: string | null;
  latitud: number;
  longitud: number;
  instruccionesAcceso: string | null;
  clienteId: number;
  nombreCliente: string;
}

// --- Usuario (UsuarioDtos) ---

export interface UsuarioResumenDto {
  id: number;
  nombreCompleto: string | null;
  email: string;
}

// --- Servicio (ServicioDtos) ---

export interface ServicioRequestDto {
  fecha: string; // ISO date (yyyy-MM-dd)
  horas?: number;
  precioHora?: number;
  observaciones?: string;
  estado: EstadoServicio;
  sitioId: number;
  asignadosIds?: number[];
}

export interface ServicioResponseDto {
  id: number;
  fecha: string; // ISO date (yyyy-MM-dd)
  horas: number | null;
  precioHora: number | null;
  totalImporte: number | null;
  observaciones: string | null;
  estado: EstadoServicio;
  sitioId: number;
  nombreSitio: string;
  tieneFacturaAdjunta: boolean;
  asignados: UsuarioResumenDto[];
}

export interface ServiciosFiltro {
  clienteId?: number;
  estado?: EstadoServicio;
  fechaInicio?: string; // yyyy-MM-dd
  fechaFin?: string; // yyyy-MM-dd
  cercaniaFecha?: boolean;
  soloFuturos?: boolean;
}

// --- Factura adjunta (FacturaInfoResponseDto) ---

export interface FacturaInfoResponseDto {
  id: number;
  nombreOriginal: string;
  tamanoBytes: number;
  fechaSubida: string; // ISO datetime
}
