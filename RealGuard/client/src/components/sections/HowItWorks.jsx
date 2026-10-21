import { useEffect, useRef } from 'react';
import { reduceMotion } from '../../utils/motion.js';
import Icon from '../ui/Icon.jsx';

const STEPS = [
  {
    icon: 'video',
    title: 'A câmera capta',
    tab: 'a câmera capta',
    text: 'O aluno passa pelo portão normalmente, sem parar e sem crachá. A câmera envia o vídeo para a AIBox pela rede da escola.',
    code: 'RTSP · H.264'
  },
  {
    icon: 'cpu',
    title: 'A IA identifica',
    tab: 'a IA identifica',
    text: 'A AIBox encontra cada pessoa, acompanha o movimento dela e compara o rosto com os alunos cadastrados.',
    code: 'YOLOv8n · InsightFace'
  },
  {
    icon: 'sliders',
    title: 'As regras decidem',
    tab: 'as regras decidem',
    text: 'O sistema confere o turno e a tolerância do aluno: é entrada, saída, atraso ou uma situação de segurança.',
    code: 'turno · tolerância · área'
  },
  {
    icon: 'send',
    title: 'Todos ficam sabendo',
    tab: 'todos ficam sabendo',
    text: 'A presença vai para o painel, a família recebe o aviso no Telegram e a portaria recebe os alertas.',
    code: 'painel · Telegram'
  }
];

const NAV_H = 64;
const isStatic = () => reduceMotion || window.innerHeight < 520;

export default function HowItWorks() {
  const stpRef = useRef(null);
  const closeRef = useRef(null);

  // A seção fica presa na tela e cada card acende conforme a rolagem avança.
  useEffect(() => {
    const stp = stpRef.current;
    const cards = [...stp.querySelectorAll('.fc')];
    const tabs = [...stp.querySelectorAll('.stp-tab')];
    const close = closeRef.current;
    let cur = -1;

    const update = () => {
      stp.classList.toggle('static', isStatic());
      if (stp.classList.contains('static')) {
        cards.forEach((el) => el.classList.add('on'));
        close.classList.add('on');
        cur = -1;
        return;
      }
      const r = stp.getBoundingClientRect();
      const pinH = stp.firstElementChild.offsetHeight;
      const sp = Math.min(1, Math.max(0, (NAV_H - r.top) / Math.max(1, r.height - pinH)));
      const f = sp * 4;
      const now = Math.min(3, Math.floor(f));
      const inner = sp >= 1 ? 1 : f - now;
      if (now !== cur) {
        cards.forEach((el, i) => {
          el.classList.toggle('on', i <= now);
          el.classList.toggle('cur', i === now);
        });
        tabs.forEach((el, i) => el.setAttribute('aria-selected', i === now));
        cur = now;
      }
      tabs.forEach((el, i) =>
        el.style.setProperty('--f', i < now ? 1 : i === now ? Math.max(0.04, inner).toFixed(3) : 0)
      );
      close.classList.toggle('on', now === 3 && inner > 0.5);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const goTo = (i) => {
    const stp = stpRef.current;
    const r = stp.getBoundingClientRect();
    const pinH = stp.firstElementChild.offsetHeight;
    window.scrollTo({ top: r.top + window.scrollY - NAV_H + ((i + 0.15) / 4) * (r.height - pinH) });
  };

  return (
    <section id="como-funciona" className="sec flowsec">
      <div className="stp" ref={stpRef}>
        <div className="stp-pin fpin">
          <div className="wrap fpin-in">
            <div className="flowc-head">
              <div>
                <span className="kick">Como funciona</span>
                <h2 className="h2">Do portão ao celular em quatro etapas</h2>
              </div>
              <p className="lead">Role a página e acompanhe uma única passagem pelo portão.</p>
            </div>

            <div className="fc-grid">
              {STEPS.map((s, i) => (
                <article className="fc" key={s.title}>
                  <div className="fc-top">
                    <span className="fc-n">{String(i + 1).padStart(2, '0')}</span>
                    <span className="fc-ic">
                      <Icon name={s.icon} />
                    </span>
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <code>{s.code}</code>
                </article>
              ))}
            </div>

            <div className="stp-tabs" role="tablist" aria-label="Etapas">
              {STEPS.map((s, i) => (
                <button type="button" className="stp-tab" key={s.tab} onClick={() => goTo(i)}>
                  <span className="seg">
                    <i />
                  </span>
                  <span className="lb">
                    <b>{String(i + 1).padStart(2, '0')}</b>
                    <span>{s.tab}</span>
                  </span>
                </button>
              ))}
            </div>

            <p className="close-line" ref={closeRef}>
              Nenhum professor fez chamada. <span>Nenhuma imagem saiu da escola.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
