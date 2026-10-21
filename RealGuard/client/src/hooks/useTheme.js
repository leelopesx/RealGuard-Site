import { useEffect, useState } from 'react';
import { local } from '../utils/storage.js';

const lightQuery = () => window.matchMedia('(prefers-color-scheme: light)');

// Tema claro/escuro: segue o sistema até a pessoa escolher; a escolha fica salva.
export function useTheme() {
  const [chosen, setChosen] = useState(() => document.documentElement.dataset.theme || null);
  const [systemLight, setSystemLight] = useState(() => lightQuery().matches);

  useEffect(() => {
    const mq = lightQuery();
    const onChange = () => setSystemLight(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const theme = chosen || (systemLight ? 'light' : 'dark');

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    local.set('rg_theme', next);
    setChosen(next);
  };

  return { theme, toggle };
}
