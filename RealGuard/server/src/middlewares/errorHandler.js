export function notFound(_req, res) {
  res.status(404).json({ ok: false, error: 'Rota não encontrada.' });
}

// O Express só reconhece o tratador de erros pelos 4 parâmetros.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  console.error('[RealGuard]', err);
  res.status(err.status || 500).json({ ok: false, error: 'Erro interno. Tente de novo em instantes.' });
}
