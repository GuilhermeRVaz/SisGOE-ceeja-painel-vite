// =====================================================================
// TIPOS DE DOCUMENTOS
// =====================================================================

export interface DocumentExtraction {
  id: string;
  file_name: string;
  storage_path: string;
  document_type: string;
  status: string;
  enrollment_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentViewerControls {
  zoom: {
    value: number;
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
  };
  rotation: {
    value: number;
    rotate: () => void;
    reset: () => void;
  };
}

export interface DocumentViewerState {
  documentUrl: string;
  controls: DocumentViewerControls;
  loading: boolean;
  error: string | null;
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'rg_frente': 'RG - Frente',
  'rg_verso': 'RG - Verso',
  'cpf': 'CPF',
  'certidao_nascimento_casamento': 'Certidão de Nascimento/Casamento',
  'comprovante_residencia': 'Comprovante de Residência',
  'historico_medio': 'Histórico Escolar - Ensino Médio',
  'historico_medio_verso': 'Histórico Escolar - Verso',
  'historico_fundamental': 'Histórico Escolar - Ensino Fundamental',
  'declaracao_escolaridade': 'Declaração de Escolaridade',
  'outros': 'Outros Documentos'
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  'pending': 'Pendente',
  'processing': 'Processando',
  'completed': 'Concluído',
  'error': 'Erro'
};
