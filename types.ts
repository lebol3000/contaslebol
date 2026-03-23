
export enum ExpenseNature {
  ROUTINE = 'Rotineiro',
  EVENTUAL = 'Eventual'
}

export enum PeriodicityType {
  ANNUAL = 'Anual',
  SEMIANNUAL = 'Semestral',
  MONTHLY = 'Mensal',
  WEEKLY = 'Semanal',
  EVENTUAL = 'Eventual',
  NONE = ''
}

export enum TransactionType {
  EXPENSE = 'Despesa',
  INCOME = 'Receita',
  INVESTMENT = 'Investimento'
}

export enum TransactionScope {
  INDIVIDUAL = 'Individual',
  DOMESTIC = 'Doméstica',
  CREDIT_CARD = 'Cartão de Crédito'
}

export enum UserRole {
  ADMIN = 'Administrador',
  USER = 'Usuário'
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  isTemporaryPassword?: boolean;
}

export enum ExpenseCategory {
  AGUA = 'Água',
  CARTAO = 'Cartão',
  COMBUSTIVEL = 'Combustível',
  CONDOMINIO = 'Condomínio',
  CURSO = 'Curso',
  DIARISTA = 'Diarista',
  EMPRESTIMO = 'EMPRÉSTIMO',
  ENERGIA = 'Energia Elétrica',
  ESCOLA = 'Escola',
  GAS = 'Gás',
  HAPPY_HOUR = 'Happy Hour',
  IMPOSTO = 'Imposto',
  IR_RETIDO = 'IR RETIDO',
  JARDINEIRO = 'Jardineiro',
  LANCHONETE = 'Lanchonete',
  MANUTENCAO_VEICULO = 'Manutenção Veículo',
  MULTA = 'Multa',
  PENSAO_ALIMENTICIA = 'PENSÃO ALIMENTÍCIA',
  PLANO_SAUDE = 'Plano Saúde',
  PRESENTE = 'Presente',
  PSICOLOGA = 'Psicóloga',
  RESTAURANTE = 'Restaurante',
  SEGURIDADE_SOCIAL = 'SEGURIDADE SOCIAL',
  SINDICATO = 'SINDICATO',
  TAXA = 'Taxa',
  TELEFONE = 'Telefone',
  VIAGEM = 'Viagem',
  OUTRAS = 'Outras'
}

export enum IncomeCategory {
  SUBSIDIO = 'SUBSÍDIO',
  VOLUNTARIO = 'VOLUNTÁRIO',
  AUXILIO_ALIMENTACAO = 'AUX-ALIMENTAÇÃO',
  AUXILIO_UNIFORME = 'AUX-UNIFORME',
  DIARIAS = 'DIÁRIAS',
  AJUDA_CUSTO = 'AJUDA DE CUSTO',
  ALUGUEL = 'ALUGUEL',
  FERIAS = 'FÉRIAS',
  GRATIF_NATALINA = 'GRATIF. NATALINA',
  OUTROS_RENDIMENTOS = 'OUTROS RENDIMENTOS'
}

export enum InvestmentCategory {
  POUPANCA = 'Poupança',
  LCI = 'LCI',
  LCA = 'LCA',
  CDB = 'CDB',
  ACOES = 'Ações',
  FUNDOS_IMOBILIARIOS = 'Fundos Imobiliários',
  TESOURO_DIRETO = 'Tesouro Direto',
  OUTROS = 'Outros'
}

export interface Transaction {
  id: string;
  description: string;
  institution?: string;
  amount: number;
  vencimento: string;
  pagamento: string;
  category: ExpenseCategory | IncomeCategory | InvestmentCategory | string;
  parcela: string;
  totalParcelas: string;
  nature: ExpenseNature;
  periodicity?: PeriodicityType;
  type: TransactionType;
  scope: TransactionScope;
  owner?: string;
  resgate?: string;
  cardNumber?: string;
  cardHolder?: string;
  cardBrand?: string;
}

export interface CategorySummary {
  name: string;
  value: number;
  color: string;
}

export enum IncomeSourceType {
  EMPRESA_ORGAO = 'EMPRESA/ORGÃO',
  ALUGUEL = 'ALUGUEL',
  HONORARIOS = 'HONORÁRIOS',
  PAGAMENTOS_DIVERSOS = 'PAGAMENTOS DIVERSOS'
}

export interface IncomeSource {
  id: string;
  type: IncomeSourceType;
  
  // EMPRESA/ORGÃO
  name?: string;
  document?: string; // CNPJ/CPF
  address?: string;
  admissionDate?: string;
  position?: string; // Cargo
  
  // ALUGUEL
  propertyRegistration?: string; // MATRÍCULA IMÓVEL
  sefazRegistration?: string; // INSCRIÇÃO SEFAZ
  value?: number;
  installment?: string;
  totalInstallments?: string;
  startDate?: string;
  endDate?: string;
  tenantName?: string;
  tenantCpf?: string;
  tenantPhone?: string;
  guarantorName?: string;
  guarantorCpf?: string;
  guarantorPhone?: string;
  
  // HONORÁRIOS & PAGAMENTOS DIVERSOS
  client?: string;
  description?: string;
  receiptDate?: string;
}

export type ViewType = 'dashboard' | 'expenses' | 'income' | 'investments' | 'credit_card' | 'admin' | 'account';
export type ExpenseSubTab = 'all' | 'annuais' | 'mensais' | 'semanais' | 'eventuais';
