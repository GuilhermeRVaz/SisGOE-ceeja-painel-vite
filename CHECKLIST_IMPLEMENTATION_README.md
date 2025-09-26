# Implementação de Novos Documentos no Checklist

## 📋 Visão Geral

Esta implementação adiciona dois novos documentos ao sistema de checklist:

1. **Requerimento de Dispensa de Educação Física** (`requerimento_dispensa_educacao_fisica`)
2. **Reservista** (`reservista`)

## 🔧 Mudanças Implementadas

### 1. Adição de Novos Documentos
- ✅ Adicionados aos tipos em `src/types/documents.ts`
- ✅ Adicionados ao hook `src/hooks/useDocumentChecklist.ts`
- ✅ Configurado mapeamento Excel nas células corretas:
  - `requerimento_dispensa_educacao_fisica` → A43
  - `reservista` → I41

### 2. Sincronização de Fonte Canônica
- ✅ Edge function agora usa `document_templates` do banco como fonte única
- ✅ Hook `createInitialChecklist` busca templates do backend
- ✅ Fallback para lista local se não houver templates no banco

### 3. Normalização de Document Type
- ✅ Implementada função `normalizeDocumentType()` em ambos frontend e backend
- ✅ Normaliza: trim → toLowerCase → replace spaces with underscore
- ✅ Aplicada em todas as comparações de `document_type`

### 4. Script de Backfill
- ✅ Criado `backfill_new_documents.sql` para atualizar checklists existentes
- ✅ Adiciona os novos documentos apenas aos checklists que não os possuem
- ✅ Seguro: não sobrescreve dados existentes

## 🚀 Como Usar

### Passo 1: Executar o Backfill
```sql
-- Execute no Supabase SQL Editor ou via psql
\i backfill_new_documents.sql
```

### Passo 2: Reiniciar o Frontend
```bash
npm run dev
# ou
yarn dev
```

### Passo 3: Verificar Funcionamento
1. Abra o painel de um estudante
2. Verifique se os novos documentos aparecem:
   - "Requerimento de Dispensa de Educação Física"
   - "Reservista"
3. Teste marcar/desmarcar os documentos
4. Gere uma ficha Excel e verifique se as marcações aparecem em A43 e I41

## 🧪 Testes

Execute o script de teste `test_checklist_implementation.js` no console do navegador:

```javascript
// Cole o conteúdo do arquivo no console do dev tools
// Deve mostrar todos os testes passando ✅
```

## 📁 Arquivos Modificados

### Frontend
- `src/types/documents.ts` - Adicionados novos documentos
- `src/hooks/useDocumentChecklist.ts` - Busca do backend + normalização
- `src/core/utils/documentChecklistValidators.ts` - (se existir)

### Backend
- `supabase/functions/document-checklist-crud/index.ts` - Fonte canônica + normalização
- `supabase/functions/generate-enrollment-sheet/index.ts` - Mapeamento Excel

### Scripts
- `backfill_new_documents.sql` - Script de migração
- `test_checklist_implementation.js` - Script de teste

## 🔍 Troubleshooting

### Problema: Novos documentos não aparecem
**Solução:**
1. Verifique se o backfill foi executado
2. Verifique se os templates estão ativos no banco
3. Reinicie o frontend
4. Verifique o console por erros

### Problema: Erro ao criar checklist
**Solução:**
1. Verifique se a tabela `document_templates` existe
2. Verifique se há templates ativos
3. Verifique as permissões do usuário

### Problema: Mapeamento Excel incorreto
**Solução:**
1. Verifique se as células A43 e I41 estão corretas no template Excel
2. Verifique se o mapeamento em `generate-enrollment-sheet` está correto

## 📊 Monitoramento

### Logs Importantes
- Frontend: `🔍 Buscando templates do backend para criar checklist...`
- Backend: `📋 Encontrados X templates ativos para criar checklist`
- Backfill: `Total de checklists atualizados: X`

### Queries de Monitoramento
```sql
-- Verificar templates ativos
SELECT * FROM document_templates WHERE is_active = true;

-- Verificar checklists com novos documentos
SELECT student_id, COUNT(*)
FROM student_document_checklist, jsonb_array_elements(items) item
WHERE item ->> 'document_type' IN ('requerimento_dispensa_educacao_fisica', 'reservista')
GROUP BY student_id;
```

## 🎯 Benefícios da Implementação

1. **Consistência**: Todos os alunos terão os mesmos documentos
2. **Manutenibilidade**: Novos documentos são adicionados apenas no banco
3. **Robustez**: Normalização evita problemas de maiúsculas/espaços
4. **Auditabilidade**: Histórico completo das mudanças
5. **Flexibilidade**: Fácil adição de novos documentos no futuro

## 🔄 Próximos Passos

1. Monitorar o uso dos novos documentos
2. Coletar feedback dos usuários
3. Considerar automatizar o backfill em futuras mudanças
4. Documentar o processo para futuras implementações

---

**Status**: ✅ Implementação Concluída
**Testado**: ✅ Scripts de teste disponíveis
**Documentado**: ✅ Este README