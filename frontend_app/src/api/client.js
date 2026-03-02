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
      const message = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
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
 * ViralTrend Connect API client aligned to backend_api OpenAPI.
 *
 * Backend response notes:
 * - Auth endpoints return { access_token, token_type, user }
 * - Most protected endpoints require Authorization: Bearer <access_token>
 */
export const api = {
  // PUBLIC_INTERFACE
  async health() {
    /** Health check of backend API. */
    return request('/', { method: 'GET' });
  },

  // PUBLIC_INTERFACE
  async listProducts({ q, category, trendingOnly, page, pageSize } = {}) {
    /**
     * List products.
     * Backend: GET /products
     * Query: q, category, trending_only, page, page_size
     */
    return request('/products', {
      method: 'GET',
      query: {
        q,
        category,
        trending_only: trendingOnly,
        page,
        page_size: pageSize,
      },
    });
  },

  // PUBLIC_INTERFACE
  async getProduct(productId) {
    /** Get product details. Backend: GET /products/{product_id}. */
    return request(`/products/${encodeURIComponent(productId)}`, { method: 'GET' });
  },

  // PUBLIC_INTERFACE
  async login({ email, password }) {
    /**
     * Login. Backend: POST /auth/login
     * Returns: { access_token, token_type, user }
     */
    return request('/auth/login', { method: 'POST', body: { email, password } });
  },

  // PUBLIC_INTERFACE
  async signup({ name, email, password }) {
    /**
     * Signup. Backend: POST /auth/signup
     * Request: { email, password, display_name }
     * Returns: { access_token, token_type, user }
     *
     * Note: UI uses "name" while backend expects "display_name".
     */
    return request('/auth/signup', {
      method: 'POST',
      body: { email, password, display_name: name },
    });
  },

  // PUBLIC_INTERFACE
  async me({ token }) {
    /** Current user profile. Backend: GET /auth/me */
    return request('/auth/me', { method: 'GET', token });
  },

  // PUBLIC_INTERFACE
  async getRewardsSummary({ token }) {
    /** Rewards summary. Backend: GET /rewards/summary */
    return request('/rewards/summary', { method: 'GET', token });
  },

  // PUBLIC_INTERFACE
  async getRewardsHistory({ token, limit } = {}) {
    /** Rewards history. Backend: GET /rewards/history */
    return request('/rewards/history', { method: 'GET', token, query: { limit } });
  },

  // PUBLIC_INTERFACE
  async earnRewardsPoints({ token, points, reason } = {}) {
    /** Demo helper. Backend: POST /rewards/earn (query params). */
    return request('/rewards/earn', { method: 'POST', token, query: { points, reason } });
  },

  // PUBLIC_INTERFACE
  async checkout({ token, shippingName, shippingAddress, paymentMethod, affiliateRef } = {}) {
    /**
     * Checkout. Backend: POST /checkout
     * Backend uses the server-side cart (not a cart payload).
     */
    return request('/checkout', {
      method: 'POST',
      token,
      body: {
        shipping_name: shippingName,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        affiliate_ref: affiliateRef ?? null,
      },
    });
  },

  // PUBLIC_INTERFACE
  async getCart({ token }) {
    /** Get cart. Backend: GET /cart */
    return request('/cart', { method: 'GET', token });
  },

  // PUBLIC_INTERFACE
  async upsertCartItem({ token, productId, quantity }) {
    /** Upsert a cart item. Backend: POST /cart/items */
    return request('/cart/items', {
      method: 'POST',
      token,
      body: { product_id: productId, quantity },
    });
  },

  // PUBLIC_INTERFACE
  async removeCartItem({ token, productId }) {
    /** Remove a cart item. Backend: DELETE /cart/items/{product_id} */
    return request(`/cart/items/${encodeURIComponent(productId)}`, { method: 'DELETE', token });
  },
};
