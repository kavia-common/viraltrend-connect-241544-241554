import React from 'react';
import { Button, PageShell } from '../components/ui';

// PUBLIC_INTERFACE
export default function NotFoundPage() {
  /** 404 page. */
  return (
    <PageShell title="Page not found" subtitle="That link didn’t land.">
      <div className="empty">
        <h3>404</h3>
        <p className="muted">Try going back to the shop.</p>
        <Button as="link" to="/" variant="primary">
          Go home
        </Button>
      </div>
    </PageShell>
  );
}
