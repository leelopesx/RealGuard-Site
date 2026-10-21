import { useEffect, useRef } from 'react';
import { reduceMotion } from '../../utils/motion.js';

const Row = ({ name, pill, children }) => (
  <div className="row">
    <span>{name}</span>
    <span className={`st-pill ${pill}`}>{children}</span>
  </div>
);

const EVENTS = [
  {
    time: '06:58',
    title: 'Presença automática',
    text: 'Ana passa pelo portão sem parar e sem crachá. A presença fica registrada na turma e no turno dela. Ninguém faz chamada.',
    to: ['Painel'],
    label: 'Exemplo de chamada',
    art: (
      <>
        <Row name="Ana Souza" pill="ok">06:58 PRESENTE</Row>
        <Row name="Carla Dias" pill="ok">07:03 PRESENTE</Row>
        <Row name="Bruno Lima" pill="late">07:24 ATRASO</Row>
      </>
    )
  },
  {
    time: '07:02',
    title: 'A família fica sabendo',
    text: 'Os responsáveis recebem no Telegram quando o aluno chega, se atrasa ou sai, com nome, horário e turno. O cadastro do responsável é feito por um link de convite.',
    to: ['Família'],
    art: (
      <div className="tgline">
        🟢 <b>Entrada registrada</b>
        <br />
        Ana Souza · 1º A · RM 000123
        <br />
        07:02 · chegou dentro do horário<time>07:02</time>
      </div>
    )
  },
  {
    time: '07:16',
    title: 'Aviso de ausência',
    text: 'A tolerância do turno da manhã acaba às 07:15. Diego ainda não passou pelo portão, então a família recebe um aviso. Se ele estiver a caminho, é só desconsiderar.',
    to: ['Família', 'Painel'],
    art: (
      <>
        <div className="row">
          <span className="k">Turno</span>
          <span className="mono">manhã · 07:00</span>
        </div>
        <div className="row">
          <span className="k">Tolerância</span>
          <span className="mono">até 07:15</span>
        </div>
        <Row name="Diego Reis" pill="no">AUSENTE</Row>
      </>
    )
  },
  {
    time: '07:35',
    title: 'Alerta para a portaria',
    text: 'Alguém fica mais de 3 segundos na entrada sem mostrar o rosto. A portaria recebe a foto do momento e decide pelos botões. Toda ocorrência fica registrada no painel.',
    to: ['Portaria', 'Painel'],
    art: (
      <div className="tgline">
        ⚠️ <b>Possível rosto obstruído</b>
        <br />
        CAM 01 · 07:35 · alerta nº 160
        <div className="tgbtns">
          <span>Ver foto</span>
          <span>Confirmar</span>
          <span>Descartar</span>
        </div>
      </div>
    )
  },
  {
    time: '18:00',
    title: 'Relatório no painel',
    text: 'A coordenação abre o painel no navegador: frequência por período, turno e turma, faltas, saídas antecipadas e ocorrências. Tudo exporta para planilha.',
    to: ['Coordenação'],
    label: 'Exemplo de frequência semanal',
    chart: true
  }
];

const WEEK = [
  ['SEG', 92],
  ['TER', 88],
  ['QUA', 95],
  ['QUI', 81],
  ['SEX', 97]
];

export default function DaySection() {
  const dayRef = useRef(null);
  const fillRef = useRef(null);
  const barsRef = useRef(null);

  // A linha do dia se preenche e cada horário acende conforme a rolagem.
  useEffect(() => {
    const day = dayRef.current;
    const evs = [...day.querySelectorAll('.ev')];
    const update = () => {
      const mid = window.innerHeight * 0.55;
      const r = day.getBoundingClientRect();
      const p = reduceMotion ? 1 : Math.min(1, Math.max(0, (mid - r.top) / r.height));
      fillRef.current.style.setProperty('--p', p.toFixed(3));
      evs.forEach((ev) => ev.classList.toggle('on', reduceMotion || ev.getBoundingClientRect().top < mid));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // As barras do gráfico crescem quando entram na tela.
  useEffect(() => {
    const bars = barsRef.current;
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    if (bars.getBoundingClientRect().top <= window.innerHeight) return;
    bars.classList.add('pre');
    let t;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      t = setTimeout(() => bars.classList.remove('pre'), 250);
      io.disconnect();
    });
    io.observe(bars);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  return (
    <section id="dia" className="sec alt">
      <div className="wrap sec-grid">
        <div className="rail">
          <span className="ch">Recursos</span>
          <span className="t">
            06:58<small className="to-end">até 18:00</small>
          </span>
          <span className="what">Um turno inteiro, do portão ao relatório.</span>
        </div>
        <div>
          <h2 className="h2">Um dia na escola com o RealGuard</h2>
          <p className="lead">
            Uma câmera na entrada e uma AIBox. A partir daí, a presença, os avisos e os alertas acontecem sozinhos. Veja o que
            acontece em cada horário.
          </p>
          <div className="day" ref={dayRef}>
            <div className="day-line">
              <i ref={fillRef} />
            </div>

            {EVENTS.map((ev) => (
              <div className="ev" key={ev.time}>
                <span className="t">{ev.time}</span>
                <div>
                  <h3>{ev.title}</h3>
                  <p>{ev.text}</p>
                  <div className="to">
                    {ev.to.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="art" aria-label={ev.label}>
                  {ev.chart ? (
                    <>
                      <div className="row" style={{ border: 0, paddingTop: 0 }}>
                        <span>Frequência · 1º A</span>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--dim)' }}>
                          exemplo
                        </span>
                      </div>
                      <div className="bars" ref={barsRef}>
                        {WEEK.map(([d, h]) => (
                          <span key={d} style={{ '--h': `${h}%` }} />
                        ))}
                      </div>
                      <div className="bars-l">
                        {WEEK.map(([d]) => (
                          <span key={d}>{d}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    ev.art
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
