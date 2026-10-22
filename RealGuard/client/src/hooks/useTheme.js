import { useEffect, useState } from 'react';
import { local } from '../utils/storage.js';

const lightQuery = () => window.matchMedia('(prefers-color-scheme: light)');
const saved = () => {
  const t = local.get('rg_theme');
  return t === 'light' || t === 'dark' ? t : null;
};

// Tema claro/escuro: segue o sistema até a pessoa escolher; a escolha fica salva.
// O tema vai sempre para html[data-theme], que é o único gatilho do CSS.
export function useTheme() {
  const [chosen, setChosen] = useState(saved);
  const [systemLight, setSystemLight] = useState(() => lightQuery().matches);

  useEffect(() => {
    const mq = lightQuery();
    const onChange = () => setSystemLight(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const theme = chosen || (systemLight ? 'light' : 'dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    local.set('rg_theme', next);
    setChosen(next);
  };

  return { theme, toggle };
}
