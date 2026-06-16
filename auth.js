// ────────────────────────────────────────────────────────────
// UPSKILL Auth Client
// Handles signup, login, JWT storage, and session restoration.
// Include this script on every page (landing + dashboard).
// ────────────────────────────────────────────────────────────

const API_BASE = '/api';
const TOKEN_KEY = 'upskill_token';
const USER_KEY = 'upskill_user';

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  // Attach Authorization header automatically for protected calls
  async authFetch(path, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
      // Token invalid/expired -> force re-login
      Auth.clearSession();
      window.location.href = '/index.html?session=expired';
      throw new Error('Session expired');
    }

    return res;
  },

  async signup({ name, email, password }) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');

    this.setSession(data.token, data.user);
    return data.user;
  },

  async login({ email, password }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    this.setSession(data.token, data.user);
    return data.user;
  },

  logout() {
    this.clearSession();
    window.location.href = '/index.html';
  },

  // Call on page load of protected pages to verify the token is still
  // valid and refresh cached user info. Redirects to login if invalid.
  async restoreSession() {
    if (!this.isLoggedIn()) {
      window.location.href = '/index.html';
      return null;
    }
    try {
      const res = await this.authFetch('/auth/me');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return data.user;
    } catch (err) {
      Auth.clearSession();
      window.location.href = '/index.html';
      return null;
    }
  },
};
