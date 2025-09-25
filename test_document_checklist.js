// Teste da funcionalidade de mapeamento de documentos entregues
// Este arquivo simula a execução da função processDocumentChecklistFields

// Dados de exemplo baseados no JSON fornecido pelo usuário (incluindo os novos documentos)
const mockDocumentChecklistData = {
  items: [
    {
      "id": "temp_0_1758811259641",
      "category": "personal",
      "admin_notes": "Documento aprovado",
      "is_required": true,
      "delivered_at": "2025-09-25T15:16:58.836Z",
      "is_delivered": true,
      "document_name": "RG (Carteira de Identidade)",
      "document_type": "rg",
      "approved_by_admin": true,
      "required_for_enrollment": true
    },
    {
      "id": "temp_1_1758811259641",
      "category": "personal",
      "admin_notes": "Documento aprovado",
      "is_required": true,
      "delivered_at": "2025-09-25T15:17:54.667Z",
      "is_delivered": true,
      "document_name": "CPF",
      "document_type": "cpf",
      "approved_by_admin": true,
      "required_for_enrollment": true
    },
    {
      "id": "temp_2_1758811259641",
      "category": "personal",
      "admin_notes": "Documento aprovado",
      "is_required": true,
      "delivered_at": "2025-09-25T15:17:56.601Z",
      "is_delivered": true,
      "document_name": "Certidão de Nascimento ou Casamento",
      "document_type": "certidao_nascimento_casamento",
      "approved_by_admin": true,
      "required_for_enrollment": true
    },
    {
      "id": "temp_3_1758811259641",
      "category": "personal",
      "admin_notes": "Documento aprovado",
      "is_required": true,
      "delivered_at": "2025-09-25T15:18:00.051Z",
      "is_delivered": true,
      "document_name": "Foto 3x4",
      "document_type": "foto_3x4",
      "approved_by_admin": true,
      "required_for_enrollment": true
    },
    {
      "id": "temp_4_1758811259641",
      "category": "schooling",
      "admin_notes": "Documento aprovado",
      "is_required": true,
      "delivered_at": "2025-09-25T15:18:16.069Z",
      "is_delivered": true,
      "document_name": "Histórico Escolar - Ensino Fundamental",
      "document_type": "historico_escolar_fundamental",
      "approved_by_admin": true,
      "required_for_enrollment": true
    },
    {
      "id": "temp_5_1758811259641",
      "category": "schooling",
      "admin_notes": "Documento aprovado",
      "is_required": false,
      "delivered_at": "2025-09-25T15:19:05.236Z",
      "is_delivered": true,
      "document_name": "Histórico Escolar - Ensino Médio (se aplicável)",
      "document_type": "historico_escolar_medio",
      "approved_by_admin": true,
      "required_for_enrollment": false
    },
    {
      "id": "temp_6_1758811259641",
      "category": "address",
      "admin_notes": "Documento aprovado",
      "is_required": true,
      "delivered_at": "2025-09-25T15:19:23.494Z",
      "is_delivered": true,
      "document_name": "Comprovante de Residência",
      "document_type": "comprovante_residencia",
      "approved_by_admin": true,
      "required_for_enrollment": true
    },
    {
      "id": "temp_7_1758811259641",
      "category": "other",
      "is_required": false,
      "is_delivered": false,
      "document_name": "Título de Eleitor",
      "document_type": "tit_eleitor",
      "approved_by_admin": false,
      "required_for_enrollment": false
    },
    {
      "id": "temp_8_1758811259641",
      "category": "other",
      "is_required": false,
      "is_delivered": false,
      "document_name": "Carteira de Vacinação COVID",
      "document_type": "carteira_vacinacao_covid",
      "approved_by_admin": false,
      "required_for_enrollment": false
    },
    {
      "id": "temp_9_1758811259641",
      "category": "schooling",
      "admin_notes": "Documento aprovado",
      "is_required": false,
      "delivered_at": "2025-09-25T15:19:10.837Z",
      "is_delivered": true,
      "document_name": "Atestado de Eliminação de Disciplina (se aplicável)",
      "document_type": "atestado_eliminacao_disciplina",
      "approved_by_admin": true,
      "required_for_enrollment": false
    },
    {
      "id": "temp_10_1758811259641",
      "category": "schooling",
      "admin_notes": "Documento aprovado",
      "is_required": false,
      "delivered_at": "2025-09-25T15:19:13.309Z",
      "is_delivered": true,
      "document_name": "Declaração de Transferência (se aplicável)",
      "document_type": "declaracao_transferencia",
      "approved_by_admin": true,
      "required_for_enrollment": false
    },
    {
      "id": "temp_11_1758811259641",
      "category": "other",
      "admin_notes": "Aprovado em lote",
      "is_required": false,
      "delivered_at": "2025-09-25T15:18:18.531Z",
      "is_delivered": true,
      "document_name": "Outros Documentos",
      "document_type": "outros",
      "approved_by_admin": true,
      "required_for_enrollment": false
    },
    // NOVOS DOCUMENTOS ADICIONADOS
    {
      "id": "temp_12_1758811259641",
      "category": "schooling",
      "admin_notes": "Documento de dispensa aprovado",
      "is_required": false,
      "delivered_at": "2025-09-25T15:20:00.000Z",
      "is_delivered": true,
      "document_name": "Requerimento de Dispensa de Educação Física",
      "document_type": "requerimento_dispensa_educacao_fisica",
      "approved_by_admin": true,
      "required_for_enrollment": false
    },
    {
      "id": "temp_13_1758811259641",
      "category": "other",
      "admin_notes": "Documento militar obrigatório",
      "is_required": false,
      "delivered_at": "2025-09-25T15:21:00.000Z",
      "is_delivered": true,
      "document_name": "Reservista",
      "document_type": "reservista",
      "approved_by_admin": true,
      "required_for_enrollment": false
    }
  ]
};

