// Chamadas ao backend Node. Em desenvolvimento o Vite repassa /api para a porta 3001.
async function request(path, options) {
  const res = await fetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Erro ${res.status}`);
    err.fromServer = Boolean(data.error);
    throw err;
  }
  return data;
}

export const getTeam = () => request('/api/team');
export const getVideos = () => request('/api/videos');

export const sendLead = (lead) =>
  request('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead)
  });
