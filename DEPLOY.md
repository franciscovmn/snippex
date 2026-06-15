# Deploy Sem Dominio

O caminho mais simples para publicar o Snippex sem comprar dominio e usar:

- Frontend: Vercel
- Backend: Railway
- Banco: Supabase

## 1. Frontend

No Vercel:

- importe o repositório
- selecione `Snippex_Frontend`
- defina o `Root Directory` como `Snippex_Frontend`
- mantenha o framework em `Vite` ou `Other` se ele detectar errado
- use `npm run build` como build command
- use `dist` como output directory
- defina as variaveis de ambiente:
  - `VITE_API_URL=https://SEU_BACKEND.up.railway.app`
  - `VITE_SUPABASE_URL=...`
  - `VITE_SUPABASE_ANON_KEY=...`
- deixe o build padrao do Vite
- o arquivo `Snippex_Frontend/vercel.json` garante fallback para rotas do React Router

O Vercel vai publicar em um subdominio `vercel.app`.

## 2. Backend

Na Railway:

- crie um Service apontando para `Snippex_Backend`
- comando de start: `npm start`
- defina as variaveis:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT=3000`
  - `CORS_ORIGIN=https://SEU_FRONTEND.vercel.app`
  - `N8N_WEBHOOK_SNIPPEX_ENRICH`
  - `YAMPI_USER_TOKEN`
  - `YAMPI_USER_SECRET_KEY`
  - `YAMPI_STORE_ALIAS`
  - `YAMPI_WEBHOOK_SECRET`

A Railway vai publicar em um subdominio `up.railway.app`.

## 3. Yampi

Depois que o backend estiver publico, cadastre o webhook com:

- URL: `https://SEU_BACKEND.up.railway.app/api/integrations/yampi/webhook`
- eventos:
  - `Pedido criado`
  - `Pedido atualizado`
  - `Pedido aprovado`
  - `Cliente criado`

O valor exibido em `Chave secreta` no webhook da Yampi deve ir para `YAMPI_WEBHOOK_SECRET`.

## 4. Observacoes

- O frontend precisa apontar para a URL publica do backend.
- O backend precisa aceitar a URL publica do frontend no CORS.
- Nao e necessario comprar dominio para isso.
