import { useEffect, useRef, useState } from 'react';
import { useLead } from '../../context/LeadContext.jsx';
import { sendLead } from '../../services/api.js';
import Icon from './Icon.jsx';

const EMPTY = { nome: '', email: '', telefone: '', website: '', consentimento: false };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f) {
  if (!f.nome.trim()) return 'Preencha seu nome.';
  if (!EMAIL.test(f.email.trim())) return 'Confira o e-mail: ele precisa ter o formato nome@dominio.com.';
  if (!f.consentimento) return 'Marque a autorização para podermos entrar em contato.';
  return '';
}

export default function LeadModal() {
  const { open, closeLead, markDone } = useLead();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState(false);
  const nameRef = useRef(null);
  const lastFocus = useRef(null);

  // Ao abrir: volta para o formulário, trava a rolagem e foca o nome. Ao fechar: devolve o foco.
  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    setThanks(false);
    setError('');
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => nameRef.current?.focus(), 80);
    const onKey = (e) => e.key === 'Escape' && closeLead();
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      lastFocus.current?.focus?.();
    };
  }, [open, closeLead]);

  const update = (e) => {
    const { name, type, checked, value } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.website) return; // campo-isca para robôs
    const problem = validate(form);
    if (problem) return setError(problem);

    setSending(true);
    try {
      await sendLead({
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: form.telefone.trim(),
        consentimento: 'sim',
        origem: new URLSearchParams(window.location.search).get('origem') || 'site',
        website: form.website
      });
      setForm(EMPTY);
      markDone();
      setThanks(true);
    } catch (err) {
      setError(err.fromServer ? err.message : 'Não foi possível enviar agora. Confira sua conexão e tente de novo.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className={'modal' + (open ? ' open' : '')}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leadTitle"
      aria-hidden={!open}
      onClick={(e) => e.target === e.currentTarget && closeLead()}
    >
      <div className="sheet">
        <button type="button" className="x" aria-label="Fechar" onClick={closeLead}>
          <Icon name="x" />
        </button>

        <div className={thanks ? 'hidden' : ''}>
          <div className="sym" />
          <h2 id="leadTitle">Quer conhecer o RealGuard de perto?</h2>
          <p className="sub">Deixe seu contato e a equipe fala com você depois do NEXT.</p>
          <form className="form" noValidate onSubmit={handleSubmit}>
            <label htmlFor="f-nome">
              Nome *
              <input ref={nameRef} id="f-nome" name="nome" type="text" required autoComplete="name" value={form.nome} onChange={update} />
            </label>
            <label htmlFor="f-email">
              E-mail *
              <input id="f-email" name="email" type="email" required autoComplete="email" value={form.email} onChange={update} />
            </label>
            <label htmlFor="f-tel">
              Telefone / WhatsApp
              <input id="f-tel" name="telefone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 90000-0000" value={form.telefone} onChange={update} />
            </label>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" value={form.website} onChange={update} />
            <label className="consent" htmlFor="f-consent">
              <input type="checkbox" name="consentimento" id="f-consent" required checked={form.consentimento} onChange={update} />
              <span>
                Autorizo o Grupo 05 a guardar estes dados apenas para entrar em contato sobre o RealGuard. Posso pedir a exclusão a qualquer momento.
              </span>
            </label>
            {error && (
              <p className="err" role="alert">
                {error}
              </p>
            )}
            <div className="acts">
              <button type="button" className="btn btn-line" onClick={closeLead}>
                Agora não
              </button>
              <button type="submit" className="btn btn-gold" disabled={sending}>
                {sending ? 'Enviando…' : 'Enviar contato'}
              </button>
            </div>
          </form>
        </div>

        <div className={'thanks' + (thanks ? '' : ' hidden')}>
          <div className="ok">
            <Icon name="check" />
          </div>
          <h2>Contato enviado</h2>
          <p className="sub">Obrigado! A equipe RealGuard vai falar com você em breve.</p>
          <button type="button" className="btn btn-line" style={{ marginTop: 22 }} onClick={closeLead}>
            Voltar ao site
          </button>
        </div>
      </div>
    </div>
  );
}
