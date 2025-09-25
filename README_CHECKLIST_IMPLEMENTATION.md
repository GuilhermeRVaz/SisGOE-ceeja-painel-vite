# Implementação do Checklist de Documentos - SisGOE

## Visão Geral

Este documento descreve a implementação completa do sistema de checklist de documentos para o SisGOE (Sistema de Gestão de Oportunidades Educacionais). O sistema permite o rastreamento robusto da entrega de documentos pelos estudantes, com interface visual intuitiva e integração completa com o backend Supabase.

## Funcionalidades Implementadas

### ✅ Frontend Components
- **PainelChecklist**: Componente React principal com interface visual completa
- **Interface Responsiva**: Design adaptável com accordion por categorias
- **Status Visual**: Indicadores visuais para documentos pendentes, entregues e aprovados
- **Caixas de Status**: "Documento OK" e "Deve Documentos" com lógica dinâmica
- **Observações**: Sistema de notas administrativas para cada documento

### ✅ Backend Integration
- **Supabase Functions**: API RESTful para operações CRUD seguras
- **Row Level Security**: Políticas de segurança implementadas
- **Histórico de Mudanças**: Rastreamento completo de todas as modificações
- **Templates de Documentos**: Sistema flexível para documentos obrigatórios

### ✅ Database Schema
- **Tabela `student_document_checklist`**: Armazenamento principal dos checklists
- **Tabela `student_document_checklist_history`**: Histórico de mudanças
- **Tabela `document_templates`**: Templates configuráveis de documentos
- **Relações**: Integração com tabelas existentes (students, enrollments)

### ✅ Business Logic
- **Validações Robusta**: Validação de dados e permissões
- **Status Dinâmico**: Cálculo automático do status do checklist
- **Categorização**: Documentos organizados por categoria (Pessoal, Endereço, Escolar, Outros)
- **Permissões**: Controle de acesso baseado em roles de usuário

## Arquivos Criados/Modificados

### Novos Arquivos
```
src/types/documents.ts                           # Tipos TypeScript para o sistema
src/hooks/useDocumentChecklist.ts                # Hook React para gerenciamento de estado
src/components/panels/PainelChecklist/PainelChecklist.tsx  # Componente principal
src/core/utils/documentChecklistValidators.ts    # Utilitários de validação
supabase/migrations/001_create_document_checklist_tables.sql  # Schema do banco
supabase/functions/document-checklist-crud/index.ts  # API Backend
supabase/functions/document-checklist-crud/deno.json  # Configuração
README_CHECKLIST_IMPLEMENTATION.md               # Esta documentação
```

### Arquivos Modificados
```
src/components/cockpit/CockpitLayout.tsx         # Integração no layout do cockpit
```

## Como Usar

### 1. Para Administradores

1. **Acesse um estudante** através do React Admin
2. **Navegue para o painel Checklist** (terceiro painel)
3. **Marque documentos como entregues** usando os checkboxes
4. **Aprove documentos** marcando-os como aprovados
5. **Adicione observações** clicando no ícone de nota
6. **Monitore o status** através das caixas "Documento OK" e "Deve Documentos"

### 2. Para Desenvolvedores

#### Inicializar Checklist para um Estudante
```typescript
import { useDocumentChecklist } from './hooks/useDocumentChecklist';

const MyComponent = ({ studentId }: { studentId: string }) => {
  const { checklist, updateDocumentStatus, createInitialChecklist } = useDocumentChecklist(studentId);

  // Criar checklist inicial se não existir
  useEffect(() => {
    if (!checklist) {
      createInitialChecklist();
    }
  }, [checklist, createInitialChecklist]);

  // Marcar documento como entregue
  const handleDocumentDelivered = (documentType: string) => {
    updateDocumentStatus(documentType, true);
  };

  return (
    // Seu componente JSX
  );
};
```

#### Validações
```typescript
import { validateDocumentChecklist, validateBeforeSubmit } from './core/utils/documentChecklistValidators';

const validation = validateDocumentChecklist(checklist, { studentId });
if (!validation.isValid) {
  console.error('Erros de validação:', validation.errors);
}
```

## Configuração do Banco de Dados

### 1. Executar Migration
```sql
-- Execute o arquivo supabase/migrations/001_create_document_checklist_tables.sql
-- no seu banco Supabase
```

### 2. Configurar Templates de Documentos
Os documentos obrigatórios já estão pré-configurados na migration, mas podem ser modificados:

```sql
UPDATE document_templates
SET is_required = true, required_for_enrollment = true
WHERE document_type = 'rg';
```

### 3. Verificar Permissões
As políticas RLS já estão configuradas, mas verifique se os usuários têm as roles corretas:

```sql
-- Verificar roles dos usuários
SELECT user_id, role FROM profiles WHERE role IN ('admin', 'super_admin');
```

## API Endpoints

### Base URL
```
https://your-project.supabase.co/functions/v1/document-checklist-crud
```

### Endpoints Disponíveis

