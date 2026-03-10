
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AdminPanelProps {
  currentUser: User;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: UserRole.USER });
  const [resetPasswordInfo, setResetPasswordInfo] = useState<{ userId: string, newPass: string } | null>(null);

  useEffect(() => {
    const savedUsers = localStorage.getItem('lebol_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const saveToLocalStorage = (updatedUsers: User[]) => {
    localStorage.setItem('lebol_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Preencha todos os campos.");
      return;
    }

    if (users.some(u => u.email === newUser.email)) {
      alert("E-mail já cadastrado.");
      return;
    }

    const createdUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...newUser
    };

    const updated = [...users, createdUser];
    saveToLocalStorage(updated);
    setIsAddingUser(false);
    setNewUser({ name: '', email: '', password: '', role: UserRole.USER });
  };

  const handleResetPassword = () => {
    if (!resetPasswordInfo) return;
    
    const updated = users.map(u => 
      u.id === resetPasswordInfo.userId 
        ? { ...u, password: resetPasswordInfo.newPass } 
        : u
    );
    
    saveToLocalStorage(updated);
    setResetPasswordInfo(null);
    alert("Senha resetada com sucesso!");
  };

  const deleteUser = (id: string) => {
    if (id === currentUser.id) {
      alert("Você não pode excluir seu próprio usuário.");
      return;
    }
    if (window.confirm("Tem certeza que deseja excluir este usuário?")) {
      const updated = users.filter(u => u.id !== id);
      saveToLocalStorage(updated);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Gestão de Usuários</h2>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Configurações de Acesso</p>
        </div>
        <button 
          onClick={() => setIsAddingUser(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-5">Nome</th>
                <th className="px-6 py-5">E-mail</th>
                <th className="px-6 py-5">Cargo</th>
                <th className="px-6 py-5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{u.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    {u.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${u.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => setResetPasswordInfo({ userId: u.id, newPass: '' })}
                        className="text-amber-500 hover:bg-amber-50 p-2 rounded-xl transition-all"
                        title="Resetar Senha"
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                      </button>
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className={`text-rose-400 hover:bg-rose-50 p-2 rounded-xl transition-all ${u.id === currentUser.id ? 'opacity-20 cursor-not-allowed' : ''}`}
                        title="Excluir Usuário"
                        disabled={u.id === currentUser.id}
                      >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adicionar Usuário */}
      {isAddingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6">Novo Usuário</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">E-mail</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Senha Provisória</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cargo</label>
                <select 
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs uppercase"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.USER}>Usuário</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingUser(false)} className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Senha */}
      {resetPasswordInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 text-center">Resetar Senha</h3>
            <p className="text-xs text-slate-400 font-bold text-center uppercase tracking-widest mb-6">Defina uma nova senha para o usuário</p>
            <div className="space-y-4">
              <input 
                type="password" 
                placeholder="Nova Senha"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={resetPasswordInfo.newPass}
                onChange={e => setResetPasswordInfo({...resetPasswordInfo, newPass: e.target.value})}
              />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setResetPasswordInfo(null)} className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancelar</button>
                <button onClick={handleResetPassword} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-amber-500 text-white shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all">Redefinir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
