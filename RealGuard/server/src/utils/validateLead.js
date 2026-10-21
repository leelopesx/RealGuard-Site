const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);

export function validateLead(body) {
  const errors = [];
  const nome = clean(body.nome);
  const email = clean(body.email);
  const telefone = clean(body.telefone, 40);
  const consentimento = body.consentimento === true || body.consentimento === 'sim';

  if (!nome) errors.push('Preencha seu nome.');
  if (!EMAIL.test(email)) errors.push('Confira o e-mail: ele precisa ter o formato nome@dominio.com.');
  if (!consentimento) errors.push('Marque a autorização para podermos entrar em contato.');

  const lead = {
    data_hora: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    nome,
    email,
    telefone,
    consentimento: 'sim',
    origem: clean(body.origem, 60) || 'site'
  };

  return { errors, lead };
}
