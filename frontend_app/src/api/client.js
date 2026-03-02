const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Normalize API base url:
 * - In dev, you can set REACT_APP_API_BASE_URL to the backend base (e.g. http://localhost:3001)
 * - In prod, can be left empty to use same-origin (if proxied) or set accordingly.
 */
function getApiBaseUrl() {
  return (process.env.REACT_APP_API_BASE_URL || '').replace(/\/+$/, '');
}

function buildUrl(path, query) {
  const base = getApiBaseUrl();
  const full = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return full;

  const url = new URL(full, window.location.origin);
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    url.searchParams.set(k, String(v));
  });
  return url.toString();
}

async function safeReadJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/**
 * Basic fetch wrapper with:
 * - JSON in/out
 * - timeout
 * - consistent error object
 */
async function request(path, { method = 'GET', query, body, token, headers } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const finalHeaders = {
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  };

  try {
    const res = await fetch(buildUrl(path, query), {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await safeReadJson(res);

    if (!res.ok) {
      const message =
        (data && (data.detail || data.message)) ||
        `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (e) {
    // Fetch abort is a DOMException; normalize to Error with message.
    if (e && e.name === 'AbortError') {
      const err = new Error('Request timed out. Please try again.');
      err.code = 'TIMEOUT';
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Note: backend OpenAPI currently only exposes "/" health check.
 * These endpoints are implemented defensively:
 * - They will surface friendly errors until backend endpoints are added.
 */
export const api = {
  // PUBLIC_INTERFACE
  async health() {
    /** Health check of backend API. */
    return request('/', { method: 'GET' });
  },

  // PUBLIC_INTERFACE
  async listProducts({ q, sort, page, limit } = {}) {
    /** List viral products (expected backend: GET /products). */
    return request('/products', { method: 'GET', query: { q, sort, page, limit } });
  },

  // PUBLIC_INTERFACE
  async getProduct(productId) {
    /** Get product details (expected backend: GET /products/{id}). */
    return request(`/products/${encodeURIComponent(productId)}`, { method: 'GET' });
  },

  // PUBLIC_INTERFACE
  async login({ email, password }) {
    /** Login (expected backend: POST /auth/login). */
    return request('/auth/login', { method: 'POST', body: { email, password } });
  },

  // PUBLIC_INTERFACE
  async register({ name, email, password }) {
    /** Register (expected backend: POST /auth/register). */
    return request('/auth/register', { method: 'POST', body: { name, email, password } });
  },

  // PUBLIC_INTERFACE
  async getRewards({ token }) {
    /** Get rewards summary (expected backend: GET /rewards/me). */
    return request('/rewards/me', { method: 'GET', token });
  },

  // PUBLIC_INTERFACE
  async checkout({ token, cart }) {
    /** Checkout (expected backend: POST /checkout). */
    return request('/checkout', { method: 'POST', token, body: { cart } });
  },
};
