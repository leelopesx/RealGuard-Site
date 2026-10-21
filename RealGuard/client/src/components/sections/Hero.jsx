import { useEffect, useRef, useState } from 'react';
import { finePointer, pad2, reduceMotion } from '../../utils/motion.js';
import PhoneLayers from '../ui/PhoneLayers.jsx';
import LeadButton from '../ui/LeadButton.jsx';

const VOTE_TIMES = [1300, 1800, 2300];
const CYCLE_MS = 8000;

function Person({ className }) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="50" cy="32" r="20" />
      <path d="M12 120c0-28 17-48 38-48s38 20 38 48z" />
    </svg>
  );
}

export default function Hero({ ready }) {
  const [sec, setSec] = useState(14);
  // Ciclo da câmera: avaliando → voto 3/5 → reconhecido → chega no celular.
  const [det, setDet] = useState(reduceMotion ? 'ok' : 'off');
  const [votes, setVotes] = useState(reduceMotion ? 3 : 0);
  const [bubbleOn, setBubbleOn] = useState(reduceMotion);
  const stageRef = useRef(null);
  const rigRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setSec((s) => (s + 1) % 60), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (reduceMotion || !ready) return;
    let timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const cycle = () => {
      timers.forEach(clearTimeout);
      timers = [];
      setDet('off');
      setVotes(0);
      setBubbleOn(false);
      later(() => setDet('eval'), 700);
      VOTE_TIMES.forEach((ms, i) => later(() => setVotes(i + 1), ms));
      later(() => setDet('ok'), 2700);
      later(() => setBubbleOn(true), 3300);
    };
    cycle();
    const id = setInterval(cycle, CYCLE_MS);
    return () => {
      clearInterval(id);
      timers.forEach(clearTimeout);
    };
  }, [ready]);

  // O palco gira com o cursor e com a rolagem.
  useEffect(() => {
    if (reduceMotion) return;
    const stage = stageRef.current;
    const rig = rigRef.current;
    let pRX = 0;
    let pRY = 0;
    const apply = () => {
      const r = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const sc = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
      rig.style.setProperty('--ry', (-14 + pRY + sc * -10).toFixed(2) + 'deg');
      rig.style.setProperty('--rx', (6 + pRX + sc * 6).toFixed(2) + 'deg');
    };
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      pRY = ((e.clientX - r.left) / r.width - 0.5) * 22;
      pRX = -((e.clientY - r.top) / r.height - 0.5) * 12;
      apply();
    };
    const onLeave = () => {
      pRX = pRY = 0;
      apply();
    };
    if (finePointer) {
      stage.addEventListener('pointermove', onMove);
      stage.addEventListener('pointerleave', onLeave);
    }
    window.addEventListener('scroll', apply, { passive: true });
    apply();
    return () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', apply);
    };
  }, []);

  const walk = reduceMotion ? '' : ' walk';

  return (
    <header className="hero" id="topo">
      <div className="wrap hero-grid">
        <div>
          <h1>
            <span className="ln">
              <span>A câmera vê.</span>
            </span>
            <span className="ln">
              <span className="l2">A escola registra.</span>
            </span>
            <span className="ln">
              <span className="l3">A família fica sabendo.</span>
            </span>
          </h1>
          <p className="lead">
            O RealGuard reconhece o aluno na entrada, registra a presença sozinho e avisa os responsáveis no Telegram. Tudo é
            processado dentro da escola, na AIBox Daten. Nenhuma imagem vai para a nuvem.
          </p>
          <div className="hero-ctas">
            <LeadButton arrow />
            <a href="#telegram" className="btn btn-line">
              Testar o Telegram
            </a>
          </div>
        </div>

        <div
          className="stage"
          ref={stageRef}
          aria-label="Demonstração: o aluno é reconhecido na câmera e o responsável recebe o aviso no celular"
        >
          <div className="rig" ref={rigRef}>
            <div className="shadow-floor" />
            <div className="feed">
              <div className="feed-bar">
                <span className="rec">
                  <i />
                  CAM 01 · ENTRADA
                </span>
                <span>07:02:{pad2(sec)}</span>
              </div>
              <div className="feed-view">
                <div className="door" />
                <div className="floor" />
                <Person className={'person' + walk} />
                <div className={'det' + walk} data-state={det}>
                  <span className="tag">{det === 'ok' ? 'Reconhecido' : 'Avaliando'}</span>
                  <span className="who">ANA SOUZA · 1º A</span>
                </div>
                <div className="votes" aria-hidden="true">
                  VOTO{' '}
                  <span>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <i key={i} className={i < votes ? 'on' : ''} />
                    ))}
                  </span>
                </div>
                <div className="noise" />
              </div>
              <div className="feed-foot">
                <span>PROCESSADO NA AIBOX</span>
                <span>SEM NUVEM</span>
              </div>
            </div>

            <div className={'ph3d hero-phone' + (reduceMotion ? '' : ' float')}>
              <div className="body">
                <PhoneLayers />
              </div>
              <div className="back" style={{ transform: 'translateZ(-15px) rotateY(180deg)' }}>
                <span className="sym" />
              </div>
              <div className="face" style={{ transform: 'translateZ(1px)' }}>
                <div className="mini-scr">
                  <div className="st" />
                  <div className="hd">
                    <span className="av">
                      <span className="sym" />
                    </span>
                    <span>
                      Realguard Bot<small>bot</small>
                    </span>
                  </div>
                  <div className="bd">
                    <div className="bub">
                      ✅ <b>Pronto!</b> Você recebe os avisos de Ana Souza (1º A).<time>07:00</time>
                    </div>
                    <div className={'bub' + (bubbleOn ? '' : ' pend')}>
                      <div className="pic" />
                      🟢 <b>Entrada registrada</b>
                      <br />
                      Ana Souza · 1º A<br />
                      07:02 · dentro do horário<time>07:02</time>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
