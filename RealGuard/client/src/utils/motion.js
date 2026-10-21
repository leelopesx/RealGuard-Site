// Preferências do aparelho, lidas uma vez no carregamento (como no site original).
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;

export const pad2 = (n) => String(n).padStart(2, '0');
