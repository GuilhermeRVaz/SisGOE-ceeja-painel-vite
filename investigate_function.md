# 🔍 Investigação - Função Retornando Apenas 12 Documentos

## Resultado do Teste
A função `document-checklist-crud` está retornando apenas **12 documentos** em vez de **14**.

### Documentos Faltando:
- ❌ **Requerimento de Dispensa de Educação Física** (`requerimento_dispensa_educacao_fisica`)
- ❌ **Reservista** (`reservista`)

### Documentos Presentes (12):
✅ RG, CPF, Certidão de Nascimento/Casamento, Foto 3x4, Histórico Escolar Fundamental, Histórico Escolar Médio, Comprovante de Residência, Título de Eleitor, Carteira de Vacinação COVID, Atestado de Eliminação de Disciplina, Declaração de Transferência, Outros Documentos

## Possíveis Causas

### 1. Query com Filtro Incorreto
A função pode estar filtrando incorretamente na tabela `document_templates`.

### 2. Documentos com `is_active = false`
Os documentos podem estar marcados como inativos.

### 3. Problema na Query SQL
A query pode ter um `WHERE` incorreto.

## Investigação Necessária

### Verificar Query na Função:
```sql
-- Verificar se a query da função está correta
SELECT * FROM document_templates WHERE is_active = true ORDER BY document_type;
```

### Verificar Status dos Documentos:
```sql
-- Verificar especificamente os documentos que estão faltando
SELECT * FROM document_templates 
WHERE document_type IN ('requerimento_dispensa_educacao_fisica', 'reservista');
```

### Verificar se Há Filtros na Função:
1. A função pode ter um filtro por `category`
2. Pode ter um limite no número de resultados
3. Pode ter um filtro por `is_required`

## Solução Proposta

### 1. Verificar Query na Função:
```sql
-- Executar exatamente a query que a função usa
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
```

### 2. Se os Documentos Existirem:
Verificar se a função tem algum filtro adicional.

### 3. Se os Documentos Não Existirem:
Inserir novamente:
```sql
INSERT INTO document_templates (
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

### 4. Verificar Logs da Função:
No painel do Supabase, verificar os logs da função para ver se há erros na query.

---

**Execute essas queries e me informe os resultados!** 📊

**Especificamente:**
1. **Quantos documentos** a query SQL retorna?
2. **Os documentos faltantes** existem na tabela?
3. **Qual é o status** `is_active` dos documentos faltantes?