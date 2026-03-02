import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { mockProducts } from '../data/mockProducts';
import { Badge, Button, ErrorBanner, LoadingSkeleton, PageShell, Price } from '../components/ui';

function scoreProduct(p) {
  const discount = p.originalPrice ? (p.originalPrice - p.price) / p.originalPrice : 0;
  return (p.rating || 0) * 100 + (p.reviews || 0) / 100 + discount * 50;
}

// PUBLIC_INTERFACE
export default function HomePage() {
  /** Browse viral/trending products with search/sort and responsive cards. */
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('viral');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listProducts({ q: query, sort });
      // Accept either array or {items:[]}
      const items = Array.isArray(data) ? data : data?.items;
      setProducts(items || []);
    } catch (e) {
      // Fallback to mock products for now
      setError(e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial load
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayProducts = useMemo(() => {
    const base = products.length ? products : mockProducts;

    const filtered = base.filter((p) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (p.name || '').toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q);
    });

    const sorted = [...filtered];
    if (sort === 'price_low') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'price_high') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'top') sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'viral') sorted.sort((a, b) => scoreProduct(b) - scoreProduct(a));

    return sorted;
  }, [products, query, sort]);

  return (
    <PageShell
      title="Viral picks, priced like a steal"
      subtitle="Trending products with affiliate links — tap a deal and shop seamlessly."
      right={
        <div className="filters">
          <div className="field">
            <label htmlFor="q">Search</label>
            <input
              id="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search viral products…"
            />
          </div>
          <div className="field">
            <label htmlFor="sort">Sort</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="viral">Viral score</option>
              <option value="top">Top rated</option>
              <option value="price_low">Price: low</option>
              <option value="price_high">Price: high</option>
            </select>
          </div>
          <Button size="md" variant="secondary" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      }
    >
      {loading ? <LoadingSkeleton lines={6} /> : null}
      {error ? (
        <ErrorBanner
          title="Backend not ready yet — showing demo products"
          error={error}
          onRetry={load}
        />
      ) : null}

      <div className="hero">
        <div className="hero-card">
          <div className="hero-kicker">
            <Badge tone="accent">Ocean Professional</Badge>
            <Badge tone="success">Rewards</Badge>
          </div>
          <h2>Earn points on every checkout</h2>
          <p className="muted">
            Shop trending picks, rack up loyalty points, unlock coupons. Inspired by Temu-like
            engagement — without the clutter.
          </p>
          <div className="hero-actions">
            <Button as="link" to="/rewards" variant="primary">
              View rewards
            </Button>
            <Button as="link" to="/login" variant="ghost">
              Sign in
            </Button>
          </div>
        </div>
        <div className="hero-grad" aria-hidden="true" />
      </div>

      <div className="grid">
        {displayProducts.map((p) => (
          <article key={p.id} className="card">
            <div className="card-media">
              <img src={p.imageUrl} alt={p.name} loading="lazy" />
              <div className="card-badges">
                {p.tag ? <Badge tone="accent">{p.tag}</Badge> : null}
                {p.shippingBadge ? <Badge tone="neutral">{p.shippingBadge}</Badge> : null}
              </div>
            </div>
            <div className="card-body">
              <h3 className="card-title">{p.name}</h3>
              <div className="card-meta">
                <span className="stars" aria-label={`Rating ${p.rating} out of 5`}>
                  ★ {p.rating}
                </span>
                <span className="muted">{Number(p.reviews || 0).toLocaleString()} reviews</span>
              </div>

              <Price price={p.price} originalPrice={p.originalPrice} />

              <div className="card-actions">
                <Button as="link" to={`/product/${p.id}`} variant="primary" size="md">
                  View deal
                </Button>
                <Button as="a" href={p.affiliateUrl} variant="secondary" size="md">
                  Shop now
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
