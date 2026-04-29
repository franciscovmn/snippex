import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/Login";
import Register from "./views/Register";
import SnippexForm from "./views/snippet-form";
import Dashboard from "./views/Dashboard";

// Novos imports
import MySnippets from "./views/MySnippets"; 
import AppLayout from "./components/layout/AppLayout"; // Ajuste o caminho se tiver salvo em outra pasta

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas (Não possuem o Menu Lateral) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas Internas (Envolvidas pelo AppLayout, ou seja, terão o Menu Lateral) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />          {/* Vitrine da Comunidade */}
          <Route path="/my-snippets" element={<MySnippets />} />       {/* Seus próprios snippets */}
          <Route path="/new" element={<SnippexForm />} />              {/* Criar */}
          <Route path="/edit/:id" element={<SnippexForm />} />         {/* Editar */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}