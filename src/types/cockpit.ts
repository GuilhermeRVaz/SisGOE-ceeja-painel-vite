// =====================================================================
// TIPOS DO COCKPIT DE VERIFICAÇÃO
// =====================================================================

export type TabType = 'personal' | 'address' | 'schooling';

export interface CockpitContextType {
  // Estado dos dados
  studentData: MergedStudentData | null;
  loading: boolean;
  error: string | null;
  
  // Estado da UI
  activeTab: TabType;
  selectedDocument: DocumentExtraction | null;
  isDocumentPanelVisible: boolean;
  
  // Ações
  setActiveTab: (tab: TabType) => void;
  setSelectedDocument: (doc: DocumentExtraction | null) => void;
  toggleDocumentPanel: () => void;
  saveData: (data: Partial<StudentData>) => Promise<void>;
  approveStudent: () => Promise<void>;
}

export interface MergedStudentData {
  id: string | number;
  student_id?: string | number;
  enrollment_id?: string | number;
  
  // Dados pessoais
  nome?: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  cpf?: string;
  rg?: string;
  nome_mae?: string;
  nome_pai?: string;
  
  // Endereço
  addresses?: {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
  };
  
  // Escolaridade
  schooling_data?: {
    escolaridade_anterior?: string;
    escola_origem?: string;
    ano_conclusao?: string;
    modalidade_ensino?: string;
    turno_preferencia?: string;
  };
  
  // Documentos
  documents?: DocumentExtraction[];
  
  [key: string]: any;
}

export interface StudentData {
  id: string | number;
  nome: string;
  email: string;
  telefone?: string;
  data_nascimento?: string;
  cpf?: string;
  rg?: string;
  nome_mae?: string;
  nome_pai?: string;
  
  // Relacionamentos
  addresses?: any;
  schooling_data?: any;
}

export interface CockpitLayoutProps {
  studentId: string;
  onSave?: (data: StudentData) => void;
  onApprove?: (studentId: string) => void;
  sx?: any;
}
