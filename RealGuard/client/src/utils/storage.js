// localStorage / sessionStorage podem falhar (aba anônima, bloqueio de cookies).
const safe = (area) => ({
  get(key) {
    try {
      return window[area].getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window[area].setItem(key, value);
    } catch {
      /* ignora */
    }
  }
});

export const local = safe('localStorage');
export const session = safe('sessionStorage');
