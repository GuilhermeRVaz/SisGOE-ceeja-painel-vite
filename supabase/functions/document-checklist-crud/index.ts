import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentChecklistItem {
  id: string;
  document_type: string;
  document_name: string;
  is_required: boolean;
  is_delivered: boolean;
  delivered_at?: string;
  approved_by_admin?: boolean;
  admin_notes?: string;
  required_for_enrollment: boolean;
  category: 'personal' | 'address' | 'schooling' | 'other';
}

interface DocumentChecklistStatus {
  total_required: number;
  total_delivered: number;
  total_approved: number;
  is_complete: boolean;
  missing_documents: DocumentChecklistItem[];
  pending_approval: DocumentChecklistItem[];
  approved_documents: DocumentChecklistItem[];
}

interface StudentDocumentChecklist {
  id: string;
  student_id: string;
  enrollment_id?: string;
  items: DocumentChecklistItem[];
  status: DocumentChecklistStatus;
  created_at: string;
  updated_at: string;
  last_reviewed_by?: string;
  last_reviewed_at?: string;
}

const calculateStatus = (items: DocumentChecklistItem[]): DocumentChecklistStatus => {
  const requiredItems = items.filter(item => item.is_required);
  const deliveredItems = items.filter(item => item.is_delivered);
  const approvedItems = items.filter(item => item.approved_by_admin);

  const missingDocuments = items.filter(item =>
    item.is_required && !item.is_delivered
  );

  const pendingApproval = items.filter(item =>
    item.is_delivered && !item.approved_by_admin
  );

  const approvedDocuments = items.filter(item =>
    item.is_delivered && item.approved_by_admin
  );

  return {
    total_required: requiredItems.length,
    total_delivered: deliveredItems.length,
    total_approved: approvedItems.length,
    is_complete: missingDocuments.length === 0 && pendingApproval.length === 0,
    missing_documents: missingDocuments,
    pending_approval: pendingApproval,
    approved_documents: approvedDocuments
  };
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const studentId = url.searchParams.get('student_id')

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: 'student_id é obrigatório' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar se o usuário tem permissão para acessar este estudante
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autorização não fornecido' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Buscar checklist existente
    const { data: existingChecklist, error: fetchError } = await supabaseClient
      .from('student_document_checklist')
      .select('*')
      .eq('student_id', studentId)
      .single()

    switch (req.method) {
      case 'GET':
        if (existingChecklist) {
          return new Response(
            JSON.stringify(existingChecklist),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        } else {
          return new Response(
            JSON.stringify({ message: 'Checklist não encontrado' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

      case 'POST':
        if (existingChecklist) {
          return new Response(
            JSON.stringify({ error: 'Checklist já existe para este estudante' }),
            {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const { data: studentData } = await supabaseClient
          .from('students')
          .select('enrollment_id')
          .eq('id', studentId)
          .single()

        // Buscar documentos padrão dos templates
        const { data: templates } = await supabaseClient
          .from('document_templates')
          .select('*')
          .eq('is_active', true)
          .order('document_type')

        const defaultItems: DocumentChecklistItem[] = templates?.map((template, index) => ({
          id: `temp_${index}_${Date.now()}`,
          document_type: template.document_type,
          document_name: template.document_name,
          is_required: template.is_required,
          is_delivered: false,
          required_for_enrollment: template.required_for_enrollment,
          category: template.category,
          approved_by_admin: false
        })) || []

        const status = calculateStatus(defaultItems)

        const newChecklist: Omit<StudentDocumentChecklist, 'id'> = {
          student_id: studentId,
          enrollment_id: studentData?.enrollment_id,
          items: defaultItems,
          status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: createdChecklist, error: createError } = await supabaseClient
          .from('student_document_checklist')
          .insert([newChecklist])
          .select()
          .single()

        if (createError) throw createError

        return new Response(
          JSON.stringify(createdChecklist),
          {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      case 'PUT':
        if (!existingChecklist) {
          return new Response(
            JSON.stringify({ error: 'Checklist não encontrado' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const updatedData = await req.json()
        const updatedItems = updatedData.items || existingChecklist.items
        const updatedStatus = calculateStatus(updatedItems)

        const checklistUpdate: Partial<StudentDocumentChecklist> = {
          ...updatedData,
          items: updatedItems,
          status: updatedStatus,
          updated_at: new Date().toISOString(),
          last_reviewed_by: user.id,
          last_reviewed_at: new Date().toISOString()
        }

        const { data: updatedChecklist, error: updateError } = await supabaseClient
          .from('student_document_checklist')
          .update(checklistUpdate)
          .eq('id', existingChecklist.id)
          .select()
          .single()

        if (updateError) throw updateError

        // Registrar no histórico
        await supabaseClient
          .from('student_document_checklist_history')
          .insert([{
            checklist_id: existingChecklist.id,
            student_id: studentId,
            changed_by: user.id,
            change_type: 'updated',
            previous_items: existingChecklist.items,
            new_items: updatedItems,
            notes: 'Atualização via API'
          }])

        return new Response(
          JSON.stringify(updatedChecklist),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      case 'PATCH':
        if (!existingChecklist) {
          return new Response(
            JSON.stringify({ error: 'Checklist não encontrado' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const patchData = await req.json()
        const { document_type, is_delivered, approved_by_admin, admin_notes } = patchData

        if (!document_type) {
          return new Response(
            JSON.stringify({ error: 'document_type é obrigatório' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          )
        }

        const updatedItemsForPatch = existingChecklist.items.map((item: DocumentChecklistItem) => {
          if (item.document_type === document_type) {
            const now = new Date().toISOString()
            return {
              ...item,
              is_delivered: is_delivered ?? item.is_delivered,
              delivered_at: is_delivered ? now : item.delivered_at,
              approved_by_admin: approved_by_admin ?? item.approved_by_admin,
              admin_notes: admin_notes ?? item.admin_notes
            }
          }
          return item
        })

        const patchStatus = calculateStatus(updatedItemsForPatch)

        const { data: patchedChecklist, error: patchError } = await supabaseClient
          .from('student_document_checklist')
          .update({
            items: updatedItemsForPatch,
            status: patchStatus,
            updated_at: new Date().toISOString(),
            last_reviewed_by: user.id,
            last_reviewed_at: new Date().toISOString()
          })
          .eq('id', existingChecklist.id)
          .select()
          .single()

        if (patchError) throw patchError

        // Registrar no histórico
        await supabaseClient
          .from('student_document_checklist_history')
          .insert([{
            checklist_id: existingChecklist.id,
            student_id: studentId,
            changed_by: user.id,
            change_type: 'document_delivered',
            previous_items: existingChecklist.items,
            new_items: updatedItemsForPatch,
            notes: `Documento ${document_type} ${is_delivered ? 'entregue' : 'pendente'}`
          }])

        return new Response(
          JSON.stringify(patchedChecklist),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Método não permitido' }),
          {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

  } catch (error) {
    console.error('Erro na função document-checklist-crud:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})