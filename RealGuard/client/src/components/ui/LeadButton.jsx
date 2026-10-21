import { useLead } from '../../context/LeadContext.jsx';
import Icon from './Icon.jsx';

// Botão "Quero conhecer": abre o cadastro e some depois que a pessoa já se cadastrou.
export default function LeadButton({ className = '', arrow = false, children = 'Quero conhecer' }) {
  const { done, openLead } = useLead();
  return (
    <button type="button" className={`btn btn-gold ${className} ${done ? 'hidden' : ''}`.trim()} onClick={openLead}>
      {children}
      {arrow && <Icon name="arrow-right" className="arrow" />}
    </button>
  );
}
