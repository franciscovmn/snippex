# Deploy Vercel + Railway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** preparar o Snippex para deploy sem dominio proprio, com frontend na Vercel, backend na Railway e banco no Supabase.

**Architecture:** o frontend React/Vite consome uma API publica configurada por `VITE_API_URL`; o backend Express fica exposto em uma URL publica e aceita o frontend via CORS parametrizado por ambiente. O banco continua no Supabase e os webhooks da Yampi apontam para o backend publico.

**Tech Stack:** React, Vite, Express, Supabase, Railway, Vercel

---

### Task 1: Restaurar o ponto de entrada do frontend

**Files:**
- Create: `Snippex_Frontend/src/App.tsx`
- Verify: `Snippex_Frontend/src/main.tsx:1-8`

- [ ] **Step 1: Recriar o arquivo App**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/Login";
import Register from "./views/Register";
import SnippexForm from "./views/snippet-form";
import Dashboard from "./views/Dashboard";
import MySnippets from "./views/MySnippets";
import SavedSnippets from "./views/SavedSnippets";
import AppLayout from "./components/layout/AppLayout";
import SnippetView from "./views/SnippetView";
import UserConfig from "./views/UserConfig";
import { PrivateRoute } from "./views/PrivateRoute";
import { ToastProvider } from "./components/ui/Toast";

import "./App.css";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/snippet/:id" element={<SnippetView />} />

            <Route element={<PrivateRoute />}>
              <Route path="/my-snippets" element={<MySnippets />} />
              <Route path="/new" element={<SnippexForm />} />
              <Route path="/saved" element={<SavedSnippets />} />
              <Route path="/edit/:id" element={<SnippexForm />} />
              <Route path="/settings" element={<UserConfig />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
```

- [ ] **Step 2: Garantir que o entrypoint continue importando o App restaurado**

```ts
import App from "./App.tsx";
```

- [ ] **Step 3: Validar o build do frontend**

Run: `cd Snippex_Frontend && npm run build`
Expected: build concluido sem erro de arquivo ausente.

### Task 2: Fechar a configuração de deploy

**Files:**
- Modify: `DEPLOY.md`
- Modify: `Snippex_Backend/.env.example`
- Modify: `Snippex_Frontend/.env.example`
- Modify: `Snippex_Backend/src/config/cors.js`
- Modify: `Snippex_Backend/src/server.js`

- [ ] **Step 1: Manter o CORS por ambiente**

```js
function parseAllowedOrigins(rawValue) {
  if (!rawValue) return [];

  return rawValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function buildCorsOptions(rawAllowedOrigins) {
  const allowedOrigins = parseAllowedOrigins(rawAllowedOrigins);

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin não permitida pelo CORS"), false);
    },
  };
}
```

- [ ] **Step 2: Garantir leitura da env no backend**

```js
app.use(cors(buildCorsOptions(process.env.CORS_ORIGIN || "")));
```

- [ ] **Step 3: Registrar as variáveis de ambiente de produção**

```env
# Snippex_Backend/.env.example
CORS_ORIGIN=https://seu-app.vercel.app
```

```env
# Snippex_Frontend/.env.example
VITE_API_URL=https://seu-backend.up.railway.app
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

- [ ] **Step 4: Atualizar a documentação de deploy**

Run: revisar `DEPLOY.md`
Expected: instrucoes para Vercel + Railway + Supabase e webhook da Yampi apontando para o backend publico.
