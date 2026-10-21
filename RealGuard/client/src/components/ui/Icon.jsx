import feather from 'feather-icons';

// Ícone do Feather renderizado direto como <svg> (sem feather.replace()).
export default function Icon({ name, className = '' }) {
  const icon = feather.icons[name];
  if (!icon) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`feather feather-${name} ic ${className}`.trim()}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon.contents }}
    />
  );
}
