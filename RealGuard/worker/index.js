// Worker da Cloudflare: responde a API (/api/*) no site publicado.
// O restante (o site React em client/dist) é entregue pelos "assets".
// Os dados vêm dos mesmos arquivos usados pelo servidor Node.
import team from '../server/src/data/team.json';
import videos from '../server/src/data/videos.json';
import { validateLead } from '../server/src/utils/validateLead.js';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });

async function createLead(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Dados inválidos.' }, 400);
  }

  // Campo "website" escondido: só robôs preenchem. Fingimos sucesso e descartamos.
  if (body.website) return json({ ok: true }, 201);

  const { errors, lead } = validateLead(body);
  if (errors.length) return json({ ok: false, error: errors[0] }, 400);

  // Aqui não há arquivo para guardar uma cópia: sem planilha, o contato se perderia.
  if (!env.SHEETS_URL) {
    console.error('[RealGuard] SHEETS_URL não configurada no Worker');
    return json({ ok: false, error: 'O cadastro está indisponível no momento. Tente mais tarde.' }, 503);
  }

  try {
    const res = await fetch(env.SHEETS_URL, { method: 'POST', body: new URLSearchParams(lead) });
    if (!res.ok) throw new Error(`Planilha respondeu ${res.status}`);
  } catch (err) {
    console.error('[RealGuard] falha ao enviar para a planilha:', err.message);
    return json({ ok: false, error: 'Não foi possível salvar seu contato agora. Tente de novo em instantes.' }, 502);
  }
  return json({ ok: true }, 201);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    const route = `${request.method} ${pathname.replace(/\/+$/, '')}`;

    switch (route) {
      case 'GET /api/health':
        return json({ status: 'ok', time: new Date().toISOString() });
      case 'GET /api/team':
        return json(team);
      case 'GET /api/videos':
        return json(videos);
      case 'POST /api/leads':
        return createLead(request, env);
    }

    if (pathname.startsWith('/api/')) return json({ ok: false, error: 'Rota não encontrada.' }, 404);
    return env.ASSETS.fetch(request);
  }
};
