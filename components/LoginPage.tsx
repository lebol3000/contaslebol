
import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUsers = localStorage.getItem('lebol_users');
    const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
    const userIndex = users.findIndex(u => u.email === forgotEmail);

    if (userIndex !== -1) {
      const tempPass = generateTempPassword();
      users[userIndex].password = tempPass;
      users[userIndex].isTemporaryPassword = true;
      localStorage.setItem('lebol_users', JSON.stringify(users));
      
      // Simulate sending email
      console.log(`E-mail enviado para ${forgotEmail}: A sua senha provisória é: ${tempPass}`);
      setForgotMessage('Se o seu e-mail estiver cadastrado, você receberá um link com uma senha provisória.');
    } else {
      // Still show the same message for security
      setForgotMessage('Se o seu e-mail estiver cadastrado, você receberá um link com uma senha provisória.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const savedUsers = localStorage.getItem('lebol_users');
    const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      onLogin(user);
    } else {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      
      {/* Grid de fundo sutil */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-10">
          
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-6">
              {/* Novo Logo Tema Planilha/Controle */}
              <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] animate-pulse-slow">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 9H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 21V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 21V9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15L12 12M12 12L10 13M12 12L14 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"/>
                  <circle cx="18" cy="6" r="1.5" fill="white" className="animate-pulse"/>
                </svg>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-1.5 rounded-lg shadow-lg border-2 border-[#1e293b]">
                <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-white tracking-tight text-center">CONTAS LEBOL</h1>
            <p className="text-blue-400/80 text-xs font-bold uppercase tracking-[0.2em] mt-2">Inteligência Financeira</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold p-3.5 rounded-xl text-center animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-blue-500 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-white placeholder:text-slate-600"
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sua Senha</label>
                <button 
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Esqueci a senha
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-11 pr-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-blue-500 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-white placeholder:text-slate-600"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 group"
              >
                ACESSAR
                <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </button>
            </div>
          </form>

          <div className="mt-10 flex items-center justify-center gap-6">
             <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                <div className="text-white mb-1"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg></div>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Gráficos</span>
             </div>
             <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                <div className="text-white mb-1"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.641 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.641-1M12 16a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"/></svg></div>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Controle</span>
             </div>
             <div className="flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity">
                <div className="text-white mb-1"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg></div>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Insights IA</span>
             </div>
          </div>
        </div>

        <p className="text-center text-[9px] text-slate-500 font-bold mt-8 uppercase tracking-[0.3em] opacity-50">
          Lebol Financial Suite &copy; {new Date().getFullYear()}
        </p>
      </div>

      {/* Modal Esqueci a Senha */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-[#1e293b] border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 mb-4">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Recuperar Senha</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 text-center">Informe seu e-mail cadastrado</p>
            </div>

            {forgotMessage ? (
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold p-4 rounded-2xl text-center leading-relaxed">
                  {forgotMessage}
                </div>
                <button 
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setForgotMessage('');
                    setForgotEmail('');
                  }}
                  className="w-full py-4 bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                >
                  VOLTAR AO LOGIN
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu E-mail</label>
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-blue-500 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-white placeholder:text-slate-600"
                    placeholder="nome@exemplo.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="flex-1 py-4 bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                  >
                    ENVIAR
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-pulse-slow { animation: pulse-slow 4s infinite ease-in-out; }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}} />
    </div>
  );
};

export default LoginPage;
