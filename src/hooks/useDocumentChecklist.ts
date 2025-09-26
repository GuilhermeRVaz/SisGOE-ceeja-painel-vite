// ARQUIVO: src/hooks/useDocumentChecklist.ts
import { useState, useEffect, useCallback } from 'react';
import { useDataProvider, useNotify } from 'react-admin';

// Tipos inline para evitar problemas de import
interface DocumentChecklistItem {
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

interface DocumentChecklistStatus {
  total_required: number;
  total_delivered: number;
  total_approved: number;
  is_complete: boolean;
  missing_documents: DocumentChecklistItem[];
  pending_approval: DocumentChecklistItem[];
  approved_documents: DocumentChecklistItem[];
}

interface StudentDocumentChecklist {
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

const DEFAULT_REQUIRED_DOCUMENTS: Omit<DocumentChecklistItem, 'id' | 'delivered_at'>[] = [
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
    document_type: 'outros',
    document_name: 'Outros Documentos',
    is_required: false,
    is_delivered: false,
    required_for_enrollment: false,
    category: 'other',
    approved_by_admin: false
  },
  {
    document_type: 'requerimento_dispensa_educacao_fisica',
    document_name: 'Requerimento de Dispensa de Educação Física',
    is_required: false,
    is_delivered: false,
    required_for_enrollment: false,
    category: 'other',
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
  }
];

// Funções de validação inline
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const validateBeforeSubmit = (
  checklist: Partial<StudentDocumentChecklist>,
  context: { studentId: string }
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!context.studentId) {
    errors.push('ID do estudante é obrigatório');
  }

