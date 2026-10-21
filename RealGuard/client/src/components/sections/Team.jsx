import { useCallback, useEffect, useRef, useState } from 'react';
import { getTeam } from '../../services/api.js';
import { useApiData } from '../../hooks/useApiData.js';
import { pad2, reduceMotion } from '../../utils/motion.js';
import Icon from '../ui/Icon.jsx';

function ProfileLink({ url, icon, label }) {
  if (!url) {
    return (
      <span className="lk empty" title="Adicione o link em server/src/data/team.json">
        <Icon name={icon} />
        {label}
      </span>
    );
  }
  return (
    <a className="lk" href={url} target="_blank" rel="noopener noreferrer">
      <Icon name={icon} />
      {label}
    </a>
  );
}

function Member({ m }) {
  const [photoOk, setPhotoOk] = useState(Boolean(m.foto));
  return (
    <li className="member">
      <div className="ph">
        <span>{m.iniciais}</span>
        {photoOk && <img src={m.foto} alt="" onError={() => setPhotoOk(false)} />}
      </div>
      <div className="m-body">
        <div className="m-id">
          <b>{m.nome}</b>
          <small className={m.funcao ? '' : 'empty'}>{m.funcao || 'Função no projeto'}</small>
        </div>
        <p className={'m-about' + (m.sobre ? '' : ' empty')}>{m.sobre || 'Uma frase sobre você e o que fez no RealGuard.'}</p>
        <div className="m-links">
          <ProfileLink url={m.linkedin} icon="linkedin" label="LinkedIn" />
          <ProfileLink url={m.github} icon="github" label="GitHub" />
        </div>
      </div>
    </li>
  );
}

// Carrossel: 3 por vez no computador, 2 no tablet, 1 no celular (definido no CSS).
export default function Team() {
  const { data: team, error } = useApiData(getTeam);
  const members = team || [];
  const trackRef = useRef(null);
  const [view, setView] = useState({ page: 0, pages: 1, label: '' });

  const measure = useCallback(() => {
    const track = trackRef.current;
    const cards = [...track.children];
    const step = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
    const perView = Math.max(1, Math.floor((track.clientWidth + 12) / step));
    const pages = Math.ceil(cards.length / perView);
    const maxLeft = track.scrollWidth - track.clientWidth;
    const page = track.scrollLeft >= maxLeft - 4 ? pages - 1 : Math.round(track.scrollLeft / (perView * step));
    return { total: cards.length, step, perView, pages, maxLeft, page };
  }, []);

  const go = (i) => {
    const m = measure();
    const target = Math.max(0, Math.min(m.pages - 1, i));
    trackRef.current.scrollTo({
      left: Math.min(m.maxLeft, target * m.perView * m.step),
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  };

  useEffect(() => {
    if (!members.length) return;
    const track = trackRef.current;
    const sync = () => {
      const m = measure();
      const first = Math.max(0, Math.min(m.total - m.perView, m.page * m.perView)) + 1;
      const last = Math.min(m.total, first + m.perView - 1);
      const range = m.perView > 1 ? `${pad2(first)}–${pad2(last)}` : pad2(first);
      setView({ page: m.page, pages: m.pages, label: `${range} / ${pad2(m.total)}` });
    };
    let raf;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', sync);
    sync();
    return () => {
      cancelAnimationFrame(raf);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', sync);
    };
  }, [members.length, measure]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(view.page + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(view.page - 1);
    }
  };

  return (
    <section id="equipe" className="sec alt">
      <div className="wrap sec-one">
        <span className="kick">Equipe</span>
        <div>
          <h2 className="h2">Quem fez</h2>
          {error && <p className="lead">Não foi possível carregar a equipe agora.</p>}
          <div className="car">
            <span className="car-count mono">{view.label}</span>
            <div className="car-row">
              <button type="button" className="car-btn" aria-label="Integrante anterior" disabled={view.page <= 0} onClick={() => go(view.page - 1)}>
                <Icon name="arrow-left" />
              </button>
              <ul className="team car-track" ref={trackRef} tabIndex={0} aria-label="Integrantes da equipe" onKeyDown={onKeyDown}>
                {members.map((m) => (
                  <Member key={m.nome} m={m} />
                ))}
              </ul>
              <button
                type="button"
                className="car-btn"
                aria-label="Próximo integrante"
                disabled={view.page >= view.pages - 1}
                onClick={() => go(view.page + 1)}
              >
                <Icon name="arrow-right" />
              </button>
            </div>
            <div className="car-dots" hidden={view.pages < 2}>
              {Array.from({ length: view.pages }, (_, i) => (
                <button
                  type="button"
                  key={i}
                  aria-label={`Página ${i + 1} de ${view.pages}`}
                  aria-current={view.page === i}
                  onClick={() => go(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
