import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, PageShell } from '../components/ui';
import { useAppState } from '../state/appState';

// PUBLIC_INTERFACE
export default function AccountPage() {
  /** Minimal account page (profile summary + logout). */
  const nav = useNavigate();
  const { state, dispatch } = useAppState();

  return (
    <PageShell
      title="Account"
      subtitle="Profile & session"
      right={
        <Button variant="ghost" onClick={() => nav(-1)}>
          Back
        </Button>
      }
    >
      {state.auth.status !== 'authenticated' ? (
        <div className="empty">
          <h3>Not signed in</h3>
          <p className="muted">Sign in to sync rewards and keep your loyalty progress.</p>
          <Button as="link" to="/login" variant="primary">
            Sign in
          </Button>
        </div>
      ) : (
        <div className="panel">
          <h3>Signed in</h3>
          <div className="row">
            <span className="muted">Name</span>
            <span>{state.auth.user?.name || '—'}</span>
          </div>
          <div className="row">
            <span className="muted">Email</span>
            <span>{state.auth.user?.email || '—'}</span>
          </div>
          <div className="row">
            <span className="muted">Session</span>
            <span className="chip">Active</span>
          </div>

          <div className="divider" />
          <Button
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'AUTH_LOGOUT' });
              nav('/');
            }}
          >
            Sign out
          </Button>
        </div>
      )}
    </PageShell>
  );
}
