import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Badge, Button, ErrorBanner, PageShell } from '../components/ui';
import { useAppState } from '../state/appState';

function tierBenefits(tier) {
  if (tier === 'Elite') return ['Free express shipping', 'VIP coupons weekly', 'Priority drops'];
  if (tier === 'Pro') return ['Extra points boost', 'Monthly coupons', 'Faster support'];
  return ['Earn points on checkout', 'Unlock coupons', 'Tier upgrades'];
}

// PUBLIC_INTERFACE
export default function RewardsPage() {
  /** Rewards/loyalty view with tiers and points. */
  const { state, dispatch, cartTotals } = useAppState();
  const [error, setError] = useState(null);
  const [loadingRemote, setLoadingRemote] = useState(false);

  const progress = useMemo(() => {
    if (state.rewards.tier === 'Elite') return 100;
    const threshold = state.rewards.tier === 'Pro' ? 1200 : 500;
    const current = state.rewards.points;
    const base = state.rewards.tier === 'Pro' ? 500 : 0;
    const pct = ((current - base) / (threshold - base)) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [state.rewards.points, state.rewards.tier]);

  async function sync() {
    setLoadingRemote(true);
    setError(null);
    try {
      if (state.auth.status !== 'authenticated') throw new Error('Sign in to sync rewards.');
      const data = await api.getRewards({ token: state.auth.token });
      if (data) dispatch({ type: 'REWARDS_SET', rewards: data });
    } catch (e) {
      setError(e);
    } finally {
      setLoadingRemote(false);
    }
  }

  useEffect(() => {
    // best-effort sync on mount
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageShell
      title="Rewards"
      subtitle="Earn points, unlock coupons, and level up your tier."
      right={
        <div className="rowgap">
          <Button variant="secondary" size="md" onClick={sync} disabled={loadingRemote}>
            {loadingRemote ? 'Syncing…' : 'Sync'}
          </Button>
        </div>
      }
    >
      {error ? <ErrorBanner title="Rewards sync unavailable (demo still works)" error={error} /> : null}

      <div className="rewards">
        <section className="panel">
          <div className="panel-top">
            <div>
              <div className="muted tiny">Your tier</div>
              <div className="h2">
                {state.rewards.tier} <Badge tone="accent">{state.auth.status === 'authenticated' ? 'Synced' : 'Local'}</Badge>
              </div>
            </div>
            <div className="points">
              <div className="muted tiny">Points</div>
              <div className="h2">{state.rewards.points.toLocaleString()}</div>
            </div>
          </div>

          <div className="progress">
            <div className="progressbar" aria-label="Tier progress">
              <div className="progressfill" style={{ width: `${progress}%` }} />
            </div>
            <div className="muted tiny">
              {state.rewards.tier === 'Elite'
                ? 'Max tier achieved.'
                : `${state.rewards.nextTierPoints} points to next tier.`}
            </div>
          </div>

          <div className="muted">Benefits</div>
          <ul className="bullets">
            {tierBenefits(state.rewards.tier).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h3>Boost your points</h3>
          <p className="muted">
            Checkout your cart to earn ~{Math.floor(cartTotals.subtotal)} points instantly.
          </p>
          <div className="rowgap">
            <Button
              as="link"
              to="/cart"
              variant="primary"
              size="lg"
            >
              Go to cart
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => dispatch({ type: 'REWARDS_EARN_FROM_CART' })}
            >
              Simulate earn (demo)
            </Button>
          </div>

          <div className="divider" />

          <h3>Coupons</h3>
          <div className="couponlist">
            {(state.rewards.coupons || []).length ? (
              state.rewards.coupons.map((c) => (
                <div key={c.code} className="coupon">
                  <div className="coupon-main">
                    <div className="coupon-code">{c.code}</div>
                    <div className="muted tiny">{c.description}</div>
                  </div>
                  <Badge tone="success">{c.value}</Badge>
                </div>
              ))
            ) : (
              <div className="muted">No coupons yet. Earn points to unlock.</div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
