import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import ExcelJS from 'exceljs';
import { get } from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento de campos do Supabase para células do Excel
const cellMapping = {
  'personalData.name': 'C6',
  'personalData.rg': 'C7',
  'personalData.cpf': 'I7',
  'personalData.birth_date': 'C9',
  'personalData.mother_name': 'I9',
  'personalData.nationality': 'C10',
  'personalData.naturalness': 'I10',
  'addressData.street': 'C19',
  'addressData.neighborhood': 'C20',
  'addressData.cep': 'C21',
  'addressData.city': 'I21',
  'addressData.state': 'O21',
  'addressData.phone_number': 'C22',
  'addressData.cell_phone': 'I22',
  'addressData.email': 'C23',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { student_id } = await req.json();
    if (!student_id) {
      throw new Error("O ID do estudante (student_id) não foi fornecido.");
    }

    // Busca de dados
    // A requisição envia o 'id' da tabela personal_data, que chamamos de student_id no corpo.
    const personalDataId = student_id;

    const { data: personalData, error: personalError } = await supabaseClient
      .from('personal_data').select('*').eq('id', personalDataId).maybeSingle();
    if (personalError) throw new Error(`Erro ao buscar dados pessoais: ${personalError.message}`);
    
    // Se não encontrarmos o aluno, não há como prosseguir.
    if (!personalData) {
      return new Response(JSON.stringify({ error: `Registro de dados pessoais com ID ${personalDataId} não encontrado.` }), {
        status: 404, // Not Found
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Agora usamos o verdadeiro student_id (chave estrangeira) para buscar os dados relacionados.
    const actualStudentId = personalData.student_id;

    const { data: addressData, error: addressError } = await supabaseClient
      .from('addresses').select('*').eq('student_id', actualStudentId).maybeSingle();
    if (addressError) throw new Error(`Erro ao buscar endereço: ${addressError.message}`);
      
    const { data: schoolingData, error: schoolingError } = await supabaseClient
      .from('schooling_data').select('*').eq('student_id', actualStudentId).maybeSingle();
    if (schoolingError) throw new Error(`Erro ao buscar dados de escolaridade: ${schoolingError.message}`);

    const studentFullData = { personalData, addressData, schoolingData };

    // Carrega o template da planilha
    console.log("Tentando ler o arquivo de template...");
    const filePath = await Deno.readFile('./template.xlsx');
    console.log(`Arquivo lido com sucesso. Tamanho: ${filePath.length} bytes.`);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(filePath.buffer);

    const worksheet = workbook.getWorksheet('Plan1');
    if (!worksheet) {
      throw new Error(`A planilha "Plan1" não foi encontrada no arquivo.`);
    }

    // Preenche as células com os dados do aluno
    for (const [path, cell] of Object.entries(cellMapping)) {
      const value = get(studentFullData, path, '');
      worksheet.getCell(cell).value = value;
    }

    // Gera o buffer do arquivo Excel
    const excelBuffer = await workbook.xlsx.writeBuffer();

    return new Response(excelBuffer, {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="ficha_matricula.xlsx"'
      },
    });

  } catch (error) {
    console.error("[FUNCTION ERROR]", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});