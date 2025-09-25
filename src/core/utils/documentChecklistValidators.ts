// ARQUIVO: src/core/utils/documentChecklistValidators.ts
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

interface StudentDocumentChecklist {
  id: string;
  student_id: string;
  enrollment_id?: string;
  items: DocumentChecklistItem[];
  status: any;
  created_at: string;
  updated_at: string;
  last_reviewed_by?: string;
  last_reviewed_at?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DocumentValidationContext {
  studentId: string;
  enrollmentId?: string;
  userRole?: string;
  userId?: string;
}

/**
 * Valida um item individual do checklist de documentos
 */
export const validateDocumentChecklistItem = (
  item: DocumentChecklistItem,
  context: DocumentValidationContext
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações obrigatórias
  if (!item.document_type || item.document_type.trim() === '') {
    errors.push('Tipo do documento é obrigatório');
  }

  if (!item.document_name || item.document_name.trim() === '') {
    errors.push('Nome do documento é obrigatório');
  }

  if (item.is_required && item.is_delivered && !item.delivered_at) {
    warnings.push('Documento obrigatório entregue mas sem data de entrega registrada');
  }

  if (item.is_delivered && item.approved_by_admin && !item.admin_notes) {
    warnings.push('Documento aprovado sem observações do administrador');
  }

  if (!item.is_delivered && item.approved_by_admin) {
    errors.push('Documento não pode estar aprovado sem estar entregue');
  }

  // Validações de categoria
  const validCategories = ['personal', 'address', 'schooling', 'other'];
  if (!validCategories.includes(item.category)) {
    errors.push('Categoria do documento inválida');
  }

  // Validações específicas por categoria
  switch (item.category) {
    case 'personal':
      if (item.document_type === 'rg' && !item.is_required) {
        warnings.push('RG é tipicamente um documento obrigatório');
      }
      if (item.document_type === 'cpf' && !item.is_required) {
        warnings.push('CPF é tipicamente um documento obrigatório');
      }
      break;

    case 'schooling':
      if (item.document_type === 'historico_escolar_fundamental' && !item.is_required) {
        warnings.push('Histórico escolar fundamental é tipicamente obrigatório');
      }
      break;

    case 'address':
      if (item.document_type === 'comprovante_residencia' && !item.is_required) {
        warnings.push('Comprovante de residência é tipicamente obrigatório');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Valida o checklist completo
 */
export const validateDocumentChecklist = (
  checklist: StudentDocumentChecklist,
  context: DocumentValidationContext
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações do checklist
  if (!checklist.student_id) {
    errors.push('ID do estudante é obrigatório');
  }

  if (!checklist.items || !Array.isArray(checklist.items)) {
    errors.push('Lista de documentos é obrigatória');
  }

  if (checklist.items.length === 0) {
    warnings.push('Nenhum documento no checklist');
  }

  // Valida cada item
  checklist.items.forEach((item, index) => {
    const itemValidation = validateDocumentChecklistItem(item, context);

    if (!itemValidation.isValid) {
      errors.push(`Documento ${index + 1}: ${itemValidation.errors.join(', ')}`);
    }

    warnings.push(...itemValidation.warnings.map(w => `Documento ${index + 1}: ${w}`));
  });

  // Validações de consistência
  const requiredItems = checklist.items.filter(item => item.is_required);
  const deliveredItems = checklist.items.filter(item => item.is_delivered);
  const approvedItems = checklist.items.filter(item => item.approved_by_admin);

  if (requiredItems.length === 0) {
    warnings.push('Nenhum documento obrigatório definido');
  }

  if (approvedItems.length > deliveredItems.length) {
    errors.push('Não pode haver mais documentos aprovados que entregues');
  }

  // Valida status calculado
  const calculatedStatus = calculateStatusFromItems(checklist.items);
  if (JSON.stringify(calculatedStatus) !== JSON.stringify(checklist.status)) {
    warnings.push('Status do checklist pode estar desatualizado');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Calcula o status a partir dos itens (função auxiliar)
 */
const calculateStatusFromItems = (items: DocumentChecklistItem[]) => {
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
};

/**
 * Valida se o usuário tem permissão para realizar uma operação
 */
export const validateUserPermissions = (
  operation: 'create' | 'read' | 'update' | 'delete' | 'approve',
  context: DocumentValidationContext
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (operation) {
    case 'create':
      if (!context.studentId) {
        errors.push('ID do estudante é obrigatório para criar checklist');
      }
      break;

    case 'approve':
      if (context.userRole !== 'admin' && context.userRole !== 'super_admin') {
        errors.push('Apenas administradores podem aprovar documentos');
      }
      break;

    case 'update':
    case 'delete':
      if (!context.userRole || !['admin', 'super_admin'].includes(context.userRole)) {
        errors.push('Apenas administradores podem modificar checklist');
      }
      break;

    case 'read':
      // Leitura é geralmente permitida, mas pode ter validações específicas
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Valida dados antes de enviar para o backend
 */
export const validateBeforeSubmit = (
  checklist: Partial<StudentDocumentChecklist>,
  context: DocumentValidationContext
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações básicas
  if (!checklist.student_id) {
    errors.push('ID do estudante é obrigatório');
  }

  if (!checklist.items || checklist.items.length === 0) {
    errors.push('Pelo menos um documento deve estar presente');
  }

  // Valida permissões
  const permissionValidation = validateUserPermissions('update', context);
  if (!permissionValidation.isValid) {
    errors.push(...permissionValidation.errors);
  }

  warnings.push(...permissionValidation.warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Sanitiza dados do checklist para envio
 */
export const sanitizeChecklistData = (checklist: StudentDocumentChecklist): StudentDocumentChecklist => {
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