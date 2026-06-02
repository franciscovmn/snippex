import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import "../css/settings.css";

function getCurrentUser() {
  const user = localStorage.getItem("user");

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Erro ao ler usuário do localStorage:", error);
    return null;
  }
}

export default function UserConfig() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();

    if (user) {
      setName(user.name);
      setUsername(user.user_name);
      setEmail(user.email);

      console.log(user);
    }

    setLoading(false);
  }, []);

async function handleProfileSave(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setSaving(true);

      // 1. Envia a atualização para o servidor
      await userService.updateProfile({
        name,
        user_name: username,
        email,
      });

      // 2. Atualiza os dados locais no localStorage
      const currentUser = getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          name,
          user_name: username,
          email,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      alert("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.error ||
          "Erro ao atualizar perfil."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordUpdate(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    if (!password) {
      alert("Digite uma nova senha.");
      return;
    }

    try {
      setSaving(true);

      await userService.changePassword(password);

      alert("Senha atualizada com sucesso!");

      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.error ||
          "Erro ao atualizar senha."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita."
    );

    if (!confirmed) return;

    console.log("Excluir conta");
  }

  const initials = name.trim()
    ? name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "?";

  if (loading) {
    return (
      <>
        <main className="settings-page">
          <div className="settings-container">
            <h2>Carregando...</h2>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="settings-page">
        <div className="settings-container">
          <div className="settings-header">
            <h1 className="settings-title">
              Configurações da Conta
            </h1>

            <p className="settings-subtitle">
              Gerencie suas informações pessoais,
              segurança e preferências.
            </p>
          </div>

          <div className="profile-card">
            <div
              className="profile-avatar"
              aria-hidden="true"
            >
              {initials}
            </div>

            <div className="profile-info">
              <h2>{name || "Seu Nome"}</h2>

              <p>
                {username
                  ? `@${username}`
                  : "Sem usuário"}
              </p>
            </div>
          </div>

          <section className="settings-card">
            <h3>Informações do Perfil</h3>

            <form
              className="settings-form"
              onSubmit={handleProfileSave}
            >
              <div className="settings-row">
                <div className="settings-field">
                  <label htmlFor="full-name">
                    Nome completo
                  </label>

                  <input
                    id="full-name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="username">
                    Usuário
                  </label>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="email">
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>

              <button
                className="settings-button primary"
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Salvando..."
                  : "Salvar Alterações"}
              </button>
            </form>
          </section>

          <section className="settings-card">
            <h3>Segurança</h3>

            <form
              className="settings-form"
              onSubmit={handlePasswordUpdate}
            >
              <div className="settings-row">
                <div className="settings-field">
                  <label htmlFor="new-password">
                    Nova senha
                  </label>

                  <input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                  />
                </div>

                <div className="settings-field">
                  <label htmlFor="confirm-password">
                    Confirmar senha
                  </label>

                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <button
                className="settings-button primary"
                type="submit"
              >
                Atualizar Senha
              </button>
            </form>
          </section>

          {/* 
          TODO: SEÇÃO DE EXCLUÍR CONTA

          <section className="settings-card danger-zone">
            <h3>Zona de Perigo</h3>

            <p>
              Excluir sua conta removerá
              permanentemente seus snippets,
              comentários e dados da
              plataforma.
            </p>

            <button
              className="settings-button danger"
              type="button"
              onClick={handleDeleteAccount}
            >
              Excluir Conta
            </button>
          </section>
          */}
        </div>
      </main>
    </>
  );
}