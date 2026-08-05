# Nimbus — SaaS Admin Dashboard (boilerplate)

Boilerplate full-stack para dashboards administrativos: React + Vite + TypeScript no
frontend, Node/Express + TypeScript + Prisma no backend, autenticação JWT com refresh
token rotativo, CRUD completo de "clientes" e um visual autoral (não é o template
shadcn cinza-e-azul padrão).

## Stack

| Camada     | Tecnologias |
|------------|-------------|
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form + Zod, Axios |
| Backend    | Node.js, Express, TypeScript, Zod |
| Banco      | SQLite (dev, zero-config) via Prisma ORM — troque para PostgreSQL em produção |
| Auth       | JWT access token (15 min) + refresh token rotativo em cookie httpOnly (7 dias) |

## Estrutura

```
saas-admin/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # modelos User, RefreshToken, Client
│   │   └── seed.ts            # popula o banco com dados fake
│   └── src/
│       ├── config/            # env, prisma client singleton
│       ├── middleware/        # auth, error handler
│       ├── modules/
│       │   ├── auth/          # schema, service, controller, routes
│       │   └── clients/       # schema, service, controller, routes (CRUD)
│       ├── utils/             # tokens JWT, ApiError, asyncHandler
│       ├── app.ts
│       └── server.ts
└── frontend/
    └── src/
        ├── app/                # App.tsx, rotas protegidas/públicas
        ├── components/
        │   ├── ui/             # Button, Input, Select, Card, Modal, StatusBadge...
        │   └── layout/         # Sidebar, Topbar, DashboardLayout
        ├── features/
        │   ├── auth/           # Login, Registro, AuthContext
        │   ├── clients/        # tabela, modal de form, API
        │   └── dashboard/      # visão geral, métricas, tema
        ├── hooks/              # useClients, useClientMetrics
        └── lib/                # axios instance com refresh automático, format, cn
```

Organização por *feature*, não por tipo de arquivo solto — cada domínio (auth,
clients, dashboard) carrega seu próprio schema de validação, chamadas de API e
componentes.

## Pré-requisitos

- Node.js 18+
- npm 9+

## Setup local

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install

# Gera o client do Prisma a partir do schema
npm run prisma:generate

# Cria o banco SQLite local e aplica as migrations
npm run prisma:migrate

# Popula com 1 usuário demo + 32 clientes fake
npm run seed

