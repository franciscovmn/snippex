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
