// Limite simples em memória por IP (suficiente para um site de apresentação).
export function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      return res.status(429).json({ ok: false, error: 'Muitas tentativas. Aguarde um minuto.' });
    }
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}
