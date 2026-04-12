// A.N.C.H.O.R. — Storage Utility

const Storage = {
  get(key, fallback = null) {
    try {
      const val = localStorage.getItem('anchor_' + key);
      return val ? JSON.parse(val) : fallback;
    } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('anchor_' + key, JSON.stringify(val)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem('anchor_' + key); } catch {}
  }
};
