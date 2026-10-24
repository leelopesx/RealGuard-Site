import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { local, session } from '../utils/storage.js';

// Abre o cadastro sozinho assim que a abertura (Boot) termina.
// Não reaparece para quem já enviou, nem na mesma sessão depois de fechar.
const OPEN_LEAD_ON_LOAD = true;
const OPEN_LEAD_DELAY_MS = 300;

const LeadContext = createContext(null);

export function LeadProvider({ children, autoOpen = true }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(() => local.get('rg_lead_done') === '1');

  const openLead = useCallback(() => setOpen(true), []);
  const closeLead = useCallback(() => {
    setOpen(false);
    session.set('rg_lead_skip', '1');
  }, []);
  const markDone = useCallback(() => {
    local.set('rg_lead_done', '1');
    setDone(true);
  }, []);

  useEffect(() => {
    const skipped = session.get('rg_lead_skip') === '1';
    if (!OPEN_LEAD_ON_LOAD || !autoOpen || done || skipped) return;
    const t = setTimeout(() => setOpen(true), OPEN_LEAD_DELAY_MS);
    return () => clearTimeout(t);
    // só quando a abertura termina
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  const value = useMemo(
    () => ({ open, done, openLead, closeLead, markDone }),
    [open, done, openLead, closeLead, markDone]
  );
  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
}

export function useLead() {
  return useContext(LeadContext);
}
