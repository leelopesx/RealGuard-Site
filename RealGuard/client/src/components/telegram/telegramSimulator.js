/*
 * Simulador do Telegram (baseado nos bots reais do RealGuard).
 *
 * O chat é montado direto no DOM, dentro do elemento raiz recebido, porque a
 * demonstração precisa medir a posição de cada botão para mover o "dedo".
 * O componente TelegramSection chama createTelegramSimulator() num useEffect
 * e usa a função devolvida para desmontar tudo.
 *
 * Todo o HTML injetado vem das constantes deste arquivo (nada vem do usuário).
 */
import { reduceMotion } from '../../utils/motion.js';

const ALUNO = 'Ana Souza';
const PRIMEIRO = 'Ana';
const TURMA = '1º A';
const RM = 'RM 000123';
const ESCOLA = 'Escola Exemplo';
const CAM = 'Câmera Principal';

const AVATAR = { pais: '/assets/avatar-pais.jpg', seg: '/assets/avatar-seg.jpg' };
const LEAD = {
  pais: 'O responsável recebe os avisos da câmera e resolve tudo por botões, sem baixar outro app.',
  seg: 'O alerta chega no celular de quem pode decidir. Uma pessoa decide e o cartão some do celular dos outros.'
};

const PLAY_ICON =
  '<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
const HAND_ICON =
  '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 15.5a1.6 1.6 0 0 1 2.6-1.8L9 16"/></svg>';

const pad = (n) => String(n).padStart(2, '0');
const hhmm = (m) => pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60);
const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 60) : ms));

