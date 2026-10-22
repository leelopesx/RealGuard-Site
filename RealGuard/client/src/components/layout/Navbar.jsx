import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import Icon from '../ui/Icon.jsx';
import LeadButton from '../ui/LeadButton.jsx';

export const NAV_LINKS = [
  ['dia', 'Um dia'],
  ['como-funciona', 'Como funciona'],
  ['seguranca', 'Segurança'],
  ['telegram', 'Telegram'],
  ['video', 'Vídeos'],
  ['equipe', 'Equipe']
];

export const CHALLENGE_URL = 'https://experience.fiap.com.br/next#challenges';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');

  // Destaca no menu a seção que está no meio da tela.
  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    NAV_LINKS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });
    return () => spy.disconnect();
  }, []);

  const light = theme === 'light';
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="nav">
      <div className="wrap nav-in">
        <a href="#topo" className="brand" aria-label="RealGuard, início">
          <span className="sym" />
          <span className="wordmark">
            <span>REAL</span>GUARD
          </span>
        </a>
        <div className="nav-links">
          {NAV_LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : 'false'}>
              {label}
            </a>
          ))}
        </div>
        <button
          type="button"
          className={'theme-btn' + (light ? ' is-light' : '')}
          aria-label={light ? 'Mudar para o modo escuro' : 'Mudar para o modo claro'}
          onClick={toggle}
        >
          <Icon name="sun" className="i-sun" />
          <Icon name="moon" className="i-moon" />
        </button>
        <LeadButton className="nav-cta" />
        <button
          type="button"
          className="menu-btn"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <Icon name="menu" />
        </button>
      </div>

      <div className={'mnav' + (menuOpen ? '' : ' hidden')} onClick={(e) => e.target.closest('a,button') && closeMenu()}>
        <div className="wrap">
          {NAV_LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
          <a href={CHALLENGE_URL} target="_blank" rel="noopener noreferrer">
            Challenge FIAP ↗
          </a>
          <LeadButton />
        </div>
      </div>
    </nav>
  );
}
