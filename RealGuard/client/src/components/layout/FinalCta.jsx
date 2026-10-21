import LeadButton from '../ui/LeadButton.jsx';
import { CHALLENGE_URL } from './Navbar.jsx';

export default function FinalCta() {
  return (
    <div className="wrap">
      <div className="final">
        <div>
          <h2>
            Quer ver o RealGuard <span className="gold-t">na sua escola?</span>
          </h2>
          <p>Deixe seu contato. A equipe mostra a AIBox, o painel e o Telegram funcionando com uma câmera de verdade.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <LeadButton arrow />
          <a href={CHALLENGE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-line">
            Challenge FIAP ↗
          </a>
        </div>
      </div>
    </div>
  );
}