export function createTelegramSimulator(root) {
  const $ = (id) => root.querySelector('#' + id);
  const screen = root.querySelector('.iphone-screen');
  const chat = $('tgChat');
  const sub = $('tgSub');
  const nameEl = $('tgName');
  const pinned = $('tgPinned');
  const toastEl = $('tgToast');
  const cmds = $('tgCmds');
  const leadEl = $('tgLead');
  const avatar = $('tgAvatar');
  const cover = $('tgCover');
  const caption = $('tgCaption');
  const finger = $('tgFinger');
  const stopBtn = $('tgStop');
  const replay = $('tgReplay');
  const nowEl = $('tgNow');
  const playBtn = $('tgPlay');
  const modeBtns = [...root.querySelectorAll('.tg-mode')];

  const listeners = new AbortController();
  const on = (el, type, fn) => el.addEventListener(type, fn, { signal: listeners.signal });

  let mode = 'pais';
  let queue = Promise.resolve();
  let gen = 0;
  let clock = 7 * 60 + 1;
  let S = {};
  let demo = null;
  let blocker = null;
  let toastTimer = null;
  let destroyed = false;

  const today = new Date();
  const dd = (d) => pad(d.getDate()) + '/' + pad(d.getMonth() + 1);
  const full = () => dd(today) + '/' + today.getFullYear();
  const plus = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  function photo(kind) {
    const al = kind === 'alerta';
    const box = al ? '#f59e0b' : '#22c55e';
    // As cores da cena vêm do CSS (.tg-photo .p-*), para acompanhar o tema claro/escuro.
    const head = al
      ? '<rect class="p-hood" x="130" y="52" width="60" height="70" rx="28"/><rect class="p-visor" x="138" y="76" width="44" height="12" rx="6"/><circle class="p-eye" cx="150" cy="82" r="4"/><circle class="p-eye" cx="170" cy="82" r="4"/>'
      : '<circle class="p-head" cx="160" cy="84" r="28"/><path class="p-hair" d="M132 78c2-22 54-24 56 0-6-10-50-10-56 0z"/>';
    return (
      '<div class="tg-photo"><svg viewBox="0 0 320 200" role="img" aria-label="Imagem ilustrativa da câmera">' +
      '<rect class="p-wall" width="320" height="200"/><rect class="p-side" width="90" height="200"/><rect class="p-floor" y="168" width="320" height="32"/><rect class="p-door" x="230" y="20" width="70" height="148"/>' +
      '<path class="' + (al ? 'p-hood' : 'p-body') + '" d="M95 200c4-46 30-70 65-70s61 24 65 70z"/>' + head +
      '<rect x="110" y="40" width="100" height="160" fill="none" stroke="' + box + '" stroke-width="3"/>' +
      '<rect x="110" y="28" width="' + (al ? 92 : 78) + '" height="13" fill="' + box + '"/><text x="114" y="38" font-size="9" font-family="sans-serif" fill="#000">' +
      (al ? 'Rosto obstruído' : 'Ana Souza · 1º A') + '</text>' +
      '<text x="8" y="16" font-size="10" font-family="sans-serif" fill="#fff" stroke="#000" stroke-width="2" paint-order="stroke">' + CAM + ' · ' + dd(today) + '</text>' +
      '<text x="214" y="192" font-size="9" font-family="sans-serif" fill="#fff" stroke="#000" stroke-width="2" paint-order="stroke">ilustração</text></svg></div>'
    );
  }

  /* ---------- peças do chat ---------- */
  function toBottom() {
    requestAnimationFrame(() => {
      chat.scrollTop = chat.scrollHeight;
    });
  }
  function bubble(side, html, opts = {}) {
    const m = document.createElement('div');
    m.className = 'tg-msg ' + side;
    m.innerHTML =
      '<div class="tg-bubble">' + (opts.photo ? photo(opts.photo) : '') + html +
      '<span class="tg-time">' + (opts.time || hhmm(clock)) + (side === 'out' ? ' ✓✓' : '') + '</span></div>';
    if (opts.kb) m.appendChild(keyboard(opts.kb, m));
    chat.appendChild(m);
    toBottom();
    return m;
  }
  function keyboard(rows, owner) {
    const kb = document.createElement('div');
    kb.className = 'tg-kb';
    rows.forEach((r) => {
      const row = document.createElement('div');
      row.className = 'tg-kb-row';
      r.forEach(([label, act]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', () => {
          if (!kb.classList.contains('used')) press(act, owner, kb);
        });
        row.appendChild(b);
      });
      kb.appendChild(row);
    });
    return kb;
  }
  function clearHints() {
    chat.querySelectorAll('.hint').forEach((h) => h.classList.remove('hint'));
  }
  function lockKeyboards() {
    chat.querySelectorAll('.tg-kb').forEach((k) => k.classList.add('used'));
    clearHints();
  }
  function toast(t) {
    toastEl.textContent = t;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1900);
  }

  // Fila: cada resposta do bot espera a anterior, com "digitando…".
  function run(fn) {
    const g = gen;
    queue = queue.then(() => (g === gen && !destroyed ? fn() : null)).catch((e) => console.error(e));
    return queue;
  }
  async function bot(html, opts = {}) {
    sub.textContent = 'digitando…';
    sub.classList.add('typing');
    await sleep(opts.wait || (demo ? 1100 : 650));
    sub.textContent = 'bot';
    sub.classList.remove('typing');
    return bubble('in', html, opts);
  }
  async function me(text) {
    await sleep(250);
    return bubble('out', text);
  }
  async function meTyping(text) {
    await sleep(demo ? 1400 : 700);
    return bubble('out', text);
  }

  /* ===================== BOT DOS RESPONSÁVEIS ===================== */
  const MENU = [
    [['🕒 Presenças recentes', 'p'], ['📊 Frequência', 'f']],
    [['🚗 Retiradas', 'r'], ['👥 Responsáveis', 'g']],
    [['📅 Dias sem aula', 'c'], ['🔔 O que receber', 'n']]
  ];
  const BACK = [['⬅️ Menu', 'm']];
  const CANCEL = [['✖️ Cancelar', 'x']];
  const menuText = () => '🏫 <b>RealGuard · ' + ESCOLA + '</b>\nAluno(s): <b>' + PRIMEIRO + '</b>\n\nO que você quer ver?';
  const who = () => '👤 <b>' + ALUNO + '</b>\n🎓 ' + TURMA + ' · ' + RM;

  function presencas() {
    const rows = [];
    for (let i = 1, n = 0; n < 5; i++) {
      const d = plus(-i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const wd = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][d.getDay()];
      rows.push(
        '<b>' + dd(d) + ' (' + wd + ')</b> ' +
          (n === 2 ? '⏰ Atrasado · entrou 07:24' : n === 4 ? '❌ Falta' : '✅ Presente · entrou 06:5' + n)
      );
      n++;
    }
    return '🕒 <b>Presenças recentes · ' + ALUNO + '</b>\n\n' + rows.join('\n') + '\n\n<i>Só dias letivos. Feriados e recessos não aparecem.</i>';
  }
  const frequencia = () =>
    '📊 <b>Frequência · ' + ALUNO + '</b>\n<i>4º bimestre</i>\n\n🟢 <b>94%</b> de presença (47 de 50 dias letivos)\n❌ Faltas: <b>3</b> · 📝 justificadas: 1\n⏰ Atrasos: 2';
  const dias = () =>
    '📅 <b>Próximos dias sem aula</b>\n<i>próximos 90 dias</i>\n\n• <b>02/11</b> — Finados\n• <b>15/11</b> — Proclamação da República\n• <b>20/11</b> — Consciência Negra\n• <b>25/12</b> — Natal';
  function prefsMsg() {
    const L = [['entrada', 'Entrada na escola'], ['saida', 'Saída da escola'], ['ausencia', 'Ausência (não chegou)']];
    return {
      html:
        '🔔 <b>O que você recebe</b>\nToque para ligar ou desligar.\n\n' +
        L.map(([k, l]) => (S.prefs[k] ? '✅ ' : '⬜ ') + l).join('\n') +
        '\n\n<i>Pedidos de retirada e avisos da escola chegam sempre.</i>',
      kb: L.map(([k, l]) => [[(S.prefs[k] ? '✅ ' : '⬜ ') + l, 'nt:' + k]]).concat([BACK])
    };
  }
  const retiradas = () =>
    '🚗 <b>Retiradas · ' + ALUNO + '</b>\n\n' +
    (S.pickups.length
      ? S.pickups.map((p) => '✅ <b>' + p.day + '</b> · ' + p.name + ' (' + p.rel + ')').join('\n')
      : 'Nenhuma retirada autorizada para os próximos dias.') +
    '\n\nAutorize aqui quando <b>outra pessoa</b> for buscar o aluno num dia específico.';
  const responsaveis = () =>
    '👥 <b>Responsáveis · ' + ALUNO + '</b>\n\n' +
    S.guardians.map((g) => (g.main ? '⭐ ' : '') + '<b>' + g.name + '</b> (' + g.rel + ') ' + (g.tg ? '📱' : '⏳')).join('\n') +
    '\n\n⭐ principal · 📱 recebe no Telegram · ⏳ convite enviado';

  async function pais(act, owner, kb) {
    const [a, arg] = act.split(':');
    if (a === 'nt') {
      // edita a própria mensagem, como no bot real
      S.prefs[arg] = !S.prefs[arg];
      const p = prefsMsg();
      owner.querySelector('.tg-bubble').innerHTML = p.html + '<span class="tg-time">' + hhmm(clock) + '</span>';
      kb.replaceWith(keyboard(p.kb, owner));
      toast('Preferência salva.');
      return;
    }
    lockKeyboards();
    if (a === 'm') return bot(menuText(), { kb: MENU });
    if (a === 'p') return bot(presencas(), { kb: [BACK] });
    if (a === 'f') return bot(frequencia(), { kb: [BACK] });
    if (a === 'c') return bot(dias(), { kb: [BACK] });
    if (a === 'n') {
      const p = prefsMsg();
      return bot(p.html, { kb: p.kb });
    }
    if (a === 'x') {
      S.flow = null;
      await bot('Cancelado.');
      return bot(menuText(), { kb: MENU });
    }
    if (a === 'r') return bot(retiradas(), { kb: [[['➕ Autorizar retirada', 'ra']], BACK] });
    if (a === 'ra') {
      S.flow = {};
      return bot('🚗 Retirada de <b>' + ALUNO + '</b>\n\nPara qual dia?', {
        kb: [[['Hoje (' + dd(today) + ')', 'rd:0'], ['Amanhã (' + dd(plus(1)) + ')', 'rd:1']], CANCEL]
      });
    }
    if (a === 'rd') {
      S.flow.day = dd(plus(+arg));
      await bot('Qual o <b>nome completo</b> de quem vai buscar?', { kb: [CANCEL] });
      lockKeyboards();
      S.flow.name = 'Maria Miranda da Silva';
      await meTyping(S.flow.name);
      return bot('Qual a relação de <b>Maria Miranda da Silva</b> com o aluno?', {
        kb: [
          [['Avó', 'rr:Avó'], ['Avô', 'rr:Avô'], ['Tia', 'rr:Tia']],
          [['Tio', 'rr:Tio'], ['Madrinha', 'rr:Madrinha'], ['Vizinho(a)', 'rr:Vizinho(a)']],
          [['Transporte escolar', 'rr:Transporte escolar']],
          CANCEL
        ]
      });
    }
    if (a === 'rr') {
      S.flow.rel = arg;
      return bot('📷 Envie uma foto do rosto de quem vai buscar (opcional).\nAjuda a portaria a conferir. É apagada 7 dias depois da data.', {
        kb: [[['⏭ Pular', 'rs']], CANCEL]
      });
    }
    if (a === 'rs') {
      return bot(
        '🚗 <b>Confira a autorização de retirada</b>\n\nAluno: ' + ALUNO + '\nQuem busca: ' + S.flow.name + ' (' + S.flow.rel + ')\nDia: ' + S.flow.day + '\nFoto: sem foto',
        { kb: [[['✅ Confirmar', 'rok'], ['✖️ Cancelar', 'x']]] }
      );
    }
    if (a === 'rok') {
      const f = S.flow;
      S.flow = null;
      S.pickups.push({ day: f.day, name: f.name, rel: f.rel });
      return bot(
        '✅ <b>Retirada autorizada</b>\n' + f.name + ' (' + f.rel + ') pode buscar ' + ALUNO + ' em ' + f.day + '.\nA portaria vê a autorização na ficha do aluno.',
        { kb: [[['🚗 Ver retiradas', 'r']], BACK] }
      );
    }
    if (a === 'g') return bot(responsaveis(), { kb: [[['➕ Adicionar responsável', 'ga']], BACK] });
    if (a === 'ga') {
      S.flow = {};
      await bot('👥 Novo responsável de <b>' + ALUNO + '</b>\n\nQual o <b>nome completo</b>?', { kb: [CANCEL] });
      lockKeyboards();
      S.flow.name = 'Felipe de Almeida';
      await meTyping(S.flow.name);
      return bot('Qual o parentesco de <b>Felipe de Almeida</b> com o aluno?', {
        kb: [
          [['Mãe', 'gl:Mãe'], ['Pai', 'gl:Pai'], ['Avó', 'gl:Avó']],
          [['Avô', 'gl:Avô'], ['Tia', 'gl:Tia'], ['Tio', 'gl:Tio']],
          [['Responsável legal', 'gl:Responsável legal']],
          CANCEL
        ]
      });
    }
    if (a === 'gl') {
      S.flow.rel = arg;
      await bot('Qual o celular de Felipe (com DDD)?\n<i>É por ele que a pessoa ativa os avisos no Telegram.</i>', { kb: [CANCEL] });
      lockKeyboards();
      await meTyping('11 97755-0000');
      return bot(
        '👥 <b>Confira o novo responsável</b>\n\nNome: ' + S.flow.name + ' (' + S.flow.rel + ')\nCelular: 11 97755-0000\n\nEle(a) passa a receber os avisos depois de abrir o convite.',
        { kb: [[['✅ Confirmar', 'gok'], ['✖️ Cancelar', 'x']]] }
      );
    }
    if (a === 'gok') {
      const f = S.flow;
      S.flow = null;
      S.guardians.push({ name: f.name, rel: f.rel, tg: false });
      return bot(
        '✅ <b>' + f.name + '</b> agora é responsável de <b>' + ALUNO + '</b>.\n\nEncaminhe este convite para ele ativar os avisos:\n<a>t.me/realguard_bot?start=a8Kq…</a>',
        { kb: [[['👥 Ver responsáveis', 'g']], BACK] }
      );
    }
  }

  // Avisos que a câmera dispara (mesmo texto das mensagens reais).
  const off = (k) => {
    if (!S.prefs[k]) {
      toast('Este aviso está desligado em 🔔 O que receber');
      return true;
    }
    return false;
  };
  const AV = {
    chegada: async () => {
      if (off('entrada')) return;
      clock = 7 * 60 + 2;
      return bot('🟢 <b>Entrada registrada</b>\n' + who() + '\n🕒 07:02 · ' + full() + '\n✅ Chegou dentro do horário\n📍 ' + CAM, { photo: 'aluno', time: '07:02' });
    },
    antecip: async () => {
      clock = 10 * 60 + 40;
      return bot(
        '🟠 <b>Saída antecipada</b>\n' + who() + '\nSaiu da escola às 10:40, antes do fim do turno (12:20).\nSe a saída foi combinada com a escola, desconsidere este aviso.',
        { time: '10:40' }
      );
    }
  };

  /* ===================== BOT DE SEGURANÇA ===================== */
  const CATS = [
    ['Pessoa não identificada', 'nao_identificado'],
    ['Acesso indevido', 'acesso_indevido'],
    ['Comportamento suspeito', 'suspeito'],
    ['Outro', 'outro']
  ];
  const CAMS = ['Câmera Principal', 'Portão de saída'];
  const catName = (k) => (CATS.find((c) => c[1] === k) || ['Ocorrência'])[0];
  const cardKb = (id) => [[['🔍 Ver foto', 'sf:' + id], ['✅ Confirmar', 'sc:' + id], ['✖️ Descartar', 'sd:' + id]]];
  const cardText = (a) =>
    '⚠️ <b>Possível rosto obstruído</b>\n📍 ' + a.cam + ' · 🕒 ' + hhmm(a.at) + '\n<i>Alerta nº ' + a.id + ' · decida pelos botões ou em Ocorrências</i>';
  const pending = () => S.alerts.filter((a) => a.status === 'p');

  function updatePinned() {
    const p = pending().length;
    pinned.innerHTML =
      '<span class="bar"></span><div><b>Mensagem fixada</b>📌 Alertas de hoje · ' +
      (p ? '⏳ ' + p + ' aguardando decisão' : '✅ Nenhum alerta aguardando') + '</div>';
  }
  function finishCard(a, html) {
    if (!a.card) return;
    a.card.querySelector('.tg-bubble').innerHTML = html + '<span class="tg-time">' + hhmm(a.at) + '</span>';
    const k = a.card.querySelector('.tg-kb');
    if (k) k.remove();
  }
  const hoje = () => {
    const n = (s) => S.alerts.filter((a) => a.status === s).length;
    const tipos = {};
    S.alerts.filter((a) => a.status === 'c').forEach((a) => (tipos[catName(a.cat)] = (tipos[catName(a.cat)] || 0) + 1));
    return (
      '📊 <b>RealGuard · Resumo de hoje (' + dd(today) + ')</b>\n\n🚶 Movimento: 111 entradas · 76 saídas\n\n⚠️ Alertas de rosto obstruído: <b>' + S.alerts.length +
      '</b>\n  🔴 confirmados: ' + n('c') + '\n  ✔️ descartados pela portaria: ' + n('d') + '\n  🤖 descartados sozinhos: ' + n('a') + '\n  ⏳ aguardando: ' + n('p') +
      (n('c') + n('d') ? '\n⏱️ Tempo médio de decisão: 1 min' : '') +
      (Object.keys(tipos).length ? '\nTipos: ' + Object.entries(tipos).map(([k, v]) => k + ' (' + v + ')').join(' · ') : '')
    );
  };
  const historico = () => {
    const c = S.alerts.filter((a) => a.status === 'c');
    return c.length
      ? '🗂️ <b>Últimas ocorrências confirmadas</b>\n\n' +
          c
            .slice()
            .reverse()
            .map((a) => '🔴 ' + dd(today) + ' ' + hhmm(a.at) + ' · <b>' + catName(a.cat) + '</b> · ' + a.cam + '\n    por Portaria pelo Telegram')
            .join('\n')
      : '🗂️ <b>Histórico</b>\n\nNenhuma ocorrência confirmada ainda.';
  };

  async function seg(act, owner, kb) {
    const [a, idS, extra] = act.split(':');
    const al = S.alerts.find((x) => x.id === +idS);
    if (!al || al.status !== 'p') return toast('Este alerta já foi decidido.');
    if (a === 'sf') {
      return bot('Alerta nº ' + al.id + ' · ' + al.cam + ' · ' + dd(today) + ' ' + hhmm(al.at) + '\n<i>Foto só para você. Não encaminhe.</i>', {
        photo: 'alerta',
        wait: 400
      });
    }
    if (a === 'sc') {
      kb.replaceWith(keyboard(CATS.map(([l, k]) => [[l, 'st:' + al.id + ':' + k]]).concat([[['⬅️ Voltar', 'sb:' + al.id]]]), owner));
      toBottom();
      return;
    }
    if (a === 'sb') {
      kb.replaceWith(keyboard(cardKb(al.id), owner));
      return;
    }
    if (a === 'st') {
      al.status = 'c';
      al.cat = extra;
      clock = Math.max(clock, al.at + 1);
      toast('🔴 Confirmado: ' + catName(extra));
      finishCard(al, '✅ <i>Alerta nº ' + al.id + ' decidido por Portaria</i>');
      updatePinned();
      return bot(
        '🔴 <b>Ocorrência confirmada · ' + catName(extra) + '</b>\n📍 ' + al.cam + '\n🕒 detectada ' + hhmm(al.at) + ' · confirmada ' + hhmm(al.at + 1) +
          ' por Portaria (1 min) pelo Telegram\n📅 ' + full(),
        { photo: 'alerta' }
      );
    }
    if (a === 'sd') {
      al.status = 'd';
      toast('✔️ Alerta descartado');
      finishCard(al, '✔️ <i>Alerta nº ' + al.id + ' descartado</i>');
      updatePinned();
      return bot('✔️ Alerta das ' + hhmm(al.at) + ' descartado por Portaria (falso alarme).');
    }
  }

  const SG = {
    alerta: async () => {
      clock += 3;
      const a = { id: S.nextId++, at: clock, cam: CAMS[S.alerts.length % 2], status: 'p' };
      S.alerts.push(a);
      updatePinned();
      a.card = await bot(cardText(a), { kb: cardKb(a.id), time: hhmm(a.at) });
      return a;
    },
    cmd: async (c) => {
      await me(c);
      return bot(
        c === '/hoje' ? hoje() : c === '/historico' ? historico() : pending().length ? 'Veja os cartões acima ⬆️' : '✅ Nenhum alerta aguardando decisão.'
      );
    }
  };

  function press(act, owner, kb) {
    cmds.hidden = true;
    return run(() => (mode === 'pais' ? pais(act, owner, kb) : seg(act, owner, kb)));
  }

  /* ===================== demonstração ===================== */
  const lastBtn = (txt) => {
    const bs = [...chat.querySelectorAll('.tg-kb:not(.used) button')].filter((b) => b.textContent.includes(txt));
    return bs[bs.length - 1];
  };
  async function tap(el) {
    if (!el || !demo) return;
    const c = chat.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.bottom > c.bottom || r.top < c.top) {
      chat.scrollTop += r.bottom - c.bottom + 12;
      await sleep(350);
    }
    const s = screen.getBoundingClientRect();
    const r2 = el.getBoundingClientRect();
    finger.hidden = false;
    finger.style.left = r2.left - s.left + r2.width / 2 + 'px';
    finger.style.top = r2.top - s.top + r2.height / 2 + 'px';
    await sleep(1150);
    if (!demo) return;
    finger.classList.remove('tap');
    void finger.offsetWidth;
    finger.classList.add('tap');
    el.classList.add('pressed');
    await sleep(220);
    el.classList.remove('pressed');
    el.click();
    await queue;
    await sleep(700);
  }
  const say = (t, i, n) => {
    caption.textContent = t;
    caption.hidden = false;
    nowEl.hidden = false;
    $('tgNowStep').textContent = 'Passo ' + (i + 1) + ' de ' + n;
    $('tgNowText').textContent = t;
    $('tgNowBar').style.width = ((i + 1) / n) * 100 + '%';
  };
  const SCRIPTS = {
    pais: [
      ['A câmera reconheceu a Ana na entrada. O aviso chega com foto.', async () => { await run(AV.chegada); await sleep(3900); }],
      ['Pelo menu, a família vê a frequência do período.', async () => { await tap(lastBtn('Frequência')); await sleep(3600); await tap(lastBtn('Menu')); }],
      ['E autoriza quem vai buscar a Ana hoje.', async () => {
        await tap(lastBtn('Retiradas'));
        await tap(lastBtn('Autorizar'));
        await tap(lastBtn('Hoje'));
        await tap(lastBtn('Madrinha'));
        await tap(lastBtn('Pular'));
        await tap(lastBtn('Confirmar'));
        await sleep(3600);
      }],
      ['Se ela sair antes do fim do turno, a família sabe na hora.', async () => { await run(AV.antecip); await sleep(4200); }]
    ],
    seg: [
      ['A câmera viu alguém escondendo o rosto na entrada.', async () => { await run(SG.alerta); await sleep(3600); }],
      ['Só quem toca em Ver foto recebe a imagem.', async () => { await tap(lastBtn('Ver foto')); await sleep(3900); }],
      ['A portaria confirma e escolhe o tipo de ocorrência.', async () => {
        await tap(lastBtn('Confirmar'));
        await sleep(750);
        await tap(lastBtn('Acesso indevido'));
        await sleep(3900);
      }],
      ['No fim do dia, /hoje mostra o resumo.', async () => { await run(() => SG.cmd('/hoje')); await sleep(4200); }]
    ]
  };

  async function playDemo() {
    start(false);
    hideCover();
    const my = (demo = {});
    blocker = document.createElement('div');
    blocker.className = 'tg-block';
    screen.appendChild(blocker);
    stopBtn.hidden = false;
    replay.hidden = true;
    await queue;
    await sleep(700);
    const sc = SCRIPTS[mode];
    for (let k = 0; k < sc.length; k++) {
      if (demo !== my) return;
      say(sc[k][0], k, sc.length);
      await sc[k][1]();
    }
    if (demo === my) endDemo(true);
  }
  function endDemo(finished) {
    demo = null;
    caption.hidden = true;
    nowEl.hidden = true;
    finger.hidden = true;
    stopBtn.hidden = true;
    replay.hidden = false;
    if (blocker) {
      blocker.remove();
      blocker = null;
    }
    if (finished) showCover('end');
  }

  function showCover(kind) {
    const end = kind === 'end';
    cover.hidden = false;
    playBtn.classList.toggle('explore', end);
    playBtn.innerHTML = end ? HAND_ICON : PLAY_ICON;
    playBtn.setAttribute('aria-label', end ? 'Explorar sozinho' : 'Assistir à demonstração');
    $('tgCoverTitle').textContent = end ? 'Agora é a sua vez' : 'Veja funcionando';
    $('tgCoverSub').innerHTML = end
      ? 'Toque nos botões do Telegram,<br>como num celular de verdade.'
      : 'Demonstração de 1 minuto.<br>Depois, é a sua vez de tocar.';
    $('tgSkip').textContent = end ? 'Assistir de novo' : 'Prefiro explorar sozinho';
    cover.dataset.kind = kind;
  }
  function hideCover() {
    cover.hidden = true;
  }

  /* ===================== início / troca de celular ===================== */
  function start(withCover) {
    if (demo) endDemo(false);
    gen++;
    queue = Promise.resolve();
    cmds.hidden = true;
    clock = 7 * 60 + 1;
    S = {
      prefs: { entrada: true, saida: true, ausencia: true },
      pickups: [],
      guardians: [
        { name: 'Carlos Souza', rel: 'Pai', main: true, tg: true },
        { name: 'Aparecida Souza', rel: 'Avó', tg: true }
      ],
      alerts: [],
      nextId: 160,
      flow: null
    };
    chat.innerHTML = '<div class="tg-day">Hoje</div>';
    if (mode === 'pais') {
      nameEl.textContent = 'Realguard Bot';
      pinned.hidden = true;
      bubble('out', '/start', { time: '07:00' });
      bubble('in', '✅ <b>Pronto!</b> Você vai receber os avisos de entrada e saída de:\n• ' + ALUNO + ' (' + TURMA + ')', { time: '07:00' });
      bubble('in', menuText(), { kb: MENU, time: '07:00' });
    } else {
      nameEl.textContent = 'Security RealGuard Bot';
      pinned.hidden = false;
      updatePinned();
      bubble('out', '/start', { time: '07:00' });
      bubble(
        'in',
        '✅ <b>Conta ligada:</b> Portaria\n\nOs alertas de segurança vão chegar aqui. Use os botões para ver a foto, confirmar ou descartar.\nComandos: /pendentes · /hoje · /historico',
        { time: '07:00' }
      );
    }
    leadEl.textContent = LEAD[mode];
    avatar.src = AVATAR[mode];
    replay.hidden = true;
    modeBtns.forEach((t) => t.setAttribute('aria-selected', t.dataset.mode === mode));
    if (withCover) showCover('start');
  }

  on(playBtn, 'click', () => (cover.dataset.kind === 'end' ? hideCover() : playDemo()));
  on($('tgSkip'), 'click', () => (cover.dataset.kind === 'end' ? playDemo() : hideCover()));
  on(stopBtn, 'click', () => endDemo(false));
  on(replay, 'click', playDemo);

  on($('tgMenuBtn'), 'click', () => {
    if (demo) return;
    if (mode === 'pais') {
      cmds.hidden = true;
      run(async () => {
        lockKeyboards();
        await me('/menu');
        return bot(menuText(), { kb: MENU });
      });
      return;
    }
    cmds.innerHTML = [
      ['/pendentes', 'Alertas aguardando decisão'],
      ['/hoje', 'Resumo de hoje'],
      ['/historico', 'Últimas ocorrências confirmadas']
    ]
      .map(([c, d]) => '<button type="button" data-cmd="' + c + '"><b>' + c + '</b><span>' + d + '</span></button>')
      .join('');
    cmds.hidden = !cmds.hidden;
    cmds.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        cmds.hidden = true;
        run(() => SG.cmd(b.dataset.cmd));
      })
    );
  });

  modeBtns.forEach((t) =>
    on(t, 'click', () => {
      if (mode === t.dataset.mode) return;
      mode = t.dataset.mode;
      start(true);
    })
  );

  start(true);

  return function destroy() {
    destroyed = true;
    demo = null;
    gen++;
    clearTimeout(toastTimer);
    listeners.abort();
  };
}
