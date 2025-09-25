# 🔍 Debug - Documentos Não Aparecendo na Interface

## Situação Atual
- ✅ Documentos estão na tabela `document_templates` (14 documentos)
- ✅ Função Edge foi deployada
- ❌ Interface ainda mostra apenas 12 documentos
- ❌ Logs não mostram erros

## Investigação Necessária

### **1. Teste Direto da Função Edge**

Execute este teste no painel do Supabase:

1. **Vá em "Edge Functions"**
2. **Clique em "document-checklist-crud"**
3. **Clique em "Invoke function"**
4. **Use este payload:**

```json
{
  "student_id": "SEU_STUDENT_ID_AQUI"
}
```

**Verifique se a resposta contém 14 documentos.**

### **2. Verificar Estrutura da Resposta**

A função deve retornar algo como:

```json
{
  "id": "uuid",
  "student_id": "uuid",
  "items": [
    {
      "id": "temp_0_...",
      "document_type": "rg",
      "document_name": "RG (Carteira de Identidade)",
      "is_required": true,
      "is_delivered": false,
      "required_for_enrollment": true,
      "category": "personal"
    },
    {
      "id": "temp_1_...",
      "document_type": "requerimento_dispensa_educacao_fisica",
      "document_name": "Requerimento de Dispensa de Educação Física",
      "is_required": false,
      "is_delivered": false,
      "required_for_enrollment": false,
      "category": "schooling"
    },
    {
      "id": "temp_2_...",
      "document_type": "reservista",
      "document_name": "Reservista",
      "is_required": false,
      "is_delivered": false,
      "required_for_enrollment": false,
      "category": "other"
    }
  ]
}
```

### **3. Verificar Console do Navegador**

1. **Abra DevTools (F12)**
2. **Vá na aba "Network"**
3. **Filtre por "student_document_checklist"**
4. **Verifique a resposta da requisição**

### **4. Possíveis Problemas**

#### **Problema A: Função com Cache**
```sql
-- Limpar possíveis caches
SELECT * FROM document_templates WHERE is_active = true;
```

#### **Problema B: Query com Filtro Incorreto**
Verificar se a função está filtrando `is_active = true`

#### **Problema C: Frontend com Cache**
- Limpar cache do navegador
- Fazer hard refresh (Ctrl+F5)

### **5. Teste Manual**

Execute esta query para verificar se os documentos estão sendo retornados:

```sql
-- Simular o que a função faz
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

### **6. Verificar Logs da Função**

No painel do Supabase:
1. **Vá em "Edge Functions"**
2. **Clique em "document-checklist-crud"**
3. **Clique em "Logs"**
4. **Execute a função e veja os logs**

### **7. Solução de Emergência**

Se nada funcionar, podemos:

1. **Recriar o checklist** para o estudante:
```sql
DELETE FROM student_document_checklist WHERE student_id = 'SEU_STUDENT_ID';
```

2. **Forçar recriação** através da interface

---

**Execute esses testes e me informe os resultados!** 📊

**Especificamente:**
1. Quantos documentos a função Edge retorna?
2. O que aparece nos logs da função?
3. Qual é a resposta da requisição no Network tab?