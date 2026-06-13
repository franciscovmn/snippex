import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./views/Login";
import Register from "./views/Register";
import SnippexForm from "./views/snippet-form";
import Dashboard from "./views/Dashboard";
import MySnippets from "./views/MySnippets"; 
import AppLayout from "./components/layout/AppLayout";
import SnippetView from "./views/SnippetView";
import UserConfig from "./views/UserConfig";
import { PrivateRoute } from "./views/PrivateRoute";

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
          <Route path="/snippet/:id" element={<SnippetView />} />

          {/* rotas privadas, o usuário tem que estar logado pra acessar elas */}
          <Route path="/my-snippets" element={ <PrivateRoute> <MySnippets /> </PrivateRoute>} />
          <Route path="/new" element={<PrivateRoute> <SnippexForm /> </PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute> <SnippexForm /> </PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute> <UserConfig /> </PrivateRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}