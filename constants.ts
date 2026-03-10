
import { TransactionType, ExpenseNature, TransactionScope, ExpenseCategory } from './types';

export const CATEGORY_COLORS: Record<string, string> = {
  'Condomínio': '#4b5563',
  'Telefone': '#0ea5e9',
  'Jardineiro': '#15803d',
  'Viagem': '#8b5cf6',
  'Combustível': '#f97316',
  'Imposto': '#ef4444',
  'Multa': '#b91c1c',
  'Taxa': '#f87171',
  'Cartão': '#3b82f6',
  'Restaurante': '#10b981',
  'Lanchonete': '#34d399',
  'Happy Hour': '#f59e0b',
  'Presente': '#ec4899',
  'Diarista': '#8b5cf6',
  'Energia Elétrica': '#fbbf24',
  'Água': '#60a5fa',
  'Gás': '#fb923c',
  'Escola': '#4f46e5',
  'Curso': '#6366f1',
  'Psicóloga': '#a855f7',
  'Plano Saúde': '#2dd4bf',
  'Manutenção Veículo': '#64748b',
  'Outros': '#94a3b8',
  'Poupança': '#10b981',
  'LCI': '#3b82f6',
  'LCA': '#6366f1',
  'CDB': '#f59e0b',
  'Ações': '#ef4444',
  'Fundos Imobiliários': '#8b5cf6',
  'Tesouro Direto': '#f97316'
};

export const INITIAL_TRANSACTIONS: any[] = [
  {
    id: '1',
    description: 'Aluguel',
    amount: 1500,
    vencimento: '2024-05-01',
    pagamento: '2024-05-01',
    category: ExpenseCategory.OUTROS,
    parcela: '1',
    totalParcelas: '1',
    nature: ExpenseNature.ROUTINE,
    type: TransactionType.EXPENSE,
    scope: TransactionScope.DOMESTIC
  },
  {
    id: '2',
    description: 'Salário Mensal',
    amount: 5000,
    vencimento: '2024-05-05',
    pagamento: '2024-05-05',
    category: 'Salário',
    parcela: '1',
    totalParcelas: '1',
    nature: ExpenseNature.ROUTINE,
    type: TransactionType.INCOME,
    scope: TransactionScope.INDIVIDUAL
  }
];
