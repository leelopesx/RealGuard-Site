import { useEffect } from 'react';
import { reduceMotion } from '../utils/motion.js';

// Revela ao rolar só o que começa fora da tela (o que já está visível não pisca).
export function useRevealOnScroll(selector) {
  useEffect(() => {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const vh = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('rv-in');
          e.target.classList.remove('rv-pre');
          io.unobserve(e.target);
        }),
      { rootMargin: '0px 0px -6% 0px' }
    );
    document.querySelectorAll(selector).forEach((el) => {
      if (el.getBoundingClientRect().top <= vh) return;
      const sibling = [...el.parentElement.children].indexOf(el) % 4;
      el.style.setProperty('--d', `${sibling * 0.06}s`);
      el.classList.add('rv-pre');
      io.observe(el);
    });
    return () => io.disconnect();
  }, [selector]);
}
