-- Script de backfill para adicionar novos documentos aos checklists existentes
-- Este script adiciona os documentos "requerimento_dispensa_educacao_fisica" e "reservista"
-- aos checklists de todos os alunos que ainda não possuem esses itens

-- 1. Primeiro, vamos inserir os novos templates no banco (se ainda não existirem)
INSERT INTO document_templates
  (document_type, document_name, is_required, required_for_enrollment, category, is_active)
VALUES
  ('requerimento_dispensa_educacao_fisica', 'Requerimento de Dispensa de Educação Física', false, false, 'other', true),
  ('reservista', 'Reservista', false, false, 'other', true)
ON CONFLICT (document_type) DO NOTHING;

-- 2. Agora vamos fazer o backfill dos checklists existentes
-- Este UPDATE adiciona os novos documentos apenas aos checklists que não os possuem ainda

UPDATE student_document_checklist
SET items = items || jsonb_build_array(
    jsonb_build_object(
        'id', gen_random_uuid()::text,
        'document_type', 'requerimento_dispensa_educacao_fisica',
        'document_name', 'Requerimento de Dispensa de Educação Física',
        'is_required', false,
        'is_delivered', false,
        'required_for_enrollment', false,
        'category', 'other',
        'approved_by_admin', false
    ),
    jsonb_build_object(
        'id', gen_random_uuid()::text,
        'document_type', 'reservista',
        'document_name', 'Reservista',
        'is_required', false,
        'is_delivered', false,
        'required_for_enrollment', false,
        'category', 'other',
        'approved_by_admin', false
    )
)
WHERE NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(items) elem
    WHERE elem ->> 'document_type' IN ('requerimento_dispensa_educacao_fisica', 'reservista')
);

-- 3. Verificar quantos checklists foram atualizados
SELECT
    'Total de checklists atualizados:' as info,
    COUNT(*) as count
FROM student_document_checklist
WHERE EXISTS (
    SELECT 1 FROM jsonb_array_elements(items) elem
    WHERE elem ->> 'document_type' IN ('requerimento_dispensa_educacao_fisica', 'reservista')
);

-- 4. Mostrar um exemplo de checklist atualizado (opcional)
SELECT
    student_id,
    jsonb_array_elements(items) ->> 'document_type' as document_type,
    jsonb_array_elements(items) ->> 'document_name' as document_name
FROM student_document_checklist
WHERE EXISTS (
    SELECT 1 FROM jsonb_array_elements(items) elem
    WHERE elem ->> 'document_type' IN ('requerimento_dispensa_educacao_fisica', 'reservista')
)
ORDER BY student_id
LIMIT 10;