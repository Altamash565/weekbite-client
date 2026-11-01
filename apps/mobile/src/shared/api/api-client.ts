import { tokenCache } from '../storage/tokenCache';

const COOKIE_STORAGE_KEY = 'wb_auth_cookies';
const ACCESS_TOKEN_KEY = 'wb_access_token';
const REFRESH_TOKEN_KEY = 'wb_refresh_token';

// Fallback to localhost if not specified, but log warning if on native device
const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'https://loosely-unimpressive-scarlett.ngrok-free.dev/api/v1'
).replace(/\/$/, '');

export interface RequestOptions extends RequestInit {
  skipAuthRefresh?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Extracts and persists accessToken & refreshToken from Set-Cookie headers or response JSON
 */
async function processIncomingCookies(response: Response, responseData?: unknown): Promise<void> {
  const setCookie = response.headers.get('set-cookie');
  let currentCookie = (await tokenCache.getToken(COOKIE_STORAGE_KEY)) || '';
  const cookieMap = new Map<string, string>();

  // Parse existing stored cookies
  if (currentCookie) {
    currentCookie.split(';').forEach((part) => {
      const [k, v] = part.trim().split('=');
      if (k && v) cookieMap.set(k.trim(), v.trim());
    });
  }

  // Parse Set-Cookie header if provided by server
  if (setCookie) {
    const rawCookies = setCookie.split(/,(?=\s*[a-zA-Z0-9_-]+=)/);
    for (const cookieStr of rawCookies) {
      const [cookiePair] = cookieStr.split(';');
      if (cookiePair) {
        const [key, val] = cookiePair.trim().split('=');
        if (key && val) {
          cookieMap.set(key.trim(), val.trim());
          if (key.trim() === 'accessToken') {
            await tokenCache.saveToken(ACCESS_TOKEN_KEY, val.trim());
          }
          if (key.trim() === 'refreshToken') {
            await tokenCache.saveToken(REFRESH_TOKEN_KEY, val.trim());
          }
        }
      }
    }
  }

  // Also check if tokens were delivered in response body as fallback
  if (responseData && typeof responseData === 'object') {
    const obj = responseData as Record<string, unknown>;
    const at = (obj.accessToken || obj.token || (obj.data as Record<string, unknown>)?.accessToken) as string | undefined;
    const rt = (obj.refreshToken || (obj.data as Record<string, unknown>)?.refreshToken) as string | undefined;

    if (at) {
      cookieMap.set('accessToken', at);
      await tokenCache.saveToken(ACCESS_TOKEN_KEY, at);
    }
    if (rt) {
      cookieMap.set('refreshToken', rt);
      await tokenCache.saveToken(REFRESH_TOKEN_KEY, rt);
    }
  }

  // Re-serialize cookies and save
  if (cookieMap.size > 0) {
    const serialized = Array.from(cookieMap.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
    await tokenCache.saveToken(COOKIE_STORAGE_KEY, serialized);
  }
}

/**
 * Prepares outgoing headers including Cookie string and Bearer token
 */
async function getOutgoingHeaders(customHeaders?: HeadersInit): Promise<Headers> {
  const headers = new Headers(customHeaders);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Bypass ngrok free tier browser interstitial page for API requests
  headers.set('ngrok-skip-browser-warning', 'true');

  const storedCookies = await tokenCache.getToken(COOKIE_STORAGE_KEY);
  if (storedCookies) {
    headers.set('Cookie', storedCookies);
  }

  const accessToken = await tokenCache.getToken(ACCESS_TOKEN_KEY);
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
}

export async function clearAuthSession(): Promise<void> {
  await tokenCache.clearToken?.(COOKIE_STORAGE_KEY);
  await tokenCache.clearToken?.(ACCESS_TOKEN_KEY);
  await tokenCache.clearToken?.(REFRESH_TOKEN_KEY);
}

let isRefreshing = false;
let refreshSubscribers: Array<(succeeded: boolean) => void> = [];

function onRefreshed(succeeded: boolean) {
  refreshSubscribers.forEach((callback) => callback(succeeded));
  refreshSubscribers = [];
}

/**
 * Execute HTTP requests with automatic cookie persistence and 401 token refresh
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const outgoingHeaders = await getOutgoingHeaders(options.headers);

  const fetchOptions: RequestInit = {
    ...options,
    headers: outgoingHeaders,
    credentials: 'include',
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    throw new ApiError(
      `Network error connecting to ${API_BASE_URL}. Ensure your backend server is running.`,
      0,
      error
    );
  }

  // Handle 401 Unauthorized by attempting to refresh token
  if (response.status === 401 && !options.skipAuthRefresh && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: await getOutgoingHeaders(),
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          let refreshData: unknown;
          try {
            refreshData = await refreshResponse.json();
          } catch {
            // No json body
          }
          await processIncomingCookies(refreshResponse, refreshData);
          isRefreshing = false;
          onRefreshed(true);
        } else {
          await clearAuthSession();
          isRefreshing = false;
          onRefreshed(false);
          throw new ApiError('Session expired. Please sign in again.', 401);
        }
      } catch (err) {
        await clearAuthSession();
        isRefreshing = false;
        onRefreshed(false);
        throw err;
      }
    }

    // Wait for the in-progress refresh
    const refreshSucceeded = await new Promise<boolean>((resolve) => {
      refreshSubscribers.push(resolve);
    });

    if (refreshSucceeded) {
      // Retry original request with fresh credentials
      const updatedHeaders = await getOutgoingHeaders(options.headers);
      return apiRequest<T>(endpoint, {
        ...options,
        headers: updatedHeaders,
        skipAuthRefresh: true,
      });
    } else {
      throw new ApiError('Session expired. Please sign in again.', 401);
    }
  }

  let data: unknown;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  // Persist cookies from response
  await processIncomingCookies(response, data);

  if (!response.ok) {
    const errorObj = data as { message?: string; error?: string } | null;
    const errorMessage =
      errorObj?.message || errorObj?.error || `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T = unknown>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

