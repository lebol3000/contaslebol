
import React, { useState, useEffect } from 'react';
import { ExpenseNature, Transaction, TransactionType, TransactionScope, ExpenseCategory, IncomeCategory, InvestmentCategory, PeriodicityType, IncomeSource, IncomeSourceType } from '../types';

interface TransactionFormProps {
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string, multiplicar?: boolean }) => void;
  onClose: () => void;
  initialType?: TransactionType;
  initialScope?: TransactionScope;
  initialNature?: ExpenseNature;
  editingTransaction?: Transaction | null;
  incomeSources?: IncomeSource[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onSave, 
  onClose, 
  initialType = TransactionType.EXPENSE,
  initialScope = TransactionScope.INDIVIDUAL,
  initialNature = ExpenseNature.EVENTUAL,
  editingTransaction = null,
  incomeSources = []
}) => {
  const [description, setDescription] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [vencimento, setVencimento] = useState('');
  const [pagamento, setPagamento] = useState('');
  const [type, setType] = useState<TransactionType>(initialType);
  const [scope, setScope] = useState<TransactionScope>(initialScope);
  const [category, setCategory] = useState<string>('');
  const [parcela, setParcela] = useState('');
  const [totalParcelas, setTotalParcelas] = useState('');
  const [nature, setNature] = useState<ExpenseNature>(initialNature);
  const [periodicity, setPeriodicity] = useState<PeriodicityType>(PeriodicityType.NONE);
  const [multiplicar, setMultiplicar] = useState(false);
  const [owner, setOwner] = useState<string>(editingTransaction?.owner || '');
  const [resgate, setResgate] = useState<string>(editingTransaction?.resgate || '');
  const [cardNumber, setCardNumber] = useState<string>(editingTransaction?.cardNumber || '');
  const [cardHolder, setCardHolder] = useState<string>(editingTransaction?.cardHolder || '');
  const [cardBrand, setCardBrand] = useState<string>(editingTransaction?.cardBrand || '');

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount);
      if (editingTransaction.amount > 0) {
        setAmountDisplay(
          new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(editingTransaction.amount)
        );
      } else {
        setAmountDisplay('');
      }
      setVencimento(editingTransaction.vencimento);
      setPagamento(editingTransaction.pagamento || '');
      setType(editingTransaction.type);
      setScope(editingTransaction.scope);
      setCategory(editingTransaction.category);
      setParcela(editingTransaction.parcela);
      setTotalParcelas(editingTransaction.totalParcelas);
      setNature(editingTransaction.nature);
      setPeriodicity(editingTransaction.periodicity || PeriodicityType.NONE);
      setOwner(editingTransaction.owner || '');
      setResgate(editingTransaction.resgate || '');
      setCardNumber(editingTransaction.cardNumber || '');
      setCardHolder(editingTransaction.cardHolder || '');
      setCardBrand(editingTransaction.cardBrand || '');
    } else {
      setType(initialType);
      // For income, default nature is usually routine unless it's specifically set
      if (initialType === TransactionType.INCOME) {
        setNature(ExpenseNature.ROUTINE);
      }
    }
  }, [editingTransaction, initialType]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setAmount(0);
      setAmountDisplay('');
      return;
    }
    const numericValue = parseInt(value, 10) / 100;
    setAmount(numericValue);
    
    setAmountDisplay(
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isAmountOptional = category === ExpenseCategory.CARTAO || category === ExpenseCategory.CONDOMINIO;
    const isAmountValid = isAmountOptional ? true : amount > 0;

    if (!description || !isAmountValid || !vencimento || !category) {
      alert("Por favor, preencha todos os campos obrigatórios (Categoria, Descrição, Valor e Vencimento/Crédito).");
      return;
    }

    // Determine nature for Income based on periodicity selection
    let finalNature = nature;
    if (type === TransactionType.INCOME) {
      finalNature = (periodicity === PeriodicityType.EVENTUAL) ? ExpenseNature.EVENTUAL : ExpenseNature.ROUTINE;
    }

    onSave({
      id: editingTransaction?.id,
      description,
      amount,
      vencimento,
      pagamento: type === TransactionType.INCOME ? '' : pagamento,
      category,
      parcela,
      totalParcelas,
      nature: finalNature,
      periodicity: (type === TransactionType.INCOME || nature === ExpenseNature.ROUTINE) ? periodicity : PeriodicityType.NONE,
      type,
      scope,
      owner,
      resgate,
      cardNumber,
      cardHolder,
      cardBrand,
      multiplicar: !editingTransaction && multiplicar
    });
    onClose();
  };

  const showMultiplier = !editingTransaction && 
    totalParcelas && 
    parcela && 
    parseInt(totalParcelas) > parseInt(parcela);

  const isIncome = type === TransactionType.INCOME;

  // Determine gender for "Nova" or "Novo"
  const formTitlePrefix = editingTransaction 
    ? 'Editar' 
    : (type === TransactionType.INVESTMENT ? 'Novo' : 'Nova');

  const showPeriodicityField = isIncome || nature === ExpenseNature.ROUTINE;
  
  const isAmountOptional = category === ExpenseCategory.CARTAO || category === ExpenseCategory.CONDOMINIO;

  const getIncomeSourceName = (source: IncomeSource) => {
    switch (source.type) {
      case IncomeSourceType.EMPRESA_ORGAO:
        return source.name || 'Sem nome';
      case IncomeSourceType.ALUGUEL:
        return `Aluguel: ${source.propertyRegistration || source.tenantName || 'Sem ref'}`;
      case IncomeSourceType.HONORARIOS:
      case IncomeSourceType.PAGAMENTOS_DIVERSOS:
        return `${source.type}: ${source.client || 'Sem cliente'}`;
      default:
        return 'Fonte desconhecida';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {formTitlePrefix} {type}
          </h2>
          {type !== TransactionType.INVESTMENT && type !== TransactionType.EXPENSE && (
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-500">
              {scope}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {type === TransactionType.INVESTMENT && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">ESPÉCIE</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={scope}
                onChange={(e) => setScope(e.target.value as TransactionScope)}
                required
              >
                <option value={TransactionScope.INDIVIDUAL}>INDIVIDUAL</option>
                <option value={TransactionScope.DOMESTIC}>DOMÉSTICA</option>
              </select>
            </div>
          )}

          {type === TransactionType.EXPENSE && scope !== TransactionScope.CREDIT_CARD && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">ÂMBITO</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={scope}
                onChange={(e) => setScope(e.target.value as TransactionScope)}
                required
              >
                <option value={TransactionScope.INDIVIDUAL}>INDIVIDUAL</option>
                <option value={TransactionScope.DOMESTIC}>DOMÉSTICA</option>
              </select>
            </div>
          )}

          {scope === TransactionScope.CREDIT_CARD && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Número do Cartão</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="XXXX XXXX XXXX XXXX"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome do Titular</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Como no cartão"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bandeira</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={cardBrand}
                  onChange={(e) => setCardBrand(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Elo">Elo</option>
                  <option value="Amex">Amex</option>
                  <option value="Hipercard">Hipercard</option>
                </select>
              </div>
            </div>
          )}

          {/* Categoria is first */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Categoria</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Selecione uma categoria</option>
              {type === TransactionType.EXPENSE ? (
                Object.values(ExpenseCategory).map(g => (
                  <option key={g} value={g}>{g.toUpperCase()}</option>
                ))
              ) : type === TransactionType.INCOME ? (
                Object.values(IncomeCategory).map(i => (
                  <option key={i} value={i}>{i.toUpperCase()}</option>
                ))
              ) : (
                Object.values(InvestmentCategory).map(inv => (
                  <option key={inv} value={inv}>{inv.toUpperCase()}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              {isIncome ? 'FONTE DE RENDA' : 'Descrição'}
            </label>
            {isIncome ? (
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              >
                <option value="" disabled>Selecione a fonte de renda</option>
                {incomeSources.map(source => (
                  <option key={source.id} value={getIncomeSourceName(source)}>
                    {getIncomeSourceName(source)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Ex: Aluguel, Salário, CDB..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {!isIncome && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Natureza</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={nature}
                  onChange={(e) => setNature(e.target.value as ExpenseNature)}
                >
                  <option value={ExpenseNature.EVENTUAL}>Eventual</option>
                  <option value={ExpenseNature.ROUTINE}>Rotineiro</option>
                </select>
              </div>
            )}

            {showPeriodicityField && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-600 mb-1">Frequência da Rotina</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border border-blue-200 bg-blue-50/30 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={periodicity}
                  onChange={(e) => setPeriodicity(e.target.value as PeriodicityType)}
                  required
                >
                  <option value="" disabled>Escolha a periodicidade</option>
                  <option value={PeriodicityType.WEEKLY}>Semanal</option>
                  <option value={PeriodicityType.MONTHLY}>Mensal</option>
                  <option value={PeriodicityType.SEMIANNUAL}>Semestral</option>
                  <option value={PeriodicityType.ANNUAL}>Anual</option>
                  <option value={PeriodicityType.EVENTUAL}>Eventual</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Valor (R$) {isAmountOptional && <span className="text-[10px] text-blue-400 font-normal italic">(Opcional para {category})</span>}
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0,00"
              value={amountDisplay}
              onChange={handleAmountChange}
            />
          </div>

          <div className={`grid ${isIncome ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                {isIncome ? 'Crédito' : 'Vencimento'}
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
              />
            </div>
            {!isIncome && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 text-[11px] leading-tight">Pagamento/Agendamento</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={pagamento}
                  onChange={(e) => setPagamento(e.target.value)}
                />
              </div>
            )}
          </div>

          {type === TransactionType.INVESTMENT && editingTransaction && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Resgate</label>
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={resgate}
                onChange={(e) => setResgate(e.target.value)}
              />
            </div>
          )}

          {(type !== TransactionType.INVESTMENT || nature === ExpenseNature.ROUTINE) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Parcela</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: 1"
                  value={parcela}
                  onChange={(e) => setParcela(e.target.value)}
                />
              </div>
              {nature === ExpenseNature.ROUTINE && (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Total Parcelas</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: 1"
                    value={totalParcelas}
                    onChange={(e) => setTotalParcelas(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {scope === TransactionScope.CREDIT_CARD && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Dono do Cartão</label>
              <select
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              >
                <option value="">Selecione o dono</option>
                <option value="Leandro">Leandro</option>
                <option value="Fernanda">Fernanda</option>
              </select>
            </div>
          )}

          {showMultiplier && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 animate-in zoom-in-95 duration-200">
              <label className="block text-xs font-bold text-blue-700 uppercase mb-2">Multiplicar lançamentos?</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMultiplicar(true)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${multiplicar ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-blue-600 border border-blue-200'}`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setMultiplicar(false)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!multiplicar ? 'bg-slate-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'}`}
                >
                  Não
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              {editingTransaction ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
