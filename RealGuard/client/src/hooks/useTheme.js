import { useEffect, useState } from 'react';

// Tema claro/escuro: o site sempre abre no escuro.
// O botão troca o tema só durante a visita; ao abrir de novo, volta ao escuro.
// O tema vai sempre para html[data-theme], que é o único gatilho do CSS.
export function useTheme() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return { theme, toggle };
}
