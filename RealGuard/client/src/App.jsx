import { useCallback, useEffect, useState } from 'react';
import { LeadProvider } from './context/LeadContext.jsx';
import { useRevealOnScroll } from './hooks/useRevealOnScroll.js';
import { reduceMotion } from './utils/motion.js';

import Boot from './components/layout/Boot.jsx';
import Navbar from './components/layout/Navbar.jsx';
import FinalCta from './components/layout/FinalCta.jsx';
import Footer from './components/layout/Footer.jsx';
import LeadModal from './components/ui/LeadModal.jsx';

import Hero from './components/sections/Hero.jsx';
import DaySection from './components/sections/DaySection.jsx';
import HowItWorks from './components/sections/HowItWorks.jsx';
import Security from './components/sections/Security.jsx';
import TelegramSection from './components/sections/TelegramSection.jsx';
import Differentials from './components/sections/Differentials.jsx';
import Videos from './components/sections/Videos.jsx';
import Team from './components/sections/Team.jsx';

export default function App() {
  // "ready" vira true quando a abertura (Boot) termina; as animações do topo começam aí.
  const [ready, setReady] = useState(reduceMotion);
  const handleBootDone = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (ready) document.documentElement.classList.add('go');
  }, [ready]);

  useRevealOnScroll('.ev, .stg, .sf>div, .occ li, .proof li');

  return (
    <LeadProvider>
      <Boot onDone={handleBootDone} />
      <LeadModal />
      <Navbar />
      <Hero ready={ready} />
      <DaySection />
      <HowItWorks />
      <Security />
      <TelegramSection />
      <Differentials />
      <Videos />
      <Team />
      <FinalCta />
      <Footer />
    </LeadProvider>
  );
}
