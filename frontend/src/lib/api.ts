/**
 * api.ts - Cliente HTTP centralizado con manejo de token JWT
 *
 * Todas las llamadas al backend pasan por aquí:
 * - API_BASE proviene de VITE_API_BASE (fallback vacío = mismo origen en producción)
 * - Inyecta el header Authorization: Bearer <token> en cada petición autenticada
 * - Maneja de forma uniforme errores de red y respuestas no-2xx
 */

export const API_BASE: string = import.meta.env.VITE_API_BASE || '';

const TOKEN_KEY = 'memorize_token';
const USER_KEY = 'memorize_user';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage no disponible (modo incógnito estricto)
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignorar
  }
}

export function saveUser(user: unknown): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignorar
  }
}

export function loadUser(): unknown | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  clearToken();
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignorar
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * fetchApi - Realiza una petición al backend añadiendo el token y parseando errores
 */
export async function fetchApi<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const token = getToken();
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError('Error de conexión con el servidor', 0);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (data && (data.error || data.message)) || `Error ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}

// Atajos tipados
export const apiGet = <T = any>(path: string): Promise<T> => fetchApi<T>(path);
export const apiPost = <T = any>(path: string, body: unknown): Promise<T> =>
  fetchApi<T>(path, { method: 'POST', body });
export const apiPut = <T = any>(path: string, body: unknown): Promise<T> =>
  fetchApi<T>(path, { method: 'PUT', body });
export const apiDelete = <T = any>(path: string): Promise<T> =>
  fetchApi<T>(path, { method: 'DELETE' });