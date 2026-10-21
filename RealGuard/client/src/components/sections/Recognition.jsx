import { useEffect, useRef, useState } from 'react';
import { reduceMotion } from '../../utils/motion.js';

const STATES = {
  ok: {
    color: 'var(--good)',
    tag: 'ANA SOUZA · 1º A',
    meta: 'conf. 0,87 · 3/5',
    title: 'Reconhecido',
    colorName: 'verde',
    text: 'Aluno cadastrado e identificado. A presença é registrada e a família é avisada.'
  },
  unk: {
    color: 'var(--bad)',
    tag: 'NÃO RECONHECIDO',
    meta: 'sem cadastro',
    title: 'Não reconhecido',
    colorName: 'vermelho',
    text: 'Rosto visível que não é de nenhum aluno cadastrado, como um visitante.'
  },
  obs: {
    color: 'var(--warn)',
    tag: 'ROSTO OBSTRUÍDO',
    meta: '3,4 s · alerta enviado',
    title: 'Rosto obstruído',
    colorName: 'laranja',
    text: 'Mais de 3 segundos na entrada sem mostrar o rosto: capuz, capacete ou de costas. Gera alerta.'
  },
  eval: {
    color: 'var(--eval)',
    tag: 'AVALIANDO',
    meta: 'leitura 2 de 5',
    title: 'Avaliando',
    colorName: 'cinza',
    text: 'A pessoa acabou de aparecer e o sistema ainda está juntando imagens para decidir.'
  }
};

const BUTTON_ORDER = ['ok', 'unk', 'obs', 'eval'];
const AUTO_ORDER = ['ok', 'eval', 'unk', 'obs'];

export default function Recognition() {
  const [current, setCurrent] = useState('ok');
  const rvRef = useRef(null);
  const manual = useRef(false);
  const stopAuto = useRef(() => {});

  // Troca de estado sozinha enquanto está na tela, até a pessoa escolher um.
  useEffect(() => {
    if (reduceMotion) return;
    let timer = null;
    let idx = 0;
    const stop = () => {
      clearInterval(timer);
      timer = null;
    };
    stopAuto.current = stop;
    const io = new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !timer && !manual.current) {
        timer = setInterval(() => {
          idx = (idx + 1) % AUTO_ORDER.length;
          setCurrent(AUTO_ORDER[idx]);
        }, 3000);
      } else if (!visible && timer) stop();
    });
    io.observe(rvRef.current);
    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  const choose = (key) => {
    manual.current = true;
    stopAuto.current();
    setCurrent(key);
  };

  const s = STATES[current];

  return (
    <section id="reconhecimento" className="sec alt">
      <div className="wrap sec-one">
        <span className="kick">Reconhecimento</span>
        <div>
          <h2 className="h2">O que a câmera enxerga</h2>
          <p className="lead">Cada pessoa na imagem ganha uma cor. Escolha uma para ver como a portaria enxerga.</p>
          <div className="recog">
            <div className="rv" ref={rvRef} data-s={current}>
              <div className="rv-hud">
                <span>CAM 01 · ENTRADA</span>
                <span>07:03:02</span>
              </div>
              <svg viewBox="0 0 100 120" className="rv-person" aria-hidden="true">
                <circle cx="50" cy="32" r="20" fill="currentColor" />
                <path d="M12 120c0-28 17-48 38-48s38 20 38 48z" fill="currentColor" />
                <path className="rv-hood" d="M26 38c0-22 12-32 24-32s24 10 24 32v12c-6-8-14-12-24-12s-18 4-24 12z" fill="#0b1426" />
              </svg>
              <div className="rv-box" style={{ '--c': s.color }}>
                <span className="tag">{s.tag}</span>
                <span className="meta">{s.meta}</span>
              </div>
              <div className="noise" />
            </div>

            <div className="states" role="group" aria-label="Estados de reconhecimento">
              {BUTTON_ORDER.map((key) => {
                const st = STATES[key];
                return (
                  <button
                    type="button"
                    className="state"
                    key={key}
                    style={{ '--c': st.color }}
                    aria-pressed={current === key}
                    onClick={() => choose(key)}
                  >
                    <span className="sw" />
                    <span>
                      <b>
                        {st.title} <em>{st.colorName}</em>
                      </b>
                      <small>{st.text}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
