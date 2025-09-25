// =====================================================================
// TIPOS PARA SISTEMA DE CHECKLIST DE DOCUMENTOS
// =====================================================================

// Interfaces principais
export interface DocumentChecklistItem {
  id: string;
  document_type: string;
  document_name: string;
  is_required: boolean;
  is_delivered: boolean;
  delivered_at?: string;
  approved_by_admin?: boolean;
  admin_notes?: string;
  required_for_enrollment: boolean;
  category: 'personal' | 'address' | 'schooling' | 'other';
}

export interface DocumentChecklistStatus {
  total_required: number;
  total_delivered: number;
  total_approved: number;
  is_complete: boolean;
  missing_documents: DocumentChecklistItem[];
  pending_approval: DocumentChecklistItem[];
  approved_documents: DocumentChecklistItem[];
}

export interface StudentDocumentChecklist {
  id: string;
  student_id: string;
  enrollment_id?: string;
  items: DocumentChecklistItem[];
  status: DocumentChecklistStatus;
  created_at: string;
  updated_at: string;
  last_reviewed_by?: string;
  last_reviewed_at?: string;
}
  id: string;
  document_type: string;
  document_name: string;
  is_required: boolean;
  is_delivered: boolean;
  delivered_at?: string;
  approved_by_admin?: boolean;
  admin_notes?: string;
  required_for_enrollment: boolean;
  category: 'personal' | 'address' | 'schooling' | 'other';
}

export interface DocumentChecklistStatus {
  total_required: number;
  total_delivered: number;
  total_approved: number;
  is_complete: boolean;
  missing_documents: DocumentChecklistItem[];
  pending_approval: DocumentChecklistItem[];
  approved_documents: DocumentChecklistItem[];
}

export interface StudentDocumentChecklist {
  id: string;
  student_id: string;
  enrollment_id?: string;
  items: DocumentChecklistItem[];
  status: DocumentChecklistStatus;
  created_at: string;
  updated_at: string;
  last_reviewed_by?: string;
  last_reviewed_at?: string;
}

// =====================================================================
// CONSTANTES PARA DOCUMENTOS PADRÃO
// =====================================================================

export const DEFAULT_REQUIRED_DOCUMENTS: Omit<DocumentChecklistItem, 'id' | 'delivered_at'>[] = [
  // Documentos Pessoais
  {
    document_type: 'rg',
    document_name: 'RG (Carteira de Identidade)',
    is_required: true,
    is_delivered: false,
    required_for_enrollment: true,
    category: 'personal',
    approved_by_admin: false
  },
  {
    document_type: 'cpf',
    document_name: 'CPF',
    is_required: true,
    is_delivered: false,
    required_for_enrollment: true,
    category: 'personal',
    approved_by_admin: false
  },
  {
    document_type: 'certidao_nascimento_casamento',
    document_name: 'Certidão de Nascimento ou Casamento',
    is_required: true,
    is_delivered: false,
    required_for_enrollment: true,
    category: 'personal',
    approved_by_admin: false
  },
  {
    document_type: 'foto_3x4',
    document_name: 'Foto 3x4',
    is_required: true,
    is_delivered: false,
    required_for_enrollment: true,
    category: 'personal',
    approved_by_admin: false
  },
  {
    document_type: 'historico_escolar_fundamental',
    document_name: 'Histórico Escolar - Ensino Fundamental',
    is_required: true,
    is_delivered: false,
    required_for_enrollment: true,
    category: 'schooling',
    approved_by_admin: false
  },
  {
    document_type: 'historico_escolar_medio',
    document_name: 'Histórico Escolar - Ensino Médio (se aplicável)',
    is_required: false,
    is_delivered: false,
    required_for_enrollment: false,
    category: 'schooling',
    approved_by_admin: false
  },
  {
    document_type: 'comprovante_residencia',
    document_name: 'Comprovante de Residência',
    is_required: true,
    is_delivered: false,
    required_for_enrollment: true,
    category: 'address',
    approved_by_admin: false
  },
  {
    document_type: 'tit_eleitor',
    document_name: 'Título de Eleitor',
    is_required: false,
    is_delivered: false,
    required_for_enrollment: false,
    category: 'other',
    approved_by_admin: false
  },
  {
    document_type: 'carteira_vacinacao_covid',
    document_name: 'Carteira de Vacinação COVID',
    is_required: false,
    is_delivered: false,
    required_for_enrollment: false,
    category: 'other',
    approved_by_admin: false
  },
  {
    document_type: 'atestado_eliminacao_disciplina',
    document_name: 'Atestado de Eliminação de Disciplina (se aplicável)',
    is_required: false,
    is_delivered: false,
    required_for_enrollment: false,
    category: 'schooling',
    approved_by_admin: false
  },
  {
    document_type: 'declaracao_transferencia',
    document_name: 'Declaração de Transferência (se aplicável)',
    is_required: false,
    is_delivered: false,
    required_for_enrollment: false,
    category: 'schooling',
    approved_by_admin: false
  },
  {
    document_type: 'requerimento_dispensa_educacao_fisica',
    document_name: 'Requerimento de Dispensa de Educação Física',
    is_required: false,
    is_delivered: false,
    required_for_enrollment: false,
    category: 'schooling',
    approved_by_admin: false
  },
  {
    document_type: 'reservista',
    document_name: 'Reservista',
    is_required: false,
    is_delivered: false,
    required_for_enrollment: false,
    category: 'other',
    approved_by_admin: false
  },
  {
    document_type: 'outros',
    document_name: 'Outros Documentos',
    is_required: false,
    is_delivered: false,
    required_for_enrollment: false,
    category: 'other',
    approved_by_admin: false
  }
];

export const DOCUMENT_CATEGORY_LABELS = {
  personal: 'Documentos Pessoais',
  address: 'Documentos de Endereço',
  schooling: 'Documentos Escolares',
  other: 'Outros Documentos'
} as const;

export const DOCUMENT_STATUS_LABELS = {
  missing: 'Documento Pendente',
  delivered: 'Documento Entregue',
  approved: 'Documento Aprovado',
  rejected: 'Documento Rejeitado'
} as const;
