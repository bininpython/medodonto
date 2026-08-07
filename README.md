# MED ODONTO — Gestão Financeira

Sistema de gestão financeira completo para a **Med Odonto**. Controle de entradas, despesas, contas a pagar/receber, fluxo de caixa e relatórios.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)

## ✨ Funcionalidades

- 📊 **Dashboard** — Visão geral: saldo, entradas, despesas, resultado do mês
- 💰 **Entradas** — Registro e gestão de receitas
- 💸 **Despesas** — Registro e gestão de gastos
- 📋 **Contas** — Contas a pagar e a receber com detecção automática de vencidos
- 🏦 **Caixa** — Saldo consolidado e movimentação mensal
- 📈 **Relatórios** — Análise por período, categoria e forma de pagamento
- 📜 **Histórico** — Todas as movimentações financeiras
- ⚙️ **Configurações** — Dados da empresa e categorias personalizadas
- 🔒 **Autenticação** — Login seguro com Supabase Auth + RLS
- 📱 **Responsivo** — Desktop, tablet e celular

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 1. Clonar o repositório

```bash
git clone https://github.com/bininpython/medodonto.git
cd medodonto
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais do Supabase:

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Configurar o banco de dados

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor**
4. Execute o conteúdo do arquivo `supabase/schema.sql`

> Isso criará todas as tabelas, RLS policies, triggers e categorias iniciais.

### 5. Criar primeiro usuário

No Supabase Dashboard:
1. Vá em **Authentication** → **Users**
2. Clique em **Add User** → **Create New User**
3. Insira e-mail e senha

### 6. Executar localmente

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy na Vercel

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Importe o repositório
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## 🏗️ Tecnologias

| Tecnologia | Uso |
|---|---|
| Next.js 16 | Framework React (App Router) |
| TypeScript | Tipagem estática |
| Tailwind CSS 4 | Estilização |
| shadcn/ui | Componentes UI |
| Supabase | Banco de dados PostgreSQL + Auth |
| Recharts | Gráficos |
| React Hook Form + Zod | Formulários + validação |
| Lucide React | Ícones |
| Sonner | Notificações toast |

## 📁 Estrutura

```
src/
├── app/
│   ├── (auth)/login/        # Tela de login
│   ├── (dashboard)/         # Páginas protegidas
│   │   ├── page.tsx         # Dashboard
│   │   ├── entradas/        # Entradas
│   │   ├── despesas/        # Despesas
│   │   ├── contas/          # Contas a pagar/receber
│   │   ├── caixa/           # Caixa
│   │   ├── relatorios/      # Relatórios
│   │   ├── historico/       # Histórico
│   │   └── configuracoes/   # Configurações
│   ├── layout.tsx           # Layout raiz
│   └── globals.css          # Tema MED ODONTO
├── components/
│   ├── layout/              # Sidebar, Header, Mobile Nav
│   ├── dashboard/           # Cards, Charts
│   ├── transactions/        # Form, Table, Filters
│   └── ui/                  # shadcn components
├── lib/
│   ├── supabase/            # Client/Server/Proxy
│   ├── utils.ts             # Formatação BRL, datas
│   └── validators.ts        # Schemas Zod
├── types/
│   └── database.ts          # TypeScript types
└── proxy.ts                 # Auth proxy (route protection)
```

## 📄 Licença

Projeto privado — Med Odonto © 2026
