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

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* TODO(Futuro MVP): Separar as rotas internas num componente de roteamento autenticado para maior segurança */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-snippets" element={<MySnippets />} />
          <Route path="/saved" element={<SavedSnippets />} />
          <Route path="/new" element={<SnippexForm />} />
          <Route path="/edit/:id" element={<SnippexForm />} />
          <Route path="/snippet/:id" element={<SnippetView />} />
          <Route path="/settings" element={<UserConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
