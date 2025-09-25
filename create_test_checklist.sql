-- =====================================================================
-- SCRIPT: Criar checklist de teste para estudante
-- =====================================================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- Substitua 'SEU_STUDENT_ID_AQUI' pelo ID real do estudante

-- 1. Primeiro, vamos ver quais estudantes existem
SELECT id, name FROM students LIMIT 5;

-- 2. Criar checklist para um estudante específico
-- Substitua 'SEU_STUDENT_ID_AQUI' pelo ID do estudante desejado
INSERT INTO public.student_document_checklist (
    student_id,
    enrollment_id,
    items,
    status_summary,
    created_at,
    updated_at
) VALUES (
    'SEU_STUDENT_ID_AQUI', -- Substitua pelo ID real do estudante
    (SELECT enrollment_id FROM students WHERE id = 'SEU_STUDENT_ID_AQUI' LIMIT 1),
    '[
        {
            "id": "temp_0_123456789",
            "document_type": "rg",
            "document_name": "RG (Carteira de Identidade)",
            "is_required": true,
            "is_delivered": false,
            "required_for_enrollment": true,
            "category": "personal",
            "approved_by_admin": false
        },
        {
            "id": "temp_1_123456789",
            "document_type": "cpf",
            "document_name": "CPF",
            "is_required": true,
            "is_delivered": false,
            "required_for_enrollment": true,
            "category": "personal",
            "approved_by_admin": false
        },
        {
            "id": "temp_2_123456789",
            "document_type": "certidao_nascimento_casamento",
            "document_name": "Certidão de Nascimento ou Casamento",
            "is_required": true,
            "is_delivered": false,
            "required_for_enrollment": true,
            "category": "personal",
            "approved_by_admin": false
        },
        {
            "id": "temp_3_123456789",
            "document_type": "foto_3x4",
            "document_name": "Foto 3x4",
            "is_required": true,
            "is_delivered": false,
            "required_for_enrollment": true,
            "category": "personal",
            "approved_by_admin": false
        },
        {
            "id": "temp_4_123456789",
            "document_type": "historico_escolar_fundamental",
            "document_name": "Histórico Escolar - Ensino Fundamental",
            "is_required": true,
            "is_delivered": false,
            "required_for_enrollment": true,
            "category": "schooling",
            "approved_by_admin": false
        },
        {
            "id": "temp_5_123456789",
            "document_type": "comprovante_residencia",
            "document_name": "Comprovante de Residência",
            "is_required": true,
            "is_delivered": false,
            "required_for_enrollment": true,
            "category": "address",
            "approved_by_admin": false
        }
    ]'::jsonb,
    '{
        "total_required": 6,
        "total_delivered": 0,
        "total_approved": 0,
        "is_complete": false
    }'::jsonb,
    NOW(),
    NOW()
);

-- 3. Verificar se o checklist foi criado
SELECT * FROM student_document_checklist WHERE student_id = 'SEU_STUDENT_ID_AQUI';

-- 4. Ver todos os checklists existentes
SELECT
    c.id,
    c.student_id,
    s.name as student_name,
    c.status_summary,
    c.created_at
FROM student_document_checklist c
LEFT JOIN students s ON c.student_id = s.id;