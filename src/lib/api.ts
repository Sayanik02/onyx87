const STORAGE_KEY = 'onyx_token';

export const getApiBaseUrl = () => {
  const configuredFromWindow = typeof window !== 'undefined'
    ? (window as typeof window & { ONYX_API_BASE?: string }).ONYX_API_BASE
    : undefined;

  if (configuredFromWindow) {
    return configuredFromWindow.replace(/\/$/, '');
  }

  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:8080`;
    }
    return `${protocol}//${hostname}`;
  }

  return 'http://localhost:8080';
};

export const getStoredSessionToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(STORAGE_KEY);
};

export const setStoredSessionToken = (token: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (token) {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } else {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
};

export const apiRequest = async <T = any>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = getStoredSessionToken();
  const headers = new Headers(init.headers || {});

  if (token) {
    headers.set('X-Session-Token', token);
  }

  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload && 'error' in payload
      ? String((payload as any).error)
      : 'Request failed';
    throw new Error(message);
  }

  return payload as T;
};

export const apiGet = <T = any>(path: string) => apiRequest<T>(path, { method: 'GET' });
export const apiPost = <T = any>(path: string, body?: unknown) => apiRequest<T>(path, {
  method: 'POST',
  body: body === undefined ? undefined : JSON.stringify(body),
});
export const apiDelete = <T = any>(path: string) => apiRequest<T>(path, { method: 'DELETE' });
