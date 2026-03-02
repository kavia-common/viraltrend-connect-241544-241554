import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { mockProducts } from '../data/mockProducts';
import { Badge, Button, ErrorBanner, LoadingSkeleton, PageShell, Price } from '../components/ui';
import { useAppState } from '../state/appState';

// PUBLIC_INTERFACE
export default function ProductPage() {
  /** Product details, add-to-cart, and affiliate checkout CTA. */
  const { id } = useParams();
  const nav = useNavigate();
  const { dispatch } = useAppState();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  const fallback = useMemo(() => mockProducts.find((p) => p.id === id), [id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProduct(id);
      setProduct(data);
    } catch (e) {
      setError(e);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const p = product || fallback;

  return (
    <PageShell
      title={p ? p.name : 'Product'}
      subtitle="Details, reviews, and the best affiliate deal."
      right={
        <Button variant="ghost" onClick={() => nav(-1)}>
          Back
        </Button>
      }
    >
      {loading ? <LoadingSkeleton lines={5} /> : null}
      {error && !fallback ? <ErrorBanner title="Unable to load product" error={error} onRetry={load} /> : null}
      {error && fallback ? (
        <ErrorBanner title="Backend not ready yet — showing demo product" error={error} onRetry={load} />
      ) : null}

      {!p ? (
        <div className="empty">
          <h3>Product not found</h3>
          <p className="muted">Try another viral pick from the homepage.</p>
          <Button as="link" to="/" variant="primary">
            Go to shop
          </Button>
        </div>
      ) : (
        <div className="product">
          <div className="product-media">
            <img src={p.imageUrl} alt={p.name} />
          </div>

          <div className="product-info">
            <div className="product-badges">
              {p.tag ? <Badge tone="accent">{p.tag}</Badge> : null}
              {p.shippingBadge ? <Badge tone="neutral">{p.shippingBadge}</Badge> : null}
              <Badge tone="success">Rewards eligible</Badge>
            </div>

            <div className="product-meta">
              <span className="stars">★ {p.rating}</span>
              <span className="muted">{Number(p.reviews || 0).toLocaleString()} reviews</span>
            </div>

            <Price price={p.price} originalPrice={p.originalPrice} />
            <p className="muted">{p.description}</p>

            <ul className="bullets">
              {(p.bullets || []).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>

            <div className="qtyrow">
              <label htmlFor="qty">Qty</label>
              <input
                id="qty"
                type="number"
                min={1}
                max={99}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value || 1))))}
              />
            </div>

            <div className="product-actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  dispatch({ type: 'CART_ADD', product: p, qty });
                  nav('/cart');
                }}
              >
                Add to cart
              </Button>
              <Button variant="secondary" size="lg" as="a" href={p.affiliateUrl}>
                Shop on outletweb.shop
              </Button>
            </div>

            <div className="notice">
              Affiliate disclosure: We may earn a commission when you shop via our links (no extra cost to you).
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
