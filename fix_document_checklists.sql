-- 🔧 CORREÇÃO: Ativar documentos inativos e recriar checklists

-- 1. Verificar status atual dos documentos
SELECT
    document_type,
    document_name,
    is_active,
    is_required
FROM document_templates
ORDER BY document_type;

-- 2. Ativar todos os documentos que estão inativos
UPDATE document_templates
SET is_active = true
WHERE is_active = false;

-- 3. Verificar se agora todos estão ativos
SELECT
    COUNT(*) as total_documentos,
    COUNT(CASE WHEN is_active = true THEN 1 END) as ativos,
    COUNT(CASE WHEN is_active = false THEN 1 END) as inativos
FROM document_templates;

-- 4. Para cada aluno, deletar e recriar o checklist
-- (Execute um de cada vez, substituindo o student_id)

-- Exemplo para o aluno Sandro (a584c5f2-1d1f-4618-9ca9-87a3c441c33d):
DELETE FROM student_document_checklist
WHERE student_id = 'a584c5f2-1d1f-4618-9ca9-87a3c441c33d';

-- Para outros alunos, substitua o student_id acima
-- A aplicação vai recriar automaticamente quando acessar o checklist