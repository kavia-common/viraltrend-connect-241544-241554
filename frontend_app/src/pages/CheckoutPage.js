import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Button, ErrorBanner, PageShell } from '../components/ui';
import { useAppState } from '../state/appState';

// PUBLIC_INTERFACE
export default function CheckoutPage() {
  /** Lightweight checkout form with demo completion and rewards. */
  const nav = useNavigate();
  const { state, dispatch, cartTotals } = useAppState();

  const [fullName, setFullName] = useState(state.auth.user?.name || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const items = state.cart.items;

  async function placeOrder(e) {
    e.preventDefault();
    setError(null);

    if (!items.length) {
      setError(new Error('Your cart is empty.'));
      return;
    }
    if (String(fullName).trim().length < 2) return setError(new Error('Please enter your full name.'));
    if (String(address).trim().length < 5) return setError(new Error('Please enter a valid address.'));
    if (String(city).trim().length < 2) return setError(new Error('Please enter a city.'));
    if (String(postal).trim().length < 3) return setError(new Error('Please enter a postal code.'));

    setBusy(true);
    try {
      if (state.auth.status === 'authenticated') {
        await api.checkout({ token: state.auth.token, cart: state.cart.items });
      }
      // local effects
      dispatch({ type: 'REWARDS_EARN_FROM_CART' });
      dispatch({ type: 'CART_CLEAR' });
      setDone(true);
    } catch (e2) {
      // still complete in demo mode
      dispatch({ type: 'REWARDS_EARN_FROM_CART' });
      dispatch({ type: 'CART_CLEAR' });
      setError(e2);
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell
      title="Checkout"
      subtitle="Fast, clean, and rewards-ready."
      right={
        <Button variant="ghost" onClick={() => nav('/cart')}>
          Back to cart
        </Button>
      }
    >
      {error ? (
        <ErrorBanner
          title={done ? 'Order placed (demo) — backend checkout not available yet' : 'Checkout error'}
          error={error}
        />
      ) : null}

      {done ? (
        <div className="empty">
          <h3>Order confirmed</h3>
          <p className="muted">
            You earned ~{Math.floor(cartTotals.subtotal)} points. Check your rewards for tier progress.
          </p>
          <div className="rowgap">
            <Button as="link" to="/rewards" variant="primary">
              View rewards
            </Button>
            <Button as="link" to="/" variant="secondary">
              Keep shopping
            </Button>
          </div>
        </div>
      ) : (
        <div className="checkout">
          <form className="panel checkout-form" onSubmit={placeOrder}>
            <h3>Delivery details</h3>
            <div className="field">
              <label htmlFor="nm">Full name</label>
              <input id="nm" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ad">Address</label>
              <input id="ad" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, apt, etc." />
            </div>

            <div className="two">
              <div className="field">
                <label htmlFor="ct">City</label>
                <input id="ct" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="po">Postal</label>
                <input id="po" value={postal} onChange={(e) => setPostal(e.target.value)} />
              </div>
            </div>

            <div className="divider" />
            <h3>Payment</h3>
            <p className="muted">Demo checkout: no payment collected. Affiliate purchases happen on outletweb.shop.</p>

            <Button variant="primary" size="lg" type="submit" disabled={busy}>
              {busy ? 'Placing…' : `Place order • $${cartTotals.total.toFixed(2)}`}
            </Button>
          </form>

          <aside className="panel checkout-summary">
            <h3>Order summary</h3>
            {items.map((it) => (
              <div key={it.product.id} className="row">
                <span className="muted">
                  {it.qty}× {it.product.name}
                </span>
                <span>${(it.qty * it.product.price).toFixed(2)}</span>
              </div>
            ))}
            <div className="divider" />
            <div className="row">
              <span className="muted">Subtotal</span>
              <span>${cartTotals.subtotal.toFixed(2)}</span>
            </div>
            <div className="row">
              <span className="muted">Shipping</span>
              <span>{cartTotals.estimatedShipping ? `$${cartTotals.estimatedShipping.toFixed(2)}` : 'Free'}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <span>${cartTotals.total.toFixed(2)}</span>
            </div>

            <div className="muted tiny">
              Signed in: {state.auth.status === 'authenticated' ? 'Yes' : 'No'} (sync rewards by signing in)
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