#### GET /?student_id={id}
Buscar checklist de um estudante
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://your-project.supabase.co/functions/v1/document-checklist-crud?student_id=123"
```

#### POST /?student_id={id}
Criar novo checklist
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     "https://your-project.supabase.co/functions/v1/document-checklist-crud?student_id=123"
```

#### PUT /?student_id={id}
Atualizar checklist completo
```bash
curl -X PUT \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"items": [...]}' \
     "https://your-project.supabase.co/functions/v1/document-checklist-crud?student_id=123"
```

#### PATCH /?student_id={id}
Atualizar status de documento específico
```bash
curl -X PATCH \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"document_type": "rg", "is_delivered": true}' \
     "https://your-project.supabase.co/functions/v1/document-checklist-crud?student_id=123"
```

## Status do Sistema

### ✅ Funcionalidades Completas
- [x] Interface visual responsiva
- [x] Integração com React Admin
- [x] Persistência no Supabase
- [x] Validações de dados
- [x] Controle de permissões
- [x] Histórico de mudanças
- [x] Templates configuráveis
- [x] Status dinâmico
- [x] Observações administrativas

### 🔄 Funcionalidades em Desenvolvimento
- [ ] Integração com sistema FICHA
- [ ] Notificações por email
- [ ] Relatórios avançados
- [ ] Bulk operations
- [ ] Import/Export de dados

### 📋 Próximas Funcionalidades
- [ ] Dashboard administrativo
- [ ] Analytics de documentos
- [ ] Workflow de aprovação
- [ ] Integração com OCR
- [ ] Mobile app support

## Troubleshooting

### Problemas Comuns

#### 1. Checklist não aparece
**Causa**: Tabela não foi criada ou estudante não existe
**Solução**:
```sql
-- Verificar se tabela existe
SELECT table_name FROM information_schema.tables
WHERE table_name = 'student_document_checklist';

-- Verificar se estudante existe
SELECT id FROM students WHERE id = 'your_student_id';
```

#### 2. Erro de permissões
**Causa**: Usuário sem role de admin
**Solução**:
```sql
-- Verificar role do usuário
SELECT role FROM profiles WHERE user_id = 'user_id';

-- Atualizar role se necessário
UPDATE profiles SET role = 'admin' WHERE user_id = 'user_id';
```

#### 3. Documentos não salvam
**Causa**: Problema na Supabase Function
**Solução**:
- Verificar logs da função no Supabase Dashboard
- Testar função localmente
- Verificar variáveis de ambiente

### Debug

#### Verificar Checklist no Banco
```sql
SELECT * FROM student_document_checklist WHERE student_id = 'your_id';
```

#### Verificar Histórico
```sql
SELECT * FROM student_document_checklist_history
WHERE student_id = 'your_id' ORDER BY created_at DESC;
```

#### Verificar Templates
```sql
SELECT * FROM document_templates WHERE is_active = true;
```

## Manutenção

### Adicionar Novo Tipo de Documento
1. Inserir no banco:
```sql
INSERT INTO document_templates (document_type, document_name, is_required, category)
VALUES ('novo_documento', 'Nome do Documento', false, 'other');
```

2. Atualizar tipos TypeScript se necessário
3. Atualizar constantes em `src/types/documents.ts`

### Modificar Documentos Obrigatórios
```sql
UPDATE document_templates
SET is_required = true, required_for_enrollment = true
WHERE document_type = 'documento_existente';
```

### Backup e Recovery
```sql
-- Backup do checklist
CREATE TABLE backup_student_document_checklist AS
SELECT * FROM student_document_checklist;

-- Recovery
INSERT INTO student_document_checklist
SELECT * FROM backup_student_document_checklist;
```

## Performance

### Índices Otimizados
- `idx_student_document_checklist_student_id`
- `idx_student_document_checklist_enrollment_id`
- `idx_document_templates_category`
- `idx_document_templates_active`

### Recomendações
- Manter no máximo 50 documentos por checklist
- Usar paginação para listas grandes
- Implementar cache se necessário
- Monitorar queries lentas no Supabase Dashboard

## Segurança

### Políticas RLS Implementadas
- ✅ Usuários só podem ver seus próprios checklists
- ✅ Apenas admins podem modificar checklists
- ✅ Apenas admins podem aprovar documentos
- ✅ Histórico de mudanças é auditável
- ✅ Sanitização de dados implementada

### Recomendações de Segurança
- Usar HTTPS em produção
- Rotacionar service role key regularmente
- Monitorar tentativas de acesso não autorizado
- Implementar rate limiting se necessário

---

## Conclusão

A implementação do checklist de documentos está completa e pronta para uso em produção. O sistema oferece uma solução robusta e escalável para o rastreamento de documentos dos estudantes, com interface intuitiva e integração perfeita com o ecossistema existente do SisGOE.

Para dúvidas ou suporte, consulte a documentação técnica ou entre em contato com a equipe de desenvolvimento.