  if (!checklist.items || checklist.items.length === 0) {
    errors.push('Pelo menos um documento deve estar presente');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const sanitizeChecklistData = (checklist: StudentDocumentChecklist): StudentDocumentChecklist => {
  return {
    ...checklist,
    items: checklist.items.map(item => ({
      ...item,
      document_type: item.document_type?.trim() || '',
      document_name: item.document_name?.trim() || '',
      admin_notes: item.admin_notes?.trim() || undefined
    })),
    updated_at: new Date().toISOString()
  };
};

// Função para normalizar document_type (remove espaços, converte para minúsculo, substitui espaços por underscore)
const normalizeDocumentType = (documentType: string): string => {
  return documentType?.trim().toLowerCase().replace(/\s+/g, '_') || '';
};

interface UseDocumentChecklistReturn {
    checklist: StudentDocumentChecklist | null;
    loading: boolean;
    error: string | null;
    updateDocumentStatus: (documentType: string, isDelivered: boolean, approvedByAdmin?: boolean, adminNotes?: string) => Promise<void>;
    approveDocument: (documentType: string, adminNotes?: string) => Promise<void>;
    rejectDocument: (documentType: string, adminNotes?: string) => Promise<void>;
    approveAllPending: () => Promise<void>;
    refreshChecklist: () => Promise<void>;
    createInitialChecklist: () => Promise<void>;
    calculateStatus: (items: DocumentChecklistItem[]) => DocumentChecklistStatus;
}

export const useDocumentChecklist = (studentId: string | null): UseDocumentChecklistReturn => {
    const [checklist, setChecklist] = useState<StudentDocumentChecklist | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dataProvider = useDataProvider();
    const notify = useNotify();

    // Função para calcular o status do checklist
    const calculateStatus = useCallback((items: DocumentChecklistItem[]): DocumentChecklistStatus => {
        const requiredItems = items.filter(item => item.is_required);
        const deliveredItems = items.filter(item => item.is_delivered);
        const approvedItems = items.filter(item => item.approved_by_admin);

        const missingDocuments = items.filter(item =>
            item.is_required && !item.is_delivered
        );

        const pendingApproval = items.filter(item =>
            item.is_delivered && !item.approved_by_admin
        );

        const approvedDocuments = items.filter(item =>
            item.is_delivered && item.approved_by_admin
        );

        return {
            total_required: requiredItems.length,
            total_delivered: deliveredItems.length,
            total_approved: approvedItems.length,
            is_complete: missingDocuments.length === 0 && pendingApproval.length === 0,
            missing_documents: missingDocuments,
            pending_approval: pendingApproval,
            approved_documents: approvedDocuments
        };
    }, []);

    // Função para buscar o checklist do estudante
    const fetchChecklist = useCallback(async () => {
        if (!studentId) {
            setChecklist(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('🔍 Buscando checklist para estudante:', studentId);
            const { data, error } = await dataProvider.getList('student_document_checklist', {
                filter: { student_id: studentId },
                pagination: { page: 1, perPage: 1 },
                sort: { field: 'updated_at', order: 'DESC' }
            });

            if (error) {
                console.error('❌ Erro na busca:', error);
                throw error;
            }

            if (data && data.length > 0) {
                console.log('✅ Checklist encontrado:', data[0]);
                setChecklist(data[0]);
            } else {
                console.log('⚠️ Nenhum checklist encontrado para estudante:', studentId);
                setChecklist(null);
            }
        } catch (err: any) {
            console.error('❌ Erro ao buscar checklist:', err);
            setError(err.message || 'Erro ao buscar checklist de documentos');
            notify(`Erro: ${err.message}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [studentId, dataProvider, notify]);

    // Função para criar checklist inicial
    const createInitialChecklist = useCallback(async () => {
        if (!studentId) return;

        try {
            // Buscar enrollment_id do estudante
            const { data: studentData } = await dataProvider.getList('students', {
                filter: { id: studentId },
                pagination: { page: 1, perPage: 1 }
            });

            if (!studentData || studentData.length === 0) {
                throw new Error('Dados do estudante não encontrados');
            }

            const enrollmentId = studentData[0].enrollment_id;

            // Buscar templates ativos do backend (fonte canônica)
            console.log('🔍 Buscando templates do backend para criar checklist...');
            const { data: templates, error: templatesError } = await dataProvider.getList('document_templates', {
                filter: { is_active: true },
                pagination: { page: 1, perPage: 100 },
                sort: { field: 'document_type', order: 'ASC' }
            });

            if (templatesError) {
                console.error('❌ Erro ao buscar templates:', templatesError);
                throw new Error(`Erro ao buscar templates: ${templatesError.message}`);
            }

            if (!templates || templates.length === 0) {
                console.warn('⚠️ Nenhum template encontrado, usando lista local como fallback');
                // Fallback para DEFAULT_REQUIRED_DOCUMENTS se não houver templates
                const initialItems = DEFAULT_REQUIRED_DOCUMENTS.map((doc, index) => ({
                    id: `temp_${index}_${Date.now()}`,
                    ...doc
                }));
                const status = calculateStatus(initialItems);

                const newChecklist: Omit<StudentDocumentChecklist, 'id'> = {
                    student_id: studentId,
                    enrollment_id: enrollmentId,
                    items: initialItems,
                    status_summary: status,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const { data, error } = await dataProvider.create('student_document_checklist', {
                    data: newChecklist
                });

                if (error) {
                    if (error.message && error.message.includes('duplicate key')) {
                        console.log('🔄 Checklist já existe, buscando existente...');
                        await fetchChecklist();
                        return;
                    }
                    throw error;
                }

                setChecklist(data);
                notify('Checklist de documentos criado com sucesso (fallback local)', { type: 'success' });
                return;
            }

            console.log(`✅ Encontrados ${templates.length} templates ativos`);

            // Criar checklist inicial com templates do backend
            const initialItems = templates.map((template: any, index: number) => ({
                id: `temp_${index}_${Date.now()}`,
                document_type: template.document_type,
                document_name: template.document_name,
                is_required: template.is_required,
                is_delivered: false,
                required_for_enrollment: template.required_for_enrollment,
                category: template.category,
                approved_by_admin: false
            }));

            const status = calculateStatus(initialItems);

            const newChecklist: Omit<StudentDocumentChecklist, 'id'> = {
                student_id: studentId,
                enrollment_id: enrollmentId,
                items: initialItems,
                status_summary: status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            console.log('🔍 Tentando criar checklist para estudante:', studentId);

            const { data, error } = await dataProvider.create('student_document_checklist', {
                data: newChecklist
            });

            if (error) {
                console.error('❌ Erro ao criar checklist:', error);
                // Se é erro de duplicata, buscar o checklist existente
                if (error.message && error.message.includes('duplicate key')) {
                    console.log('🔄 Checklist já existe, buscando existente...');
                    await fetchChecklist();
                    return;
                }
                throw error;
            }

            console.log('✅ Checklist criado com sucesso:', data);
            setChecklist(data);
            notify('Checklist de documentos criado com sucesso', { type: 'success' });

        } catch (err: any) {
            console.error('❌ Erro ao criar checklist inicial:', err);
            setError(err.message || 'Erro ao criar checklist inicial');
            notify(`Erro: ${err.message}`, { type: 'error' });
        }
    }, [studentId, dataProvider, notify, calculateStatus, fetchChecklist]);

    // Função para atualizar status de um documento
    const updateDocumentStatus = useCallback(async (
        documentType: string,
        isDelivered: boolean,
        approvedByAdmin?: boolean,
        adminNotes?: string
    ) => {
        if (!checklist) {
            setError('Checklist não encontrado');
            notify('Checklist não encontrado', { type: 'error' });
            return;
        }

        try {
            // Validação antes de atualizar
            const validation = validateBeforeSubmit(
                { items: checklist.items },
                { studentId: studentId || checklist.student_id }
            );

            if (!validation.isValid) {
                setError(validation.errors.join(', '));
                notify(`Erros de validação: ${validation.errors.join(', ')}`, { type: 'error' });
                return;
            }

            // Normalizar o documentType para comparação
            const normalizedDocumentType = normalizeDocumentType(documentType);

            const updatedItems = checklist.items.map(item => {
                // Normalizar o document_type do item para comparação
                const normalizedItemType = normalizeDocumentType(item.document_type);

                if (normalizedItemType === normalizedDocumentType) {
                    const now = new Date().toISOString();
                    return {
                        ...item,
                        is_delivered: isDelivered,
                        delivered_at: isDelivered ? now : undefined,
                        approved_by_admin: approvedByAdmin ?? item.approved_by_admin,
                        admin_notes: adminNotes ?? item.admin_notes
                    };
                }
                return item;
            });

            const updatedStatus = calculateStatus(updatedItems);

            const updatedChecklist: StudentDocumentChecklist = {
                ...checklist,
                items: updatedItems,
                status_summary: updatedStatus,
                updated_at: new Date().toISOString()
            };

            // Sanitizar dados antes de enviar
            const sanitizedChecklist = sanitizeChecklistData(updatedChecklist);

            const { data, error } = await dataProvider.update('student_document_checklist', {
                id: checklist.id,
                data: sanitizedChecklist,
                previousData: checklist
            });

            if (error) {
                console.error('Erro ao atualizar checklist:', error);
                throw new Error(error.message || 'Erro ao atualizar checklist');
            }

            setChecklist(data);
            notify(
                `Documento ${isDelivered ? 'marcado como entregue' : 'marcado como pendente'}`,
                { type: 'success' }
            );

            // Mostrar avisos se houver
            if (validation.warnings.length > 0) {
                notify(`Avisos: ${validation.warnings.join(', ')}`, { type: 'warning' });
            }

        } catch (err: any) {
            console.error('Erro ao atualizar status do documento:', err);
            const errorMessage = err.message || 'Erro ao atualizar status do documento';
            setError(errorMessage);
            notify(`Erro: ${errorMessage}`, { type: 'error' });
        }
    }, [checklist, dataProvider, notify, calculateStatus]);

    // Função para aprovar documento
    const approveDocument = useCallback(async (documentType: string, adminNotes?: string) => {
        const normalizedDocumentType = normalizeDocumentType(documentType);
        await updateDocumentStatus(normalizedDocumentType, true, true, adminNotes || 'Documento aprovado');
    }, [updateDocumentStatus]);

    // Função para rejeitar documento
    const rejectDocument = useCallback(async (documentType: string, adminNotes?: string) => {
        const normalizedDocumentType = normalizeDocumentType(documentType);
        await updateDocumentStatus(normalizedDocumentType, true, false, adminNotes || 'Documento rejeitado - verificar');
    }, [updateDocumentStatus]);

    // Função para aprovar todos os documentos pendentes
    const approveAllPending = useCallback(async () => {
        if (!checklist) return;

        const pendingDocuments = checklist.items.filter(item =>
            item.is_delivered && !item.approved_by_admin
        );

        for (const doc of pendingDocuments) {
            await approveDocument(doc.document_type, 'Aprovado em lote');
        }
    }, [checklist, approveDocument]);

    // Função para atualizar o checklist
    const refreshChecklist = useCallback(async () => {
        await fetchChecklist();
    }, [fetchChecklist]);

    // Buscar checklist quando o studentId mudar
    useEffect(() => {
        fetchChecklist();
    }, [fetchChecklist]);

    return {
        checklist,
        loading,
        error,
        updateDocumentStatus,
        approveDocument,
        rejectDocument,
        approveAllPending,
        refreshChecklist,
        createInitialChecklist,
        calculateStatus
    };
};