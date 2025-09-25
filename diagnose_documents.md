# Diagnóstico - Documentos Não Aparecendo na Interface

## Problema Identificado
- Interface mostra 12 documentos quando deveriam ser 14
- Os 2 novos documentos não estão aparecendo:
  - "Requerimento de Dispensa de Educação Física"
  - "Reservista"

## Possíveis Causas

### 1. Migração Não Executada
A migração `001_create_document_checklist_tables.sql` pode não ter sido aplicada no ambiente de produção.

### 2. Dados na Tabela `document_templates`
Os novos documentos podem não estar presentes na tabela `document_templates`.

### 3. Função Edge Não Buscando Corretamente
A função `document-checklist-crud` pode não estar buscando os templates corretamente.

## Script de Diagnóstico

Para investigar, execute este SQL no painel do Supabase:

```sql
-- Verificar se a tabela document_templates existe
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'document_templates';

-- Verificar quantos documentos estão na tabela
SELECT COUNT(*) as total_documentos FROM document_templates WHERE is_active = true;

-- Listar todos os documentos ativos
SELECT 
    document_type,
    document_name,
    is_required,
    required_for_enrollment,
    category,
    is_active
FROM document_templates 
WHERE is_active = true
ORDER BY document_type;

-- Verificar especificamente os novos documentos
SELECT * FROM document_templates 
WHERE document_type IN ('requerimento_dispensa_educacao_fisica', 'reservista');

-- Verificar se a migração foi aplicada (tabela existe)
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'student_document_checklist'
);
```

## Verificação da Função Edge

Para testar se a função está funcionando corretamente:

1. Acesse o painel do Supabase
2. Vá em "Edge Functions"
3. Clique em "document-checklist-crud"
4. Clique em "Invoke function"
5. Use este payload:

```json
{
  "student_id": "SEU_STUDENT_ID_AQUI"
}
```

## Solução Proposta

Se os documentos não estiverem na tabela `document_templates`, execute:

```sql
-- Inserir os documentos que estão faltando
INSERT INTO public.document_templates (
    document_type,
    document_name,
    is_required,
    required_for_enrollment,
    category,
    description
) VALUES
    ('requerimento_dispensa_educacao_fisica', 'Requerimento de Dispensa de Educação Física', false, false, 'schooling', 'Documento para dispensa de educação física'),
    ('reservista', 'Reservista', false, false, 'other', 'Documento militar obrigatório')
ON CONFLICT (document_type) DO NOTHING;
```

## Verificação Final

Após executar a correção, teste novamente a interface. Os documentos devem aparecer automaticamente.