// Mapeamento de células (copiado da implementação - incluindo os novos documentos)
const documentChecklistCellMapping = {
  'rg': 'A40',                                    // RG (Carteira de Identidade)
  'cpf': 'A41',                                   // CPF
  'certidao_nascimento_casamento': 'I40',         // Certidão de Nascimento ou Casamento
  'foto_3x4': 'A42',                              // Foto 3x4
  'historico_escolar_fundamental': 'D40',         // Histórico Escolar - Ensino Fundamental
  'historico_escolar_medio': 'D41',               // Histórico Escolar - Ensino Médio
  'comprovante_residencia': 'D42',                // Comprovante de Residência
  'tit_eleitor': 'I42',                           // Título de Eleitor
  'carteira_vacinacao_covid': 'M40',              // Carteira de Vacinação COVID
  'atestado_eliminacao_disciplina': 'M41',        // Atestado de Eliminação de Disciplina
  'reservista': 'I41',                            // Reservista
  'requerimento_dispensa_educacao_fisica': 'A43', // Requerimento de Dispensa de Educação Física
  'declaracao_transferencia': 'M42',              // Declaração de Transferência
  'outros': 'D43'                                 // Outros Documentos
};

// Simulação da função processDocumentChecklistFields
function processDocumentChecklistFields(documentChecklistData) {
  console.log('🔍 [DocumentChecklistProcessor] Processando documentos entregues...');

  // Verifica se os dados da checklist existem
  if (!documentChecklistData) {
    console.log('⚠️ [DocumentChecklistProcessor] Dados da checklist de documentos não encontrados');
    return;
  }

  // Verifica se a coluna 'items' existe e contém dados
  if (!documentChecklistData.items || !Array.isArray(documentChecklistData.items)) {
    console.log('⚠️ [DocumentChecklistProcessor] Items da checklist não encontrados ou inválidos');
    return;
  }

  console.log(`📋 [DocumentChecklistProcessor] Processando ${documentChecklistData.items.length} documentos...`);

  const results = [];

  // Itera sobre cada documento na checklist
  documentChecklistData.items.forEach((item, index) => {
    try {
      const documentType = item.document_type;
      const isDelivered = item.is_delivered;
      const documentName = item.document_name;

      console.log(`🔍 [DocumentChecklistProcessor] Processando documento ${index + 1}:`, {
        documentType,
        documentName,
        isDelivered,
        approvedByAdmin: item.approved_by_admin
      });

      // Busca a célula correspondente no mapeamento
      const targetCell = documentChecklistCellMapping[documentType];

      if (!targetCell) {
        console.log(`⚠️ [DocumentChecklistProcessor] Tipo de documento não encontrado no mapeamento: ${documentType}`);
        console.log('📋 [DocumentChecklistProcessor] Tipos disponíveis:', Object.keys(documentChecklistCellMapping));
        return;
      }

      // Verifica se o documento foi entregue
      if (isDelivered === true) {
        // Preenche a célula com "( x )" para documentos entregues
        const value = '( x )';
        results.push({
          documentType,
          documentName,
          cell: targetCell,
          value: value,
          status: 'ENTREGUE'
        });
        console.log(`✅ [DocumentChecklistProcessor] Documento entregue marcado:`, {
          documentType,
          documentName,
          cell: targetCell,
          value: value
        });
      } else {
        // Para documentos não entregues, marca "(  )" (espaço em branco)
        const value = '(  )';
        results.push({
          documentType,
          documentName,
          cell: targetCell,
          value: value,
          status: 'NÃO_ENTREGUE'
        });
        console.log(`⚠️ [DocumentChecklistProcessor] Documento não entregue:`, {
          documentType,
          documentName,
          cell: targetCell,
          value: value
        });
      }
    } catch (error) {
      console.error(`❌ [DocumentChecklistProcessor] Erro ao processar documento ${index + 1}:`, error);
    }
  });

  console.log('✅ [DocumentChecklistProcessor] Processamento de documentos concluído.');
  return results;
}

// Executa o teste
console.log('🚀 Iniciando teste da funcionalidade de mapeamento de documentos...\n');

const results = processDocumentChecklistFields(mockDocumentChecklistData);

console.log('\n📊 RESUMO DOS RESULTADOS:');
console.log('=====================================');

if (results && results.length > 0) {
  console.log(`\n✅ Processados ${results.length} documentos com sucesso!\n`);

  // Agrupa por status
  const delivered = results.filter(r => r.status === 'ENTREGUE');
  const notDelivered = results.filter(r => r.status === 'NÃO_ENTREGUE');

  console.log(`📋 DOCUMENTOS ENTREGUES (${delivered.length}):`);
  delivered.forEach(doc => {
    console.log(`  ${doc.cell}: ${doc.documentName} → "${doc.value}"`);
  });

  console.log(`\n📋 DOCUMENTOS NÃO ENTREGUES (${notDelivered.length}):`);
  notDelivered.forEach(doc => {
    console.log(`  ${doc.cell}: ${doc.documentName} → "${doc.value}"`);
  });

  console.log('\n🎯 MAPEAMENTO DE CÉLULAS:');
  console.log('=====================================');
  Object.entries(documentChecklistCellMapping).forEach(([type, cell]) => {
    const doc = results.find(r => r.documentType === type);
    if (doc) {
      console.log(`${cell}: ${doc.documentName} → ${doc.value}`);
    }
  });
} else {
  console.log('❌ Nenhum documento foi processado!');
}

console.log('\n✅ Teste concluído!');