import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Button, ErrorBanner, PageShell } from '../components/ui';
import { useAppState } from '../state/appState';

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
}

// PUBLIC_INTERFACE
export default function RegisterPage() {
  /** Register screen with graceful fallback if backend endpoint missing. */
  const nav = useNavigate();
  const { dispatch } = useAppState();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);

    if (String(name).trim().length < 2) {
      setError(new Error('Please enter your name.'));
      return;
    }
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
      const data = await api.register({ name, email, password });
      dispatch({
        type: 'AUTH_LOGIN_SUCCESS',
        token: data?.token || 'demo-token',
        user: data?.user || { name, email },
      });
      nav('/');
    } catch (e2) {
      dispatch({
        type: 'AUTH_LOGIN_SUCCESS',
        token: 'demo-token',
        user: { name, email },
      });
      setError(e2);
      nav('/');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Create your account" subtitle="Start earning rewards on every viral deal.">
      {error ? (
        <ErrorBanner
          title="Account created (demo) — backend auth not available yet"
          error={error}
        />
      ) : null}

      <div className="auth">
        <form className="auth-card" onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

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
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>

          <Button variant="primary" size="lg" disabled={busy} type="submit">
            {busy ? 'Creating…' : 'Create account'}
          </Button>

          <div className="muted tiny">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>

        <div className="auth-aside">
          <h3>Starter perks</h3>
          <ul className="bullets">
            <li>Welcome bonus points</li>
            <li>Early access to limited drops</li>
            <li>Tier boosts with streaks</li>
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
