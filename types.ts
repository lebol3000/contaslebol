
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
  INCOME = 'Remuneração',
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
}

export enum ExpenseCategory {
  CONDOMINIO = 'Condomínio',
  TELEFONE = 'Telefone',
  JARDINEIRO = 'Jardineiro',
  VIAGEM = 'Viagem',
  COMBUSTIVEL = 'Combustível',
  IMPOSTO = 'Imposto',
  MULTA = 'Multa',
  TAXA = 'Taxa',
  CARTAO = 'Cartão',
  RESTAURANTE = 'Restaurante',
  LANCHONETE = 'Lanchonete',
  HAPPY_HOUR = 'Happy Hour',
  PRESENTE = 'Presente',
  DIARISTA = 'Diarista',
  ENERGIA = 'Energia Elétrica',
  AGUA = 'Água',
  GAS = 'Gás',
  ESCOLA = 'Escola',
  CURSO = 'Curso',
  PSICOLOGA = 'Psicóloga',
  PLANO_SAUDE = 'Plano Saúde',
  MANUTENCAO_VEICULO = 'Manutenção Veículo',
  OUTROS = 'Outros'
}

export enum IncomeCategory {
  SUBSIDIO = 'Subsídio',
  VOLUNTARIO = 'Voluntário',
  AUXILIO_ALIMENTACAO = 'Auxílio Alimentação',
  AUXILIO_UNIFORME = 'Auxílio Uniforme',
  DIARIAS = 'Diárias',
  AJUDA_CUSTO = 'Ajuda de Custo',
  ALUGUEL = 'Aluguel',
  FERIAS = 'Férias',
  GRATIF_NATALINA = 'Gratif. Natalina',
  OUTROS_RENDIMENTOS = 'Outros Rendimentos'
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

export type ViewType = 'dashboard' | 'expenses' | 'income' | 'investments' | 'credit_card' | 'admin';
export type ExpenseSubTab = 'all' | 'annuais' | 'mensais' | 'semanais' | 'eventuais';
