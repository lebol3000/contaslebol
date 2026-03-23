
import React, { useState } from 'react';
import { User } from '../types';

interface UserAccountProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

const UserAccount: React.FC<UserAccountProps> = ({ currentUser, onUpdateUser }) => {
  const [name, setName] = useState(currentUser.name);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password) {
      // Validate alphanumeric 6 digits
      const alphanumericRegex = /^[a-zA-Z0-9]{6}$/;
      if (!alphanumericRegex.test(password)) {
        setMessage({ type: 'error', text: 'A senha deve ter exatamente 6 caracteres alfanuméricos.' });
        return;
      }

      if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem.' });
        return;
      }
    }

    const updatedUser: User = {
      ...currentUser,
      name,
      password: password || currentUser.password,
      isTemporaryPassword: false // Clear temporary flag on update
    };

    onUpdateUser(updatedUser);
    setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black border border-white/20">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Minha Conta</h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Gerencie seus dados e segurança</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {message && (
            <div className={`mb-8 p-4 rounded-2xl text-xs font-black uppercase tracking-widest border animate-in zoom-in-95 duration-300 ${
              message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-700"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail (Não alterável)</label>
                <input
                  type="email"
                  disabled
                  className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 font-bold cursor-not-allowed"
                  value={currentUser.email}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Alterar Senha
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha (6 alfanuméricos)</label>
                  <input
                    type="password"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-700"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-slate-700"
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 active:scale-95 transition-all shadow-lg shadow-slate-200"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
