import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Button, ErrorBanner, PageShell } from '../components/ui';
import { useAppState } from '../state/appState';

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
}

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login screen with graceful fallback if backend endpoint missing. */
  const nav = useNavigate();
  const { dispatch } = useAppState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError(new Error('Please enter a valid email.'));
      return;
    }
    if (String(password).length < 6) {
      setError(new Error('Password must be at least 6 characters.'));
      return;
    }

    setBusy(true);
    try {
      const data = await api.login({ email, password });
      // expected {token, user}
      dispatch({
        type: 'AUTH_LOGIN_SUCCESS',
        token: data?.token || 'demo-token',
        user: data?.user || { name: email.split('@')[0], email },
      });
      nav('/');
    } catch (e2) {
      // Demo fallback: allow login even if backend isn't ready
      dispatch({
        type: 'AUTH_LOGIN_SUCCESS',
        token: 'demo-token',
        user: { name: email.split('@')[0], email },
      });
      setError(e2);
      nav('/');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Welcome back" subtitle="Sign in to sync rewards across devices.">
      {error ? (
        <ErrorBanner
          title="Signed in (demo) — backend auth not available yet"
          error={error}
        />
      ) : null}

      <div className="auth">
        <form className="auth-card" onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="pw">Password</label>
            <input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <Button variant="primary" size="lg" disabled={busy} type="submit">
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>

          <div className="muted tiny">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </form>

        <div className="auth-aside">
          <h3>Why sign in?</h3>
          <ul className="bullets">
            <li>Save your loyalty progress</li>
            <li>Unlock tier-based coupons</li>
            <li>Faster checkout on every drop</li>
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