# Sobe a API em http://localhost:4000
npm run dev
```

> **Importante:** rode sempre `npm install` antes de qualquer comando de Prisma, e
> use os scripts do `package.json` (`npm run prisma:generate`,
> `npm run prisma:migrate`) em vez de `npx prisma ...` direto no terminal. Se você
> digitar `npx prisma generate` **antes** de rodar `npm install` (ou num diretório
> sem `node_modules`), o `npx` não encontra um binário local, ignora a versão
> fixada no `package.json` e baixa a versão mais recente do Prisma direto do
> registro — que pode ser uma major diferente (ex: Prisma 7, que quebra o formato
> `datasource.url` deste schema com o erro `P1012`). Se isso acontecer, o sintoma
> é o próprio `npx` perguntando `Need to install the following packages: prisma@X`
> — sinal de que faltou o `npm install`. A correção é: rode `npm install` e use os
> scripts do `npm run`, não o `npx` cru.

Login de demonstração criado pelo seed:
- **E-mail:** `demo@saasadmin.dev`
- **Senha:** `Demo@1234`

Para usar PostgreSQL em vez de SQLite: troque `provider = "sqlite"` por
`provider = "postgresql"` em `prisma/schema.prisma`, aponte `DATABASE_URL` no `.env`
para sua conexão Postgres e rode `npm run prisma:migrate` novamente (depois de já
ter rodado `npm install` nessa pasta).

### 2. Frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acesse **http://localhost:5173**.

## Scripts úteis (backend)

| Comando | Descrição |
|---|---|
| `npm run dev` | Sobe a API com reload automático (tsx watch) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Roda a versão compilada |
| `npm run prisma:studio` | Abre o Prisma Studio (GUI do banco) |
| `npm run seed` | Reseta e repopula o banco com dados fake |

## Scripts úteis (frontend)

| Comando | Descrição |
|---|---|
| `npm run dev` | Sobe o Vite dev server |
| `npm run build` | Typecheck + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |

## Segurança

- **Escopo por usuário**: todo registro de `Client` guarda `createdById`, o id do
  usuário dono do registro. As cinco operações do service
  (`listClients`, `getClientMetrics`, `getClientById`, `updateClient`,
  `deleteClient`) recebem o `userId` do usuário autenticado (extraído do access
  token pelo middleware `requireAuth`, nunca do body/query da requisição) e
  filtram **toda** query Prisma por `createdById: userId`.
- **Sem vazamento de existência**: se um id de cliente existe mas pertence a outro
  usuário, a API responde `404 Not Found` — o mesmo status de "não existe". Nunca
  `403 Forbidden`, que confirmaria a existência do registro em outra conta.
- Todas as rotas de `/api/clients` passam por `requireAuth` antes de qualquer
  handler (`clientsRouter.use(requireAuth)`), sem exceção.
- Isso significa que **dois usuários registrados nunca compartilham dados** de
  clientes entre si, mesmo sabendo o `id` exato de um registro alheio.

**Fora do escopo desta correção, para quem for evoluir o boilerplate:**
- O refresh token é validado por `jti` (id único assinado no JWT) sem checagem
  redundante contra `userId` — não é explorável hoje, mas é uma camada de defesa
  extra fácil de adicionar.
- `Client.createdById` é opcional no schema. Hoje isso nunca gera `null` na
  prática (toda criação exige um usuário autenticado), mas se a exclusão de
  usuários for implementada no futuro, decida conscientemente o que fazer com os
  clientes órfãos antes de usar `onDelete: SetNull`.

## Autenticação

- **Access token**: JWT de vida curta (15 min), guardado em memória no frontend
  (nunca em `localStorage`), enviado via header `Authorization: Bearer`.
- **Refresh token**: cookie `httpOnly` + `sameSite=lax`, vida de 7 dias, com rotação
  a cada uso (o token antigo é revogado no banco). Isso limita o dano em caso de
  vazamento do token, já que cada refresh token só pode ser usado uma vez.
- Um interceptor do Axios detecta respostas `401`, chama `/api/auth/refresh`
  automaticamente e repete a requisição original — sem exigir novo login enquanto a
  sessão for válida.
- Rotas do backend sob `/api/clients` passam por um middleware `requireAuth` que
  valida o access token.

## Funcionalidades implementadas

- [x] Login / registro com validação de e-mail e senha forte (8+ caracteres,
      maiúscula, minúscula, número e símbolo)
- [x] Dashboard com sidebar colapsável (desktop) e drawer (mobile)
- [x] CRUD de clientes: nome, status (lead/ativo/pausado/perdido), valor, data de
      criação
- [x] Tabela com paginação, busca por nome e ordenação por coluna (clique no
      cabeçalho)
- [x] Modal de criar/editar com validação via Zod + React Hook Form
- [x] Cards de métricas: total de registros, ativos, crescimento no mês (comparado
      ao mês anterior)
- [x] Tema claro/escuro com persistência em `localStorage`
- [x] Layout responsivo (sidebar vira drawer em telas pequenas)
- [x] Seed com 32 registros fake plausíveis via `@faker-js/faker`

## Design

Paleta autoral definida para fugir do "cinza + azul" genérico de templates:

- **Primária**: azul-petróleo profundo (`#0F4C5C`) — confiança, dado sério
- **Acento**: verde-limão elétrico (`#C4F135`) — usado com moderação em destaques,
  métricas positivas e no logotipo
- **Neutros**: quase-preto quente (`#14181B`) e off-white quente (`#F7F5F0`), em vez
  de cinza puro

Tipografia: **Fraunces** (serifada, com personalidade) para headings e logotipo,
**Inter** para texto de interface, **JetBrains Mono** para números e dados
tabulares — separação clara entre "conteúdo editorial" e "dado".

Microinterações: transições de 150–200ms em hovers, foco visível em todos os
elementos interativos, ações da tabela (editar/excluir) aparecem no hover da linha.
