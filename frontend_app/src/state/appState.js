import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'viraltrend_app_state_v1';

const initialState = {
  auth: {
    status: 'anonymous', // 'anonymous' | 'authenticated'
    token: null,
    user: null,
  },
  cart: {
    items: [], // {product, qty}
  },
  rewards: {
    points: 0,
    tier: 'Starter',
    nextTierPoints: 200,
    coupons: [],
  },
  ui: {
    theme: 'light',
  },
};

function computeCartTotals(items) {
  const subtotal = items.reduce((sum, it) => sum + it.product.price * it.qty, 0);
  const savings = items.reduce(
    (sum, it) => sum + (it.product.originalPrice - it.product.price) * it.qty,
    0
  );
  const estimatedShipping = subtotal > 25 || items.length === 0 ? 0 : 3.99;
  const total = subtotal + estimatedShipping;

  return {
    subtotal,
    savings: Math.max(0, savings),
    estimatedShipping,
    total,
  };
}

function deriveRewardsFromCart(state) {
  // Simple loyalty model:
  // - Earn 1 point per $1 (rounded)
  // - Tier based on points
  const { subtotal } = computeCartTotals(state.cart.items);
  const earned = Math.floor(subtotal);
  const points = (state.rewards.points || 0) + earned;

  let tier = 'Starter';
  let nextTierPoints = 200;
  if (points >= 1200) {
    tier = 'Elite';
    nextTierPoints = 0;
  } else if (points >= 500) {
    tier = 'Pro';
    nextTierPoints = 1200 - points;
  } else {
    tier = 'Starter';
    nextTierPoints = 500 - points;
  }

  return {
    ...state.rewards,
    points,
    tier,
    nextTierPoints,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'UI_SET_THEME':
      return { ...state, ui: { ...state.ui, theme: action.theme } };

    case 'AUTH_LOGIN_SUCCESS':
      return {
        ...state,
        auth: { status: 'authenticated', token: action.token, user: action.user },
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        auth: { status: 'anonymous', token: null, user: null },
      };

    case 'CART_ADD': {
      const { product, qty } = action;
      const items = [...state.cart.items];
      const idx = items.findIndex((it) => it.product.id === product.id);
      if (idx >= 0) {
        items[idx] = { ...items[idx], qty: items[idx].qty + qty };
      } else {
        items.push({ product, qty });
      }
      return { ...state, cart: { items } };
    }

    case 'CART_SET_QTY': {
      const { productId, qty } = action;
      const items = state.cart.items
        .map((it) => (it.product.id === productId ? { ...it, qty } : it))
        .filter((it) => it.qty > 0);
      return { ...state, cart: { items } };
    }

    case 'CART_REMOVE': {
      const items = state.cart.items.filter((it) => it.product.id !== action.productId);
      return { ...state, cart: { items } };
    }

    case 'CART_CLEAR':
      return { ...state, cart: { items: [] } };

    case 'REWARDS_SET':
      return { ...state, rewards: { ...state.rewards, ...action.rewards } };

    case 'REWARDS_EARN_FROM_CART': {
      return { ...state, rewards: deriveRewardsFromCart(state) };
    }

    default:
      return state;
  }
}

const AppStateContext = createContext(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    // Light validation / forward compatibility
    return {
      ...initialState,
      ...parsed,
      auth: { ...initialState.auth, ...(parsed.auth || {}) },
      cart: { ...initialState.cart, ...(parsed.cart || {}) },
      rewards: { ...initialState.rewards, ...(parsed.rewards || {}) },
      ui: { ...initialState.ui, ...(parsed.ui || {}) },
    };
  } catch {
    return initialState;
  }
}

function persistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore persistence errors
  }
}

// PUBLIC_INTERFACE
export function AppStateProvider({ children }) {
  /** Global app state provider (auth, cart, rewards, UI). */
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    persistState(state);
    document.documentElement.setAttribute('data-theme', state.ui.theme);
  }, [state]);

  const value = useMemo(() => {
    const totals = computeCartTotals(state.cart.items);
    return {
      state,
      dispatch,
      cartTotals: totals,
    };
  }, [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAppState() {
  /** Hook to access global app state. */
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
