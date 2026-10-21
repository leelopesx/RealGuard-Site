import { useEffect, useRef } from 'react';
import { finePointer, reduceMotion } from '../../utils/motion.js';
import { createTelegramSimulator } from '../telegram/telegramSimulator.js';
import PhoneLayers from '../ui/PhoneLayers.jsx';

function StatusIcons() {
  return (
    <span className="ios-icons">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="#fff">
        <rect x="0" y="7" width="3" height="4" rx="1" />
        <rect x="4.5" y="5" width="3" height="6" rx="1" />
        <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
        <rect x="13.5" y="0" width="3" height="11" rx="1" />
      </svg>
      <svg width="25" height="12" viewBox="0 0 25 12">
        <rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="#fff" opacity=".5" />
        <rect x="2" y="2" width="16" height="8" rx="1.5" fill="#fff" />
        <rect x="23" y="4" width="1.5" height="4" rx=".7" fill="#fff" opacity=".5" />
      </svg>
    </span>
  );
}

// Este componente não tem estado: o conteúdo do chat é controlado pelo simulador.
export default function TelegramSection() {
  const sectionRef = useRef(null);
  const p3dRef = useRef(null);

  useEffect(() => createTelegramSimulator(sectionRef.current), []);

  // O iPhone gira com o cursor (e fica reto durante a demonstração).
  useEffect(() => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    const p3d = p3dRef.current;
    const stage = p3d.parentElement;
    const screen = p3d.querySelector('.iphone-screen');
    let tx = 0;
    let ty = -10;
    const apply = () => {
      const demo = Boolean(screen.querySelector('.tg-block'));
      p3d.style.setProperty('--ry', (demo ? 0 : ty).toFixed(2) + 'deg');
      p3d.style.setProperty('--rx', (demo ? 0 : tx).toFixed(2) + 'deg');
    };
    const onMove = (e) => {
      const r = stage.getBoundingClientRect();
      ty = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 1.5))) * 16;
      tx = -Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height)) * 8;
      apply();
    };
    const onLeave = () => {
      tx = 0;
      ty = -10;
      apply();
    };
    const spin = (e) => {
      if (!e.target.closest('.tg-mode')) return;
      p3d.classList.remove('spin');
      void p3d.offsetWidth;
      p3d.classList.add('spin');
    };
    const unspin = () => p3d.classList.remove('spin');

    if (finePointer) {
      section.addEventListener('pointermove', onMove);
      section.addEventListener('pointerleave', onLeave);
    }
    section.addEventListener('click', spin);
    p3d.addEventListener('animationend', unspin);
    const mo = new MutationObserver(apply);
    mo.observe(screen, { childList: true });
    apply();
    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      section.removeEventListener('click', spin);
      p3d.removeEventListener('animationend', unspin);
      mo.disconnect();
    };
  }, []);

  return (
    <section id="telegram" className="sec alt" ref={sectionRef}>
      <div className="wrap sec-one">
        <div className="tg-section">
          <div className="tg-wrap">
            <div className="tg-head">
              <span className="kick">Telegram</span>
              <h2 className="tg-title">Experimente o Telegram do RealGuard</h2>
              <div className="tg-switch" role="tablist" aria-label="Escolher celular">
                <button type="button" role="tab" className="tg-mode" data-mode="pais">
                  Celular dos pais
                </button>
                <button type="button" role="tab" className="tg-mode" data-mode="seg">
                  Celular da segurança
                </button>
              </div>
              <p id="tgLead" className="tg-lead" />
              <div className="tg-now" id="tgNow" hidden>
                <span className="tg-now-step" id="tgNowStep" />
                <p className="tg-now-text" id="tgNowText" />
                <div className="tg-now-bar">
                  <span id="tgNowBar" />
                </div>
              </div>
              <p className="tg-hint-txt">Depois da demonstração, toque nos botões do Telegram como se fosse o seu celular.</p>
            </div>

            <div className="tg-stage">
              <div className="p3d" ref={p3dRef}>
                <div className="iphone" aria-label="Simulação do Telegram">
                  <div className="pback">
                    <span className="sym" />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', borderRadius: 'inherit' }}>
                    <PhoneLayers />
                  </div>
                  <div className="iphone-screen">
                    <div className="ios-status">
                      <span>9:41</span>
                      <span className="ios-island" />
                      <StatusIcons />
                    </div>
                    <div className="tg-header">
                      <span className="tg-back">‹</span>
                      <img id="tgAvatar" className="tg-avatar" alt="" src="/assets/avatar-pais.jpg" />
                      <div style={{ minWidth: 0 }}>
                        <div id="tgName" className="tg-name">
                          Realguard Bot
                        </div>
                        <div id="tgSub" className="tg-sub">
                          bot
                        </div>
                      </div>
                      <span className="tg-dots">⋮</span>
                    </div>
                    <div id="tgPinned" className="tg-pinned" hidden />
                    <div id="tgChat" className="tg-chat no-scrollbar" aria-live="polite" tabIndex={0} />
                    <div id="tgToast" className="tg-toast" />
                    <div id="tgCmds" className="tg-cmds" hidden />
                    <div className="tg-input">
                      <button type="button" id="tgMenuBtn" className="tg-menu-btn">
                        ☰ Menu
                      </button>
                      <span className="tg-field">Mensagem</span>
                      <span className="tg-clip">📎</span>
                    </div>
                    <div className="ios-home" />

                    {/* Demonstração */}
                    <div id="tgCaption" className="tg-caption" hidden />
                    <div id="tgFinger" className="tg-finger" hidden />
                    <div id="tgCover" className="tg-cover">
                      <button type="button" id="tgPlay" className="tg-play" aria-label="Assistir à demonstração" />
                      <p className="tg-cover-title" id="tgCoverTitle">
                        Veja funcionando
                      </p>
                      <p className="tg-cover-sub" id="tgCoverSub" />
                      <button type="button" id="tgSkip" className="tg-cover-link">
                        Prefiro explorar sozinho
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p3d-shadow" />
              <div className="tg-under">
                <button type="button" id="tgStop" className="tg-under-btn" hidden>
                  Pular demonstração ⏭
                </button>
                <button type="button" id="tgReplay" className="tg-under-btn">
                  ↻ Assistir de novo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
