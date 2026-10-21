import Icon from '../ui/Icon.jsx';

const FEATURES = [
  ['eye-off', 'Rosto escondido', 'Alguém fica na entrada sem mostrar o rosto e o alerta sai na hora.'],
  ['image', 'Foto do momento', 'O alerta chega com a imagem da câmera para a equipe decidir rápido.'],
  ['crop', 'Áreas e regras', 'A escola define áreas da imagem que devem ser vigiadas com mais atenção.'],
  ['list', 'Histórico de ocorrências', 'Cada alerta fica salvo. O mesmo evento não gera uma enxurrada de mensagens.']
];

const OCCURRENCES = [
  { color: 'var(--warn)', title: 'Rosto obstruído', where: 'CAM 01 · Entrada', time: '07:35', pill: 'wait', status: 'AGUARDANDO ANÁLISE' },
  { color: 'var(--bad)', title: 'Pessoa não reconhecida', where: 'CAM 01 · Entrada', time: '09:12', pill: 'ok', status: 'RESOLVIDA · VISITANTE' },
  { color: 'var(--warn)', title: 'Rosto obstruído', where: 'CAM 02 · Pátio', time: '10:48', pill: 'ok', status: 'RESOLVIDA · ALUNO DE CAPUZ' }
];

export default function Security() {
  return (
    <section id="seguranca" className="sec">
      <div className="wrap sec-one">
        <span className="kick">Segurança</span>
        <div>
          <h2 className="h2">A portaria avisada na hora certa</h2>
          <p className="lead">
            Câmeras comuns só gravam, e alguém precisa estar olhando quando algo acontece. O RealGuard observa a entrada e
            chama a equipe quando uma situação merece atenção.
          </p>
          <div className="secu">
            <div className="sf">
              {FEATURES.map(([icon, title, text]) => (
                <div key={title}>
                  <Icon name={icon} />
                  <span>
                    <b>{title}</b>
                    <p>{text}</p>
                  </span>
                </div>
              ))}
            </div>

            <div className="occ" aria-label="Exemplo da tela de ocorrências">
              <div className="occ-h">
                Ocorrências de hoje <span>EXEMPLO</span>
              </div>
              <ul>
                {OCCURRENCES.map((o) => (
                  <li key={o.time} style={{ '--c': o.color }}>
                    <div className="thumb" />
                    <div style={{ minWidth: 0 }}>
                      <h4>{o.title}</h4>
                      <p className="where">
                        {o.where} · <span className="mono">{o.time}</span>
                      </p>
                      <span className={`st-pill ${o.pill}`}>{o.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
