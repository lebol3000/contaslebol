
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Transaction, ExpenseNature, TransactionType, ViewType, ExpenseSubTab, TransactionScope, ExpenseCategory, User, UserRole, IncomeSource, IncomeSourceType } from './types';
import { INITIAL_TRANSACTIONS } from './constants';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import ImportModal from './components/ImportModal';
import UserAccount from './components/UserAccount';
import ResetPassword from './components/ResetPassword';
import { IncomeSourceForm } from './components/IncomeSourceForm';
import { getFinancialInsights } from './services/geminiService';

const addMonths = (dateStr: string, months: number) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1 + months, day);
  if (date.getDate() !== day) {
    date.setDate(0);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('contas_lebol_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({ 
        ...t, 
        type: t.type || TransactionType.EXPENSE,
        scope: t.scope || TransactionScope.INDIVIDUAL 
      }));
    }
    return INITIAL_TRANSACTIONS;
  });

  const [employers, setEmployers] = useState<IncomeSource[]>(() => {
    const saved = localStorage.getItem('lebol_employers');
    return saved ? JSON.parse(saved) : [];
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isEmployerFormOpen, setIsEmployerFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingEmployer, setEditingEmployer] = useState<IncomeSource | null>(null);

  const [formInitialType, setFormInitialType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [formInitialScope, setFormInitialScope] = useState<TransactionScope>(TransactionScope.INDIVIDUAL);
  const [formInitialNature, setFormInitialNature] = useState<ExpenseNature>(ExpenseNature.EVENTUAL);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [expenseSubTab, setExpenseSubTab] = useState<ExpenseSubTab>('all');
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'Rotineiro' | 'Eventual'>('all');
  const [isIncomeSourcesExpanded, setIsIncomeSourcesExpanded] = useState(false);

  // Inicialização do usuário admin e verificação de sessão
  useEffect(() => {
    const initAuth = () => {
      // 1. Garante que o administrador existe
      const savedUsers = localStorage.getItem('lebol_users');
      let users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      
      const adminIndex = users.findIndex(u => u.email === 'lebol3000@gmail.com');
      if (adminIndex === -1) {
        users.push({
          id: 'admin_1',
          email: 'lebol3000@gmail.com',
          password: '123456',
          name: 'Administrador',
          role: UserRole.ADMIN
        });
        localStorage.setItem('lebol_users', JSON.stringify(users));
      } else {
        // Forçar a senha para 123456 conforme solicitado
        if (users[adminIndex].password !== '123456') {
          users[adminIndex].password = '123456';
          localStorage.setItem('lebol_users', JSON.stringify(users));
        }
      }

      // 2. Verifica sessão ativa
      const session = localStorage.getItem('lebol_session');
      if (session) {
        const user = JSON.parse(session);
        // Recarregar dados do usuário do "banco" para garantir role/senha atualizada
        const latestUsers: User[] = JSON.parse(localStorage.getItem('lebol_users') || '[]');
        const latestUser = latestUsers.find(u => u.id === user.id);
        setCurrentUser(latestUser || user);
      }
      setIsAuthLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem('contas_lebol_data', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('lebol_employers', JSON.stringify(employers));
  }, [employers]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('lebol_session', JSON.stringify(user));
    
    if (user.isTemporaryPassword) {
      alert("Troque a sua senha provisória");
      setCurrentView('account');
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('lebol_session', JSON.stringify(updatedUser));
    
    // Update in users list
    const savedUsers = localStorage.getItem('lebol_users');
    if (savedUsers) {
      const users: User[] = JSON.parse(savedUsers);
      const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem('lebol_users', JSON.stringify(updatedUsers));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lebol_session');
    setCurrentView('dashboard');
  };

  const saveTransaction = (txData: Omit<Transaction, 'id'> & { id?: string, multiplicar?: boolean }) => {
    if (txData.id) {
      setTransactions(prev => prev.map(t => t.id === txData.id ? ({ ...txData, id: txData.id } as Transaction) : t));
    } else {
      const mainTx: Transaction = {
        ...txData,
        id: Math.random().toString(36).substr(2, 9),
      } as Transaction;

      let finalTxs: Transaction[] = [mainTx];

      if (txData.multiplicar && txData.parcela && txData.totalParcelas) {
        const currentParcel = parseInt(txData.parcela);
        const total = parseInt(txData.totalParcelas);
        if (!isNaN(currentParcel) && !isNaN(total) && currentParcel < total) {
          for (let i = currentParcel + 1; i <= total; i++) {
            finalTxs.push({
              ...txData,
              id: Math.random().toString(36).substr(2, 9),
              parcela: i.toString(),
              vencimento: addMonths(txData.vencimento, i - currentParcel),
              pagamento: '',
              multiplicar: false
            } as Transaction);
          }
        }
      }

      setTransactions(prev => [...finalTxs, ...prev]);
    }
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const saveEmployer = (employer: IncomeSource) => {
    if (employers.some(e => e.id === employer.id)) {
      setEmployers(prev => prev.map(e => e.id === employer.id ? employer : e));
    } else {
      setEmployers(prev => [employer, ...prev]);
    }
    setEditingEmployer(null);
  };

  const deleteEmployer = (id: string) => {
    if (window.confirm('Deseja realmente excluir esta fonte de renda?')) {
      setEmployers(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleEditEmployer = (employer: IncomeSource) => {
    setEditingEmployer(employer);
    setIsEmployerFormOpen(true);
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormInitialType(tx.type);
    setFormInitialScope(tx.scope);
    setFormInitialNature(tx.nature);
    setIsFormOpen(true);
  };

  const generateInsights = async () => {
    if (transactions.length === 0) return;
    setIsAiLoading(true);
    setAiInsights(null);
    try {
      const insights = await getFinancialInsights(transactions);
      setAiInsights(insights);
    } finally {
      setIsAiLoading(false);
    }
  };

  const openIncomeForm = () => {
    setEditingTransaction(null);
    setFormInitialType(TransactionType.INCOME);
    setFormInitialScope(TransactionScope.INDIVIDUAL);
    setFormInitialNature(ExpenseNature.ROUTINE);
    setIsFormOpen(true);
  };

  const openExpenseForm = () => {
    setEditingTransaction(null);
    setFormInitialType(TransactionType.EXPENSE);
    setFormInitialScope(TransactionScope.INDIVIDUAL);
    setFormInitialNature(ExpenseNature.EVENTUAL);
    setIsFormOpen(true);
  };

  const openInvestmentForm = () => {
    setEditingTransaction(null);
    setFormInitialType(TransactionType.INVESTMENT);
    setFormInitialScope(TransactionScope.INDIVIDUAL);
    setFormInitialNature(ExpenseNature.EVENTUAL);
    setIsFormOpen(true);
  };

  const openCreditCardForm = () => {
    setEditingTransaction(null);
    setFormInitialType(TransactionType.EXPENSE);
    setFormInitialScope(TransactionScope.CREDIT_CARD);
    setFormInitialNature(ExpenseNature.EVENTUAL);
    setIsFormOpen(true);
  };

  const handleImportTransactions = (newTxs: Omit<Transaction, 'id'>[]) => {
    const txsWithIds: Transaction[] = newTxs.map(tx => ({
      ...tx,
      id: Math.random().toString(36).substr(2, 9)
    }) as Transaction);
    setTransactions(prev => [...txsWithIds, ...prev]);
  };

  const getFilteredByView = () => {
    let base = transactions;
    if (currentView === 'expenses') {
      base = transactions.filter(t => t.type === TransactionType.EXPENSE && (t.scope === TransactionScope.INDIVIDUAL || t.scope === TransactionScope.DOMESTIC));
    } else if (currentView === 'credit_card') {
      base = transactions.filter(t => t.scope === TransactionScope.CREDIT_CARD);
    } else if (currentView === 'income') {
      base = transactions.filter(t => t.type === TransactionType.INCOME);
    } else if (currentView === 'investments') {
      base = transactions.filter(t => t.type === TransactionType.INVESTMENT);
    }
    return base;
  };

  const filteredTransactions = getFilteredByView().filter(t => 
    filter === 'all' ? true : t.nature === filter
  );

  const SidebarItem = ({ id, label, icon, active, onClick }: { id: ViewType, label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all mb-3 shadow-md border-b-2 ${
        active 
          ? 'bg-blue-600 text-white border-blue-800 ring-2 ring-blue-400' 
          : 'bg-blue-900 text-white border-blue-950 hover:bg-blue-400'
      }`}
    >
      <span className={active ? 'text-white' : 'text-blue-300'}>{icon}</span>
      <span className="text-sm truncate uppercase tracking-tight">{label}</span>
    </button>
  );

  const getViewLabel = (view: ViewType) => {
    switch(view) {
      case 'dashboard': return 'Início';
      case 'expenses': return 'Despesa';
      case 'credit_card': return 'Cartão de Crédito';
      case 'income': return 'Receita';
      case 'investments': return 'Investimento';
      case 'admin': return 'Administração';
      case 'account': return 'Minha Conta';
      default: return view;
    }
  }

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  return (
    <Routes>
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="*" element={
        <>
          {isAuthLoading ? (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !currentUser ? (
            <LoginPage onLogin={handleLogin} />
          ) : (
            <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">L</div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">CONTAS LEBOL</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Finance Manager</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Principal</div>
          <SidebarItem id="dashboard" label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>}/>
          <SidebarItem id="account" label="Conta" active={currentView === 'account'} onClick={() => setCurrentView('account')} icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}/>
          
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-8">Gestão</div>
          <SidebarItem id="income" label="Receita" active={currentView === 'income'} onClick={() => setCurrentView('income')} icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}/>
          <SidebarItem id="expenses" label="Despesa" active={currentView === 'expenses'} onClick={() => setCurrentView('expenses')} icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}/>
          <SidebarItem id="credit_card" label="Cartão de Crédito" active={currentView === 'credit_card'} onClick={() => setCurrentView('credit_card')} icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>}/>
          <SidebarItem id="investments" label="Investimento" active={currentView === 'investments'} onClick={() => setCurrentView('investments')} icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}/>
          
          {isAdmin && (
            <>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-8">Administrador</div>
              <SidebarItem id="admin" label="ADM" active={currentView === 'admin'} onClick={() => setCurrentView('admin')} icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}/>
            </>
          )}

          <div className="pt-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-rose-500 hover:bg-rose-50 transition-all uppercase text-xs tracking-widest"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sair da Conta
            </button>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 uppercase">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tighter">{currentUser.name}</p>
              <p className="text-[9px] font-bold text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden bg-white border-b border-slate-100 p-4 flex justify-between items-center sticky top-0 z-40">
           <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">L</div>
            <h1 className="font-bold text-slate-800 text-xs tracking-tighter">CONTAS LEBOL</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button onClick={() => setCurrentView('admin')} className={`p-2 rounded-lg ${currentView === 'admin' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </button>
            )}
            <button onClick={handleLogout} className="text-rose-500 p-2"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8 pb-24 lg:pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 capitalize">{getViewLabel(currentView)}</h2>
                <p className="text-slate-500 font-medium mt-1">
                  {currentView === 'admin' ? 'Área restrita de gerenciamento do sistema.' : `Painel financeiro de ${currentUser.name}.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {currentView === 'income' && (
                  <>
                    {employers.length > 0 && (
                      <button 
                        onClick={() => setIsIncomeSourcesExpanded(!isIncomeSourcesExpanded)}
                        className={`text-xs flex items-center gap-3 font-black px-5 py-2.5 rounded-xl transition-all shadow-sm border ${
                          isIncomeSourcesExpanded 
                          ? 'bg-slate-700 text-white border-slate-700 shadow-lg shadow-slate-200' 
                          : 'bg-slate-500 text-white border-slate-500 hover:bg-slate-600 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="uppercase tracking-widest">Fontes</span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isIncomeSourcesExpanded ? 'bg-white/20 text-white' : 'bg-white/10 text-white'}`}>
                            {employers.length}
                          </span>
                        </div>
                        <svg 
                          width="12" height="12" 
                          fill="none" stroke="currentColor" strokeWidth="3" 
                          viewBox="0 0 24 24"
                          className={`transition-transform duration-300 ${isIncomeSourcesExpanded ? 'rotate-180' : ''}`}
                        >
                          <path d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    )}
                    <button onClick={() => setIsEmployerFormOpen(true)} className="text-sm flex items-center gap-2 font-black px-5 py-2.5 rounded-xl bg-slate-800 text-white shadow-lg shadow-slate-100 hover:bg-slate-900 active:scale-95 transition-all">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                      FONTE
                    </button>
                    <button onClick={openIncomeForm} className="text-sm flex items-center gap-2 font-black px-5 py-2.5 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                      RECEITA
                    </button>
                  </>
                )}
                {currentView === 'expenses' && (
                  <button onClick={openExpenseForm} className="text-sm flex items-center gap-2 font-black px-5 py-2.5 rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-100 hover:bg-rose-700 active:scale-95 transition-all">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                    DESPESA
                  </button>
                )}
                {currentView === 'investments' && (
                  <button onClick={openInvestmentForm} className="text-sm flex items-center gap-2 font-black px-5 py-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                    CADASTRAR INVESTIMENTO
                  </button>
                )}
                {currentView === 'credit_card' && (
                  <>
                    <button onClick={() => setIsImportOpen(true)} className="text-sm flex items-center gap-2 font-black px-5 py-2.5 rounded-xl bg-slate-800 text-white shadow-lg shadow-slate-100 hover:bg-slate-900 active:scale-95 transition-all">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                      IMPORTAR FATURA
                    </button>
                    <button onClick={openCreditCardForm} className="text-sm flex items-center gap-2 font-black px-5 py-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                      CADASTRAR CARTÃO
                    </button>
                  </>
                )}
                {currentView !== 'admin' && (
                  <button type="button" onClick={generateInsights} disabled={isAiLoading} className={`text-sm flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${isAiLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 active:scale-95'}`}>
                    {isAiLoading ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>Analisando...</span> : <>✨ Consultoria Inteligente</>}
                  </button>
                )}
              </div>
            </div>

            {aiInsights && currentView !== 'admin' && (
              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="bg-white/20 p-1.5 rounded-lg text-xs">AI</span> Insights Lebol</h3>
                  <div className="text-blue-50 whitespace-pre-line text-sm md:text-base leading-relaxed font-medium">{aiInsights}</div>
                  <button type="button" onClick={() => setAiInsights(null)} className="mt-6 text-xs font-black text-white/50 hover:text-white uppercase tracking-widest transition-colors">Fechar</button>
                </div>
              </div>
            )}

            {currentView === 'dashboard' && <Dashboard transactions={transactions} />}
            {currentView === 'admin' && isAdmin && <AdminPanel currentUser={currentUser} />}
            {currentView === 'account' && <UserAccount currentUser={currentUser} onUpdateUser={handleUpdateUser} />}

            {currentView === 'income' && employers.length > 0 && isIncomeSourcesExpanded && (
              <section className="space-y-4 mb-8 animate-in slide-in-from-top-2 duration-200">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-50">
                    {employers.map(emp => (
                      <div key={emp.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            {emp.type === IncomeSourceType.EMPRESA_ORGAO && <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>}
                            {emp.type === IncomeSourceType.ALUGUEL && <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>}
                            {emp.type === IncomeSourceType.HONORARIOS && <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
                            {emp.type === IncomeSourceType.PAGAMENTOS_DIVERSOS && <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z"/><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 18a6 6 0 110-12 6 6 0 010 12z"/></svg>}
                          </div>
                          <span className="font-bold text-slate-700 text-sm uppercase tracking-tight">
                            {emp.type === IncomeSourceType.EMPRESA_ORGAO 
                              ? emp.name 
                              : emp.type === IncomeSourceType.ALUGUEL 
                                ? `Aluguel ${emp.address}` 
                                : emp.type === IncomeSourceType.HONORARIOS 
                                  ? `Honorários ${emp.client}` 
                                  : `Pagamentos Diversos ${emp.client}`}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditEmployer(emp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <button onClick={() => deleteEmployer(emp.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {currentView !== 'admin' && currentView !== 'dashboard' && (
              <section className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800">
                      {currentView === 'income' ? 'Lançamentos de Receitas Recentes' : 
                       currentView === 'expenses' ? 'Lançamentos de Despesa Recentes' : 
                       `Lista de ${getViewLabel(currentView)}`}
                    </h2>
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                      {(['all', 'Rotineiro', 'Eventual'] as const).map((f) => (
                        <button key={f} type="button" onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{f === 'all' ? 'Todos' : f}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <th className="px-6 py-5">{currentView === 'investments' ? 'Espécie' : 'Âmbito'}</th>
                          <th className="px-6 py-5">Descrição / Parcela</th>
                          <th className="px-6 py-5">Categoria</th>
                          <th className="px-6 py-5">Natureza</th>
                          <th className="px-6 py-5 text-right">Valor</th>
                          <th className="px-6 py-5">Vencimento</th>
                          <th className="px-6 py-5 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${tx.type === TransactionType.INCOME ? 'bg-emerald-500' : tx.type === TransactionType.INVESTMENT ? 'bg-blue-500' : tx.scope === TransactionScope.DOMESTIC ? 'bg-indigo-500' : 'bg-rose-500'}`} />
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-tighter">
                                  {tx.scope === TransactionScope.INDIVIDUAL ? 'IND' : tx.scope === TransactionScope.DOMESTIC ? 'DOM' : tx.scope}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-800">
                                {tx.description}
                                {tx.resgate && (
                                  <span className="ml-2 text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded uppercase tracking-widest">
                                    RESGATADO
                                  </span>
                                )}
                              </p>
                              {tx.scope === TransactionScope.CREDIT_CARD && tx.cardNumber && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-blue-100">
                                    {tx.cardBrand || 'Cartão'}: **** {tx.cardNumber.slice(-4)}
                                  </span>
                                  {tx.cardHolder && (
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                      {tx.cardHolder}
                                    </span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">
                                  {tx.parcela}{tx.totalParcelas ? ` / ${tx.totalParcelas}` : ''}
                                </span>
                                {tx.owner && (
                                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                    {tx.owner}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-blue-50 text-blue-600">
                                {tx.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col gap-1">
                                 <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-center ${tx.nature === 'Rotineiro' ? 'bg-blue-100 text-blue-700' : 'bg-amber-50 text-amber-600'}`}>
                                    {tx.nature}
                                  </span>
                                  {tx.nature === 'Rotineiro' && tx.periodicity && (
                                    <span className="text-[9px] font-bold text-blue-500 uppercase text-center">{tx.periodicity}</span>
                                  )}
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`text-sm font-black ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {tx.type === TransactionType.INCOME ? '+' : tx.type === TransactionType.INVESTMENT ? '-' : '-'} {
                                  ((tx.category === ExpenseCategory.CARTAO || tx.category === ExpenseCategory.CONDOMINIO) && tx.amount === 0) 
                                  ? <span className="text-blue-500 italic font-medium">checar</span>
                                  : `R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                }
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-row items-center gap-2">
                                <span className={`text-sm font-bold ${tx.pagamento ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {tx.vencimento ? new Date(tx.vencimento + 'T12:00:00').toLocaleDateString('pt-BR') : '---'}
                                </span>
                                {tx.pagamento && (
                                  <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 uppercase tracking-tighter">PG</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button type="button" onClick={() => handleEditClick(tx)} className="text-slate-400 hover:text-blue-500 transition-all p-2 rounded-lg hover:bg-blue-50 active:scale-90">
                                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                </button>
                                <button type="button" onClick={() => deleteTransaction(tx.id)} className="text-slate-400 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-50 active:scale-90" title="Excluir">
                                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-300 font-medium">Nada por aqui ainda.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-around z-40">
        <button type="button" onClick={() => setCurrentView('dashboard')} className={`p-2 flex-1 ${currentView === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}><div className="flex flex-col items-center gap-1"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg></div></button>
        <button type="button" onClick={() => setCurrentView('account')} className={`p-2 flex-1 ${currentView === 'account' ? 'text-blue-600' : 'text-slate-400'}`}><div className="flex flex-col items-center gap-1"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div></button>
        <button type="button" onClick={() => setCurrentView('income')} className={`p-2 flex-1 ${currentView === 'income' ? 'text-blue-600' : 'text-slate-400'}`}><div className="flex flex-col items-center gap-1"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg></div></button>
        <button type="button" onClick={() => setCurrentView('expenses')} className={`p-2 flex-1 ${currentView === 'expenses' ? 'text-blue-600' : 'text-slate-400'}`}><div className="flex flex-col items-center gap-1"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div></button>
        <button type="button" onClick={() => setCurrentView('credit_card')} className={`p-2 flex-1 ${currentView === 'credit_card' ? 'text-blue-600' : 'text-slate-400'}`}><div className="flex flex-col items-center gap-1"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg></div></button>
        <button type="button" onClick={() => setCurrentView('investments')} className={`p-2 flex-1 ${currentView === 'investments' ? 'text-blue-600' : 'text-slate-400'}`}><div className="flex flex-col items-center gap-1"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div></button>
      </nav>

      {isEmployerFormOpen && (
        <IncomeSourceForm 
          onSave={saveEmployer} 
          onClose={() => {
            setIsEmployerFormOpen(false);
            setEditingEmployer(null);
          }} 
          editingSource={editingEmployer}
        />
      )}

      {isFormOpen && (
        <TransactionForm 
          initialType={formInitialType} 
          initialScope={formInitialScope} 
          initialNature={formInitialNature} 
          onSave={saveTransaction} 
          onClose={() => {
            setIsFormOpen(false);
            setEditingTransaction(null);
          }} 
          editingTransaction={editingTransaction}
          incomeSources={employers}
        />
      )}

      {isImportOpen && (
        <ImportModal 
          onImport={handleImportTransactions} 
          onClose={() => setIsImportOpen(false)} 
          availableCards={Array.from(new Set(transactions
            .filter(t => t.scope === TransactionScope.CREDIT_CARD && t.cardNumber)
            .map(t => JSON.stringify({
              cardNumber: t.cardNumber,
              cardHolder: t.cardHolder,
              cardBrand: t.cardBrand,
              institution: t.institution,
              owner: t.owner
            }))))
            .map((s: string) => JSON.parse(s))}
        />
      )}
            </div>
          )}
        </>
      } />
    </Routes>
  );
};

export default App;
