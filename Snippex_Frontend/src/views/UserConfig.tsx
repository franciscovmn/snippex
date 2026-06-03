import { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import '../css/settings.css';

function getCurrentUser() {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Erro ao ler usuário do localStorage:', error);
    return null;
  }
}

export default function UserConfig() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setName(user.name);
      setUsername(user.user_name);
      setEmail(user.email);
    }
    setLoading(false);
  }, []);

  async function handleProfileSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSaving(true);
      await userService.updateProfile({ name, user_name: username, email });

      const currentUser = getCurrentUser();
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify({ ...currentUser, name, user_name: username, email }));
      }
      alert('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || 'Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('As senhas não coincidem.');
      return;
    }
    if (!password) {
      alert('Digite uma nova senha.');
      return;
    }
    try {
      setSaving(true);
      await userService.changePassword(password);
      alert('Senha atualizada com sucesso!');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || 'Erro ao atualizar senha.');
    } finally {
      setSaving(false);
    }
  }

  function handleDeleteAccount() {
    const confirmed = window.confirm('Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.');
    if (!confirmed) return;
    console.log('Excluir conta');
  }

  if (loading) {
    return (
      <main className="main-content">
        <div className="page page-narrow">
          <p className="page-subtitle">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="page page-narrow">
        <div className="settings-header">
          <h1>Configurações da Conta</h1>
          <p>Gerencie suas informações pessoais, segurança e preferências.</p>
        </div>

        <div className="card profile-card">
          <Avatar name={name} size={56} />
          <div className="profile-info">
            <h2>{name || 'Seu Nome'}</h2>
            <p>{username ? `@${username}` : 'Sem usuário'}</p>
          </div>
        </div>

        <section className="card settings-card">
          <div className="settings-card-head">
            <h3>Informações do Perfil</h3>
            <p>Atualize seu nome, usuário e e-mail.</p>
          </div>

          <form className="settings-form" onSubmit={handleProfileSave}>
            <div className="settings-row">
              <div className="settings-field">
                <label htmlFor="full-name">Nome completo</label>
                <input id="full-name" className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="settings-field">
                <label htmlFor="username">Usuário</label>
                <input id="username" className="input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            </div>

            <div className="settings-field" style={{ width: '100%' }}>
              <label htmlFor="email">E-mail</label>
              <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <Button variant="secondary" type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </section>

        <section className="card settings-card">
          <div className="settings-card-head">
            <h3>Segurança</h3>
            <p>Defina uma nova senha de acesso.</p>
          </div>

          <form className="settings-form" onSubmit={handlePasswordUpdate}>
            <div className="settings-row">
              <div className="settings-field">
                <label htmlFor="new-password">Nova senha</label>
                <input id="new-password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="settings-field">
                <label htmlFor="confirm-password">Confirmar senha</label>
                <input id="confirm-password" className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>

            <Button variant="secondary" type="submit" disabled={saving}>Atualizar Senha</Button>
          </form>
        </section>

        <section className="card settings-card danger-zone">
          <div className="settings-card-head">
            <h3>Zona de Perigo</h3>
          </div>
          <p>Excluir sua conta removerá permanentemente seus snippets, comentários e dados da plataforma.</p>
          <Button variant="danger" type="button" onClick={handleDeleteAccount}>Excluir Conta</Button>
        </section>
      </div>
    </main>
  );
}
