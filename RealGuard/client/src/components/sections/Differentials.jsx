const PROOF = [
  { n: '0', title: 'imagens enviadas para a nuvem', text: 'Tudo roda na AIBox, dentro da escola. Se a internet cair, a presença continua sendo registrada.' },
  { n: '30', unit: 'dias', title: 'para apagar as fotos dos alertas', text: 'Dados faciais só existem com o termo do responsável. Se ele revogar, são apagados.' },
  { n: 'RTSP', title: 'câmeras que a escola já tem', text: 'Funciona com câmeras IP comuns. Não precisa trocar equipamento.' },
  { n: '0', unit: 'apps', title: 'para a família instalar', text: 'Os avisos chegam no Telegram. O responsável entra por um link de convite.' },
  { n: '199', title: 'testes automatizados', text: 'O sistema se recupera sozinho de falhas e faz backup todos os dias.' }
];


export default function Differentials() {
  return (
    <section id="diferenciais" className="sec alt">
      <div className="wrap sec-one">
        <span className="kick">Diferenciais</span>
        <div className="dif-head">
          <h2 className="h2">Por que o RealGuard</h2>
          <p className="lead">Cinco números que resumem como o RealGuard trabalha dentro da escola.</p>
        </div>

        <ol className="proof">
          {PROOF.map((p) => (
            <li key={p.title}>
              <span className="pf-n">
                {p.n}
                {p.unit && <small>{p.unit}</small>}
              </span>
              <b>{p.title}</b>
              <p>{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
