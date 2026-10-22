import { useEffect, useRef, useState } from 'react';
import { reduceMotion } from '../../utils/motion.js';

const PROOF = [
  { n: '0', title: 'imagens enviadas para a nuvem', text: 'Tudo roda na AIBox, dentro da escola. Se a internet cair, a presença continua sendo registrada.' },
  { n: '30', unit: 'dias', title: 'para apagar as fotos dos alertas', text: 'Dados faciais só existem com o termo do responsável. Se ele revogar, são apagados.' },
  { n: 'RTSP', title: 'câmeras que a escola já tem', text: 'Funciona com câmeras IP comuns. Não precisa trocar equipamento.' },
  { n: '0', unit: 'apps', title: 'para a família instalar', text: 'Os avisos chegam no Telegram. O responsável entra por um link de convite.' },
  { n: '199', title: 'testes automatizados', text: 'O sistema se recupera sozinho de falhas e faz backup todos os dias.' }
];

// Os números passam sozinhos; a barra de cada um mostra quanto falta para o próximo.
// Pausa com o mouse em cima, com o foco do teclado ou fora da tela.
export default function Differentials() {
  const [cur, setCur] = useState(0);
  const [hold, setHold] = useState(false);
  const [inView, setInView] = useState(false);
  const showRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(showRef.current);
    return () => io.disconnect();
  }, []);

  const next = () => setCur((i) => (i + 1) % PROOF.length);
  const playing = inView && !hold && !reduceMotion;
  const p = PROOF[cur];

  return (
    <section id="diferenciais" className="sec alt">
      <div className="wrap sec-one">
        <span className="kick">Diferenciais</span>
        <div className="dif-head">
          <h2 className="h2">Por que o RealGuard</h2>
          <p className="lead">Cinco números que resumem como o RealGuard trabalha dentro da escola.</p>
        </div>

        <div
          className={'pf-show' + (playing ? '' : ' paused')}
          ref={showRef}
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocus={(e) => e.target.matches(':focus-visible') && setHold(true)}
          onBlur={() => setHold(false)}
        >
          <div className="pf-stage" aria-live="polite">
            <div className="pf-slide" key={cur}>
              <span className="pf-n pf-big">
                {p.n}
                {p.unit && <small>{p.unit}</small>}
              </span>
              <div className="pf-txt">
                <b>{p.title}</b>
                <p>{p.text}</p>
              </div>
            </div>
          </div>

          <div className="pf-nav" role="tablist" aria-label="Diferenciais">
            {PROOF.map((item, i) => (
              <button
                type="button"
                role="tab"
                className="pf-tab"
                key={item.title}
                aria-selected={i === cur}
                data-done={i < cur || undefined}
                onClick={() => setCur(i)}
              >
                <span className="pf-bar">
                  <i key={i === cur ? `on-${cur}` : 'off'} onAnimationEnd={i === cur ? next : undefined} />
                </span>
                <span className="pf-mini">
                  {item.n}
                  {item.unit && <small>{item.unit}</small>}
                </span>
                <span className="pf-lbl">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
