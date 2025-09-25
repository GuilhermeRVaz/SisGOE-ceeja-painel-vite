-- =====================================================================
-- MIGRATION: Criar tabelas para sistema de checklist de documentos
-- =====================================================================

-- Tabela principal para armazenar o checklist de documentos do estudante
CREATE TABLE IF NOT EXISTS public.student_document_checklist (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    enrollment_id UUID,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    status_summary JSONB NOT NULL DEFAULT '{
        "total_required": 0,
        "total_delivered": 0,
        "total_approved": 0,
        "is_complete": false
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reviewed_by UUID,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT student_document_checklist_pkey PRIMARY KEY (id),
    CONSTRAINT student_document_checklist_student_id_key UNIQUE (student_id),
    CONSTRAINT student_document_checklist_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT student_document_checklist_enrollment_id_fkey
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE SET NULL,
    CONSTRAINT student_document_checklist_last_reviewed_by_fkey
        FOREIGN KEY (last_reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tabela para histórico de mudanças no checklist
CREATE TABLE IF NOT EXISTS public.student_document_checklist_history (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    checklist_id UUID NOT NULL,
    student_id UUID NOT NULL,
    changed_by UUID,
    change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'document_delivered', 'document_approved', 'document_rejected', 'bulk_update')),
    previous_items JSONB,
    new_items JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT student_document_checklist_history_pkey PRIMARY KEY (id),
    CONSTRAINT student_document_checklist_history_checklist_id_fkey
        FOREIGN KEY (checklist_id) REFERENCES student_document_checklist(id) ON DELETE CASCADE,
    CONSTRAINT student_document_checklist_history_student_id_fkey
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT student_document_checklist_history_changed_by_fkey
        FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Tabela para templates de documentos obrigatórios (para facilitar manutenção)
CREATE TABLE IF NOT EXISTS public.document_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL UNIQUE,
    document_name TEXT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT false,
    required_for_enrollment BOOLEAN NOT NULL DEFAULT false,
    category TEXT NOT NULL CHECK (category IN ('personal', 'address', 'schooling', 'other')),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT document_templates_pkey PRIMARY KEY (id),
    CONSTRAINT document_templates_document_type_key UNIQUE (document_type)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_student_document_checklist_student_id
    ON public.student_document_checklist USING btree (student_id);

CREATE INDEX IF NOT EXISTS idx_student_document_checklist_enrollment_id
    ON public.student_document_checklist USING btree (enrollment_id);

CREATE INDEX IF NOT EXISTS idx_student_document_checklist_history_checklist_id
    ON public.student_document_checklist_history USING btree (checklist_id);

CREATE INDEX IF NOT EXISTS idx_student_document_checklist_history_student_id
    ON public.student_document_checklist_history USING btree (student_id);

CREATE INDEX IF NOT EXISTS idx_document_templates_category
    ON public.document_templates USING btree (category);

CREATE INDEX IF NOT EXISTS idx_document_templates_active
    ON public.document_templates USING btree (is_active);

-- =====================================================================
-- INSERIR DOCUMENTOS PADRÃO OBRIGATÓRIOS
-- =====================================================================

INSERT INTO public.document_templates (
    document_type,
    document_name,
    is_required,
    required_for_enrollment,
    category,
    description
) VALUES
    ('rg', 'RG (Carteira de Identidade)', true, true, 'personal', 'Documento de identidade oficial'),
    ('cpf', 'CPF', true, true, 'personal', 'Cadastro de Pessoa Física'),
    ('certidao_nascimento_casamento', 'Certidão de Nascimento ou Casamento', true, true, 'personal', 'Documento comprobatório de nascimento ou estado civil'),
    ('foto_3x4', 'Foto 3x4', true, true, 'personal', 'Fotografia recente para documentos'),
    ('historico_escolar_fundamental', 'Histórico Escolar - Ensino Fundamental', true, true, 'schooling', 'Histórico escolar do ensino fundamental'),
    ('historico_escolar_medio', 'Histórico Escolar - Ensino Médio (se aplicável)', false, false, 'schooling', 'Histórico escolar do ensino médio quando aplicável'),
    ('comprovante_residencia', 'Comprovante de Residência', true, true, 'address', 'Documento que comprove o endereço residencial'),
    ('tit_eleitor', 'Título de Eleitor', false, false, 'other', 'Documento eleitoral'),
    ('carteira_vacinacao_covid', 'Carteira de Vacinação COVID', false, false, 'other', 'Comprovante de vacinação contra COVID-19'),
    ('atestado_eliminacao_disciplina', 'Atestado de Eliminação de Disciplina (se aplicável)', false, false, 'schooling', 'Documento para disciplinas eliminadas'),
    ('declaracao_transferencia', 'Declaração de Transferência (se aplicável)', false, false, 'schooling', 'Documento para alunos transferidos'),
    ('requerimento_dispensa_educacao_fisica', 'Requerimento de Dispensa de Educação Física', false, false, 'schooling', 'Documento para dispensa de educação física'),
    ('reservista', 'Reservista', false, false, 'other', 'Documento militar obrigatório'),
    ('outros', 'Outros Documentos', false, false, 'other', 'Documentos adicionais que podem ser necessários')
ON CONFLICT (document_type) DO NOTHING;

-- =====================================================================
-- FUNÇÕES AUXILIARES
-- =====================================================================

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at na tabela student_document_checklist
CREATE TRIGGER update_student_document_checklist_updated_at
    BEFORE UPDATE ON public.student_document_checklist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at na tabela document_templates
CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON public.document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.student_document_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_document_checklist_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Políticas para student_document_checklist
CREATE POLICY "Users can view their own document checklist"
    ON public.student_document_checklist FOR SELECT
    USING (
        student_id IN (
            SELECT s.id FROM students s
            JOIN enrollments e ON s.enrollment_id = e.id
            WHERE e.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all document checklists"
    ON public.student_document_checklist FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Políticas para document_templates (apenas leitura para usuários autenticados)
CREATE POLICY "Authenticated users can view document templates"
    ON public.document_templates FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage document templates"
    ON public.document_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Políticas para checklist_history (apenas admins podem ver)
CREATE POLICY "Admins can view checklist history"
    ON public.student_document_checklist_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- =====================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================================

COMMENT ON TABLE public.student_document_checklist IS 'Armazena o checklist de documentos para cada estudante';
COMMENT ON TABLE public.student_document_checklist_history IS 'Histórico de mudanças no checklist de documentos';
COMMENT ON TABLE public.document_templates IS 'Templates de documentos obrigatórios para matrícula';

COMMENT ON COLUMN public.student_document_checklist.items IS 'Array JSON com os itens do checklist de documentos';
COMMENT ON COLUMN public.student_document_checklist.status_summary IS 'Resumo do status do checklist (total, entregues, aprovados, etc.)';
COMMENT ON COLUMN public.student_document_checklist_history.change_type IS 'Tipo de mudança realizada no checklist';