import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import { AppStateProvider, useAppState } from './state/appState';
import { TopNav } from './components/ui';

import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import RewardsPage from './pages/RewardsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import NotFoundPage from './pages/NotFoundPage';

function ThemeEventBridge() {
  const { dispatch } = useAppState();

  useEffect(() => {
    function handler(e) {
      dispatch({ type: 'UI_SET_THEME', theme: e.detail });
    }
    window.addEventListener('vt_set_theme', handler);
    return () => window.removeEventListener('vt_set_theme', handler);
  }, [dispatch]);

  return null;
}

// PUBLIC_INTERFACE
function App() {
  /** Main React app entry with routing, layout, and global state. */
  return (
    <AppStateProvider>
      <BrowserRouter>
        <ThemeEventBridge />
        <div className="App">
          <TopNav />
          <main className="main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <footer className="footer">
            <div className="container footer-inner">
              <div className="muted tiny">
                © {new Date().getFullYear()} ViralTrend • Affiliate links may earn us commission.
              </div>
              <a className="tiny" href="https://outletweb.shop" target="_blank" rel="noreferrer">
                outletweb.shop
              </a>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
