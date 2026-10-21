# RealGuard · site

Site do RealGuard (Grupo 05 · Challenge Daten × FIAP 2026), com **frontend em React (Vite)** e **backend em Node.js (Express)**.

## Como rodar

Precisa do Node.js 18 ou mais novo.

```bash
npm run install:all   # instala a raiz, o server e o client
npm run dev           # sobe o backend (3001) e o frontend (5173) juntos
```

Abra http://localhost:5173.

### Produção

```bash
npm run build   # gera client/dist
npm start       # o Node serve o site e a API em http://localhost:3001
```

## Estrutura

```
realguard/
├── client/                      # Frontend React (Vite)
│   ├── index.html
│   ├── public/
│   │   ├── assets/              # logo e avatares do Telegram
│   │   ├── img/                 # fotos da equipe (arthur.jpg, leticia.jpg…)
│   │   └── videos/              # vídeos do site (apresentacao.mp4…)
│   └── src/
│       ├── App.jsx              # monta a página na ordem das seções
│       ├── components/
│       │   ├── layout/          # Boot (abertura), Navbar, FinalCta, Footer
│       │   ├── sections/        # uma seção da página por arquivo
│       │   ├── telegram/        # motor do simulador do Telegram
│       │   └── ui/              # Icon, LeadModal, LeadButton, PhoneLayers
│       ├── context/             # LeadContext (estado do cadastro)
│       ├── hooks/               # useTheme, useApiData, useRevealOnScroll
│       ├── services/api.js      # chamadas ao backend
│       ├── styles/              # CSS dividido por parte (a ordem importa)
│       └── utils/
└── server/                      # Backend Node.js (Express)
    ├── .env.example
    └── src/
        ├── index.js             # sobe o servidor
        ├── app.js               # middlewares, rotas e site em produção
        ├── routes/              # /api/health, /api/team, /api/videos, /api/leads
        ├── controllers/
        ├── services/            # leitura dos JSON e gravação dos cadastros
        ├── middlewares/         # erros e limite de requisições
        ├── utils/               # validação do cadastro
        └── data/                # team.json, videos.json (e leads.json gerado)
```

## API

| Método | Rota           | O que faz                                        |
| ------ | -------------- | ------------------------------------------------ |
| GET    | `/api/health`  | Verifica se o servidor está no ar                |
| GET    | `/api/team`    | Integrantes da equipe (`server/src/data/team.json`) |
| GET    | `/api/videos`  | Vídeos do player (`server/src/data/videos.json`)  |
| POST   | `/api/leads`   | Salva um cadastro "Quero conhecer"               |

Os cadastros ficam em `server/src/data/leads.json`. Para enviar também para uma planilha do Google, preencha
`SHEETS_URL` no arquivo `server/.env` (copie de `.env.example`).

## Onde editar

- **Equipe** (função, frase, LinkedIn, GitHub): `server/src/data/team.json`. Fotos em `client/public/img/`.
- **Vídeos**: `server/src/data/videos.json` (arquivo em `client/public/videos/` ou ID do YouTube).
- **Textos das seções**: `client/src/components/sections/`.
- **Cores e tema claro/escuro**: `client/src/styles/parts/01-variables.css` e `14-theme-light.css`.
