import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppState } from '../state/appState';

// PUBLIC_INTERFACE
export function Button({ variant = 'primary', size = 'md', as = 'button', to, href, onClick, children, ...rest }) {
  /** Themed button component supporting internal (Link) and external navigation. */
  const className = `btn btn-${variant} btn-${size} ${rest.className || ''}`.trim();

  if (as === 'link' && to) {
    return (
      <Link to={to} className={className} {...rest}>
        {children}
      </Link>
    );
  }
  if (as === 'a' && href) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button className={className} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

// PUBLIC_INTERFACE
export function Badge({ tone = 'neutral', children }) {
  /** Small badge/pill label. */
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

// PUBLIC_INTERFACE
export function Price({ price, originalPrice }) {
  /** Price display with optional strike-through original price. */
  return (
    <div className="price">
      <span className="price-now">${Number(price).toFixed(2)}</span>
      {originalPrice ? <span className="price-was">${Number(originalPrice).toFixed(2)}</span> : null}
    </div>
  );
}

// PUBLIC_INTERFACE
export function ErrorBanner({ title = 'Something went wrong', error, onRetry }) {
  /** Friendly error banner with optional retry button. */
  const msg = typeof error === 'string' ? error : error?.message;
  return (
    <div className="alert alert-error" role="alert" aria-live="polite">
      <div className="alert-title">{title}</div>
      {msg ? <div className="alert-body">{msg}</div> : null}
      {onRetry ? (
        <div className="alert-actions">
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

// PUBLIC_INTERFACE
export function LoadingSkeleton({ lines = 3 }) {
  /** Simple skeleton placeholder. */
  return (
    <div className="skeleton">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton-line" />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
export function TopNav() {
  /** Sticky top navigation with search entry and cart indicator. */
  const { state, cartTotals } = useAppState();
  const count = state.cart.items.reduce((sum, it) => sum + it.qty, 0);

  return (
    <header className="topnav">
      <div className="container topnav-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">VT</span>
          <span className="brand-text">ViralTrend</span>
        </Link>

        <nav className="navlinks" aria-label="Primary navigation">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'navlink active' : 'navlink')}>
            Shop
          </NavLink>
          <NavLink to="/rewards" className={({ isActive }) => (isActive ? 'navlink active' : 'navlink')}>
            Rewards
          </NavLink>
        </nav>

        <div className="topnav-actions">
          <Link className="iconlink" to="/cart" aria-label="Cart">
            <span className="iconlink-label">Cart</span>
            <span className="chip">{count}</span>
          </Link>

          {state.auth.status === 'authenticated' ? (
            <Link className="iconlink" to="/account" aria-label="Account">
              <span className="iconlink-label">{state.auth.user?.name || 'Account'}</span>
            </Link>
          ) : (
            <Link className="iconlink" to="/login" aria-label="Login">
              <span className="iconlink-label">Sign in</span>
            </Link>
          )}

          <button
            className="iconbtn"
            onClick={() => {
              const next = state.ui.theme === 'light' ? 'dark' : 'light';
              // eslint-disable-next-line no-restricted-globals
              window.dispatchEvent(new CustomEvent('vt_set_theme', { detail: next }));
            }}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {state.ui.theme === 'light' ? 'Dark' : 'Light'}
          </button>

          <div className="mini-total" aria-label="Cart total">
            ${cartTotals.total.toFixed(2)}
          </div>
        </div>
      </div>
    </header>
  );
}

// PUBLIC_INTERFACE
export function PageShell({ title, subtitle, right, children }) {
  /** Common page shell wrapper. */
  return (
    <div className="page">
      <div className="container page-header">
        <div className="page-title">
          <h1>{title}</h1>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
        {right ? <div className="page-right">{right}</div> : null}
      </div>
      <div className="container page-body">{children}</div>
    </div>
  );
}
