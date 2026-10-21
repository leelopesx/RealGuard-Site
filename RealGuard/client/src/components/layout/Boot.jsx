import { useCallback, useEffect, useRef, useState } from 'react';
import { reduceMotion } from '../../utils/motion.js';
import { session } from '../../utils/storage.js';

// Abertura: completa na 1ª visita da sessão, rápida nas outras.
function firstVisitThisSession() {
  const seen = session.get('rg_boot') === '1';
  session.set('rg_boot', '1');
  return !seen;
}

export default function Boot({ onDone }) {
  const [first] = useState(firstVisitThisSession);
  const [phase, setPhase] = useState(reduceMotion ? 'gone' : 'show'); // show → leaving → gone
  const [status, setStatus] = useState('AIBox Daten · carregando');
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setPhase('leaving');
    onDone();
    setTimeout(() => setPhase('gone'), 500);
  }, [onDone]);

  useEffect(() => {
    if (reduceMotion) return onDone();
    const timers = [];
    if (first) {
      timers.push(setTimeout(() => setStatus('Modelos de IA prontos'), 1500));
      timers.push(setTimeout(() => setStatus('CAM 01 conectada'), 1950));
    }
    timers.push(setTimeout(finish, first ? 2500 : 700));
    return () => timers.forEach(clearTimeout);
  }, [first, finish, onDone]);

  const cls = ['boot', !first && 'quick', phase !== 'show' && 'leaving', phase === 'gone' && 'gone'].filter(Boolean).join(' ');

  return (
    <div className={cls} aria-hidden="true" onClick={finish}>
      <div className="boot-in">
        <div className="visor">
          <span className="v-sym" />
          <span className="v-cor" />
        </div>
        <div className="boot-wm">
          <span>REAL</span>GUARD
        </div>
        <div className="boot-tl">PROTEÇÃO REAL, EM TEMPO REAL</div>
        <div className="boot-bar">
          <b />
        </div>
        <div className="boot-st">
          <i />
          <span>{status}</span>
        </div>
      </div>
    </div>
  );
}
