import { apiClient } from './client';
import type { AuthResponse, GoogleLoginRequest, LoginRequest, RegisterRequest } from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/login', data).then((res) => res.data),

  register: (data: RegisterRequest) =>
    apiClient.post<string>('/api/auth/register', data).then((res) => res.data),

  loginWithGoogle: (data: GoogleLoginRequest) =>
    apiClient.post<AuthResponse>('/api/auth/google', data).then((res) => res.data),
};
