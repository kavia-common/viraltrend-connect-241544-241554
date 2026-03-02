import React, { useState } from 'react';
import { Button, PageShell } from '../components/ui';
import { useAppState } from '../state/appState';

// PUBLIC_INTERFACE
export default function CartPage() {
  /** Cart view with quantity controls and totals. */
  const { state, dispatch, cartTotals } = useAppState();
  const [busy, setBusy] = useState(false);

  const items = state.cart.items;

  return (
    <PageShell
      title="Your cart"
      subtitle="Adjust quantities, then checkout and earn rewards."
      right={
        items.length ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'CART_CLEAR' })}
            disabled={busy}
          >
            Clear
          </Button>
        ) : null
      }
    >
      {items.length === 0 ? (
        <div className="empty">
          <h3>Cart is empty</h3>
          <p className="muted">Pick something viral and come back here to checkout.</p>
          <Button as="link" to="/" variant="primary">
            Browse products
          </Button>
        </div>
      ) : (
        <div className="cart">
          <div className="cart-items">
            {items.map((it) => (
              <div key={it.product.id} className="cart-item">
                <img className="cart-img" src={it.product.imageUrl} alt={it.product.name} />
                <div className="cart-main">
                  <div className="cart-title">{it.product.name}</div>
                  <div className="muted">${it.product.price.toFixed(2)} each</div>

                  <div className="cart-controls">
                    <button
                      className="qtybtn"
                      onClick={() =>
                        dispatch({
                          type: 'CART_SET_QTY',
                          productId: it.product.id,
                          qty: Math.max(1, it.qty - 1),
                        })
                      }
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <input
                      className="qtyinput"
                      type="number"
                      min={1}
                      max={99}
                      value={it.qty}
                      onChange={(e) =>
                        dispatch({
                          type: 'CART_SET_QTY',
                          productId: it.product.id,
                          qty: Math.max(1, Math.min(99, Number(e.target.value || 1))),
                        })
                      }
                      aria-label="Quantity"
                    />
                    <button
                      className="qtybtn"
                      onClick={() =>
                        dispatch({
                          type: 'CART_SET_QTY',
                          productId: it.product.id,
                          qty: Math.min(99, it.qty + 1),
                        })
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                    <button
                      className="linkdanger"
                      onClick={() => dispatch({ type: 'CART_REMOVE', productId: it.product.id })}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="cart-price">
                  ${(it.product.price * it.qty).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <div className="summary-card">
              <h3>Summary</h3>
              <div className="row">
                <span className="muted">Subtotal</span>
                <span>${cartTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="row">
                <span className="muted">Shipping</span>
                <span>{cartTotals.estimatedShipping ? `$${cartTotals.estimatedShipping.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="row">
                <span className="muted">Savings</span>
                <span className="good">−${cartTotals.savings.toFixed(2)}</span>
              </div>
              <div className="divider" />
              <div className="row total">
                <span>Total</span>
                <span>${cartTotals.total.toFixed(2)}</span>
              </div>

              <Button
                as="link"
                to="/checkout"
                variant="primary"
                size="lg"
                disabled={busy}
              >
                Checkout
              </Button>

              <Button as="link" to="/" variant="secondary" size="md" disabled={busy}>
                Continue shopping
              </Button>

              <div className="muted tiny">
                You’ll earn ~{Math.floor(cartTotals.subtotal)} points on this order.
              </div>
            </div>
          </aside>
        </div>
      )}
    </PageShell>
  );
}
