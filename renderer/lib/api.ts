// src/lib/api.ts

import type { User } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://doctor-production-78aa.up.railway.app/api';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

let isRedirecting = false;

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { 
    ...options, 
    headers,
  });

  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined' && !isRedirecting) {
      isRedirecting = true;
      setTimeout(() => {
        window.location.href = '/login';
        isRedirecting = false;
      }, 100);
    }
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json();
  return result as T;
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown, isFormData = false) => 
    fetchApi<T>(endpoint, { method: 'POST', body: isFormData ? (body as FormData) : JSON.stringify(body) }),
  delete: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'DELETE' }),
};

export const authApi = {
  login: (email: string, password: string) => 
    api.post<{ access_token: string; token_type: string; role: string; user: User; needs_verification?: boolean; email?: string }>(
      '/login', { email, password }
    ),

  register: (data: { name: string; email: string; password: string; phone: string; clinic_address: string }) => 
    api.post<{ message: string; email: string; debug_code?: string }>('/register', data),

  verifyCode: (email: string, code: string) => 
    api.post<{ access_token: string; token_type: string; role: string; user: User; message: string }>(
      '/verify-code', { email, code }
    ),

  resendCode: (email: string) => 
    api.post<{ message: string; debug_code?: string }>('/resend-code', { email }),

  logout: () => api.post('/logout', {}),
  getUser: () => api.get<User>('/user'),
};