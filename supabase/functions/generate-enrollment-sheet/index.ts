import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import ExcelJS from 'https://esm.sh/exceljs@4.3.0';
import { get } from 'https://deno.land/x/lodash@4.17.15-es/lodash.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento de campos do Supabase para células do Excel
const cellMapping = {
  'personalData.nome_completo': 'C6',
  'personalData.nome_social': 'F11',
  'personalData.rg': 'C7',
  'rg_digito': 'D7',
  'personalData.cpf': 'F7',
  'personalData.data_nascimento': 'C10',
  'personalData.nome_mae': 'G9',
  'personalData.nacionalidade': 'Q10',
  'personalData.nascimento_cidade': 'G10',
  'personalData.telefone': 'H22',
  'personalData.email': 'B24',
  'personalData.profissao': 'I23',
  'personalData.empresa': 'N23',
  'addressData.logradouro': 'B19',
  'addressData.numero': 'O19',
  'addressData.bairro': 'C20',
  'addressData.cep': 'C21',
  'addressData.nomeCidade': 'F21',
  'addressData.state': 'O21',
  'addressData.cell_phone': 'I22',
  'addressData.email': 'C23',
  'schoolingData.ra': 'M7'
};

// Mapeamento específico para células de raça/cor
const racaCorCellMapping = {
  'Branca': 'G8',
  'Preta': 'I8',
  'Parda': 'K8',
  'Amarela': 'M8',
  'Indígena': 'O8',
  'Quilombola': 'Q8'
};

// Mapeamento específico para células de "É gêmeo"
const isGemeoCellMapping = {
  true: 'O9',   // "( x ) sim"
  false: 'P9'   // "( x ) não"
};

// Mapeamento específico para células de escolaridade
const requerMatriculaEmCellMapping = {
  'Ensino Fundamental': 'Q11',
  'Ensino Médio': 'Q12'
};

const itinerarioFormativoCellMapping = {
  'Linguagens e Ciências Humanas': 'Q13',
  'Matemática e Ciências da Natureza': 'K13'
};

// Mapeamento específico para células de "Estudou no CEEJA"
const estudouNoCeejaCellMapping = {
  true: 'K15',   // "( x ) sim"
  false: 'M15'   // "( x ) não"
};

// Mapeamento específico para células de "Eliminou disciplina"
const eliminouDisciplinaCellMapping = {
  true: 'K16',   // "( x ) sim"
  false: 'M16'   // "( x ) não"
};

// Mapeamento específico para células de "É PCD"
const isPcdCellMapping = {
  true: 'K17',   // "( x ) sim"
  false: 'M17'   // "( x ) não"
};

// Mapeamento específico para células de "Zona"
const zonaCellMapping = {
  'Urbana': 'M20',
  'Rural': 'O20'
};

// Mapeamento específico para células de "Última Série Concluída"
const ultimaSerieConcluidaCellMapping = {
  '4ª Série Ensino Fundamental': 'K25',
  '5ª Série Ensino Fundamental': 'M25',
  '6ª Série Ensino Fundamental': 'O25',
  '7ª Série Ensino Fundamental': 'Q25',
  '8ª Série Ensino Fundamental': 'K26',
  '1ª Série do Ensino Médio': 'M26',
  '2ª Série do Ensino Médio': 'O26'
};

// URL do arquivo Excel no Supabase Storage
const EXCEL_TEMPLATE_URL = 'https://ucxjsrrggejajsxrxnov.supabase.co/storage/v1/object/sign/ficha/modelo/FICHA.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OTFjMGU2OC0xYjVkLTQwMWQtOWI5NC1kNjliYTMzNWExZjgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWNoYS9tb2RlbG8vRklDSEEueGxzeCIsImlhdCI6MTc1ODc1MjQ5MCwiZXhwIjoxNzkwMjg4NDkwfQ.ldlA8s8yR9MzpkFiZ-kCWCzyubbIPD_QHb1ma9N7hDo';

// Constantes para validação
const MIN_EXCEL_FILE_SIZE = 10240; // 10KB mínimo para um arquivo Excel válido
const MAX_STRING_LENGTH = 500; // Limite de caracteres para strings
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const DOWNLOAD_TIMEOUT_MS = 30000; // 30 segundos
const MAX_BUFFER_SIZE = 50 * 1024 * 1024; // 50MB máximo

// Funções auxiliares para validação e sanitização
function uint8ToBinaryString(u8) {
  const CHUNK = 0x8000; // 32KB chunks para evitar stack overflow
  let result = '';
  for (let i = 0; i < u8.length; i += CHUNK) {
    result += String.fromCharCode.apply(null, u8.subarray(i, i + CHUNK));
  }
  return result;
}

function manualBase64Encode(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;

  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = str.charCodeAt(i++);
    const c = str.charCodeAt(i++);

    const bitmap = (a << 16) | (b << 8) | c;

    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += chars.charAt((bitmap >> 6) & 63);
    result += chars.charAt(bitmap & 63);
  }

  // Adiciona padding se necessário
  const remainder = str.length % 3;
  if (remainder > 0) {
    result = result.slice(0, -remainder) + '='.repeat(remainder);
  }

  return result;
}

function manualBase64Decode(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;

  // Remove padding
  str = str.replace(/=+$/, '');

  while (i < str.length) {
    const enc1 = chars.indexOf(str.charAt(i++));
    const enc2 = chars.indexOf(str.charAt(i++));
    const enc3 = chars.indexOf(str.charAt(i++));
    const enc4 = chars.indexOf(str.charAt(i++));

    const bitmap = (enc1 << 18) | (enc2 << 12) | (enc3 << 6) | enc4;

    result += String.fromCharCode((bitmap >> 16) & 255);
    result += String.fromCharCode((bitmap >> 8) & 255);
    result += String.fromCharCode(bitmap & 255);
  }

  return result;
}

/**
 * Função específica para formatação de data para Excel (converte ISO para brasileiro)
 * @param isoDate - Data no formato ISO (yyyy-mm-dd)
 * @returns Data no formato brasileiro (dd/mm/yyyy) ou string vazia se inválida
 */
function formatDateForExcel(isoDate: string | null | undefined): string {
    console.log('📅 [ExcelDateFormatter] Formatando data para Excel:', {
        input: isoDate,
        type: typeof isoDate
    });

    // Verifica se a data é válida
    if (!isoDate || typeof isoDate !== 'string') {
        console.log('⚠️ [ExcelDateFormatter] Data inválida ou nula:', isoDate);
        return '';
    }

    try {
        // Valida o formato ISO básico (yyyy-mm-dd)
        const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!isoRegex.test(isoDate)) {
            console.log('❌ [ExcelDateFormatter] Formato ISO inválido:', isoDate);
            return '';
        }

        // Cria um objeto Date para validação
        const date = new Date(isoDate + 'T00:00:00');

        // Verifica se a data é válida
        if (isNaN(date.getTime())) {
            console.log('❌ [ExcelDateFormatter] Data ISO inválida:', isoDate);
            return '';
        }

        // Extrai dia, mês e ano
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        // Formata para dd/mm/yyyy
        const brazilianDate = `${day}/${month}/${year}`;

        console.log('✅ [ExcelDateFormatter] Conversão para Excel bem-sucedida:', {
            input: isoDate,
            output: brazilianDate,
            parsedDate: date.toISOString().split('T')[0]
        });

        return brazilianDate;

    } catch (error) {
        console.error('❌ [ExcelDateFormatter] Erro ao formatar data para Excel:', error, { input: isoDate });
        return '';
    }
}

function sanitizeString(value) {
  if (value === null || value === undefined) {
    return '';
  }

  let stringValue: string;

  try {
    // Converte para string de forma segura
    stringValue = String(value);
  } catch (error) {
    console.warn('Erro ao converter valor para string:', value, error);
    return '';
  }

  // Remove caracteres que podem corromper o Excel
  let sanitized = stringValue
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove caracteres de controle
    .replace(/[\uD800-\uDFFF]/g, '') // Remove surrogates inválidos
    .replace(/[\uFFFD\uFFFE\uFFFF]/g, '') // Remove caracteres de substituição Unicode
    .trim();

  // Remove caracteres específicos que causam problemas no Excel
  sanitized = sanitized
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle ASCII e Latin-1
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove caracteres invisíveis Unicode
    .replace(/\u000B/g, '') // Remove tabulação vertical
    .replace(/\u000C/g, '') // Remove alimentação de formulário
    .replace(/\u000E/g, '') // Remove shift out
    .replace(/\u000F/g, '') // Remove shift in
    .replace(/\u0010/g, '') // Remove data link escape
    .replace(/\u0011/g, '') // Remove device control 1
    .replace(/\u0012/g, '') // Remove device control 2
    .replace(/\u0013/g, '') // Remove device control 3
    .replace(/\u0014/g, '') // Remove device control 4
    .replace(/\u0015/g, '') // Remove negative acknowledge
    .replace(/\u0016/g, '') // Remove synchronous idle
    .replace(/\u0017/g, '') // Remove end of transmission block
    .replace(/\u0018/g, '') // Remove cancel
    .replace(/\u0019/g, '') // Remove end of medium
    .replace(/\u001A/g, '') // Remove substitute
    .replace(/\u001B/g, '') // Remove escape
    .replace(/\u001C/g, '') // Remove file separator
    .replace(/\u001D/g, '') // Remove group separator
    .replace(/\u001E/g, '') // Remove record separator
    .replace(/\u001F/g, ''); // Remove unit separator

  // Limita o tamanho da string
  if (sanitized.length > MAX_STRING_LENGTH) {
    sanitized = sanitized.substring(0, MAX_STRING_LENGTH) + '...';
  }

  // Log de sanitização para debugging
  if (stringValue !== sanitized) {
    console.log(`Sanitização aplicada: "${stringValue}" -> "${sanitized}"`);
  }

  return sanitized;
}

function validateExcelBuffer(buffer, context = 'desconhecido') {
  try {
    const uint8Array = new Uint8Array(buffer);

    // Verifica se o buffer tem tamanho mínimo
    if (buffer.byteLength < MIN_EXCEL_FILE_SIZE) {
      console.error(`[${context}] Buffer muito pequeno: ${buffer.byteLength} bytes (mínimo: ${MIN_EXCEL_FILE_SIZE})`);
      return false;
    }

    // Verifica se o buffer não está truncado (tamanho máximo)
    if (buffer.byteLength > MAX_BUFFER_SIZE) {
      console.error(`[${context}] Buffer muito grande: ${buffer.byteLength} bytes (máximo: ${MAX_BUFFER_SIZE})`);
      return false;
    }

    // Verifica se é um arquivo Excel válido (assinatura ZIP)
    const excelSignature = [0x50, 0x4B, 0x03, 0x04]; // PK..
    const isValidExcel = uint8Array.length >= 4 &&
      uint8Array[0] === excelSignature[0] &&
      uint8Array[1] === excelSignature[1] &&
      uint8Array[2] === excelSignature[2] &&
      uint8Array[3] === excelSignature[3];

    if (!isValidExcel) {
      console.error(`[${context}] Buffer não contém assinatura Excel válida. Primeiros bytes:`, Array.from(uint8Array.slice(0, 10)));
      return false;
    }

    // Verificações adicionais de integridade
    const hasValidStructure = validateExcelStructure(uint8Array, context);
    if (!hasValidStructure) {
      console.error(`[${context}] Estrutura do Excel inválida`);
      return false;
    }

    console.log(`[${context}] Buffer validado com sucesso: ${buffer.byteLength} bytes`);
    return true;
  } catch (error) {
    console.error(`[${context}] Erro ao validar buffer do Excel:`, error);
    return false;
  }
}

function validateExcelStructure(uint8Array, context) {
  try {
    // Verifica se tem pelo menos um header de arquivo ZIP válido
    let foundValidEntry = false;

    // Procura por entradas ZIP válidas (local file headers)
    for (let i = 0; i < uint8Array.length - 4; i++) {
      if (uint8Array[i] === 0x50 && uint8Array[i + 1] === 0x4B &&
          uint8Array[i + 2] === 0x01 && uint8Array[i + 3] === 0x02) {
        foundValidEntry = true;
        break;
      }
    }

    if (!foundValidEntry) {
      console.warn(`[${context}] Nenhum header de arquivo ZIP encontrado`);
      // Não falha completamente, pois pode ser um Excel simples
    }

    // Verifica se tem pelo menos um final de arquivo central
    let foundCentralEnd = false;
    for (let i = uint8Array.length - 22; i < uint8Array.length - 4; i++) {
      if (uint8Array[i] === 0x50 && uint8Array[i + 1] === 0x4B &&
          uint8Array[i + 2] === 0x05 && uint8Array[i + 3] === 0x06) {
        foundCentralEnd = true;
        break;
      }
    }

    if (!foundCentralEnd) {
      console.error(`[${context}] End of central directory não encontrado`);
      return false;
    }

    // Verifica se não tem bytes nulos demais (arquivo corrompido)
    const nullByteCount = uint8Array.filter(byte => byte === 0).length;
    const nullPercentage = (nullByteCount / uint8Array.length) * 100;

    if (nullPercentage > 90) {
      console.error(`[${context}] Arquivo contém muitos bytes nulos: ${nullPercentage.toFixed(2)}%`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[${context}] Erro ao validar estrutura do Excel:`, error);
    return false;
  }
}

function countZipEntries(uint8Array) {
  let count = 0;
  try {
    // Procura por local file headers (PK\x01\x02)
    for (let i = 0; i < uint8Array.length - 4; i++) {
      if (uint8Array[i] === 0x50 && uint8Array[i + 1] === 0x4B &&
          uint8Array[i + 2] === 0x01 && uint8Array[i + 3] === 0x02) {
        count++;
      }
    }
  } catch (error) {
    console.warn('Erro ao contar entradas ZIP:', error);
  }
  return count;
}

async function downloadTemplateWithRetry(url, maxAttempts = MAX_RETRY_ATTEMPTS) {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxAttempts} de download do template`);

      // Cria um AbortController para timeout personalizado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ Timeout na tentativa ${attempt} (${DOWNLOAD_TIMEOUT_MS}ms)`);
        controller.abort();
      }, DOWNLOAD_TIMEOUT_MS);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Supabase-Function/1.0',
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, application/vnd.ms-excel',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        console.error(`❌ Erro HTTP na tentativa ${attempt}: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      const contentDisposition = response.headers.get('content-disposition');

      console.log(`✅ Download bem-sucedido na tentativa ${attempt}:`, {
        status: response.status,
        contentType,
        contentLength: contentLength ? `${parseInt(contentLength)} bytes` : 'desconhecido',
        contentDisposition: contentDisposition || 'não informado'
      });

      // Verifica se o content-type indica um arquivo Excel
      const validContentTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream',
        'application/vnd.ms-excel',
        'application/x-zip-compressed'
      ];

      const isValidContentType = contentType && validContentTypes.some(type => contentType.includes(type));

      if (!isValidContentType) {
        console.warn(`⚠️ Content-Type inesperado: ${contentType}. Continuando mesmo assim...`);
      }

      // Verifica se o response tem body
      if (!response.body) {
        throw new Error('Response não contém body');
      }

      console.log(`📥 Lendo dados do response (${contentLength || 'tamanho desconhecido'} bytes)...`);
      const arrayBuffer = await response.arrayBuffer();

      console.log(`📊 Buffer lido: ${arrayBuffer.byteLength} bytes`);

      // Validação detalhada do buffer
      if (validateExcelBuffer(arrayBuffer, `download-tentativa-${attempt}`)) {
        console.log(`✅ Download do template concluído com sucesso na tentativa ${attempt}`);
        return arrayBuffer;
      } else {
        throw new Error('Buffer do Excel inválido após download');
      }

    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏰ Timeout na tentativa ${attempt}: operação cancelada após ${DOWNLOAD_TIMEOUT_MS}ms`);
      } else {
        console.error(`❌ Erro na tentativa ${attempt}:`, lastError.message);
      }

      if (attempt < maxAttempts) {
        const delay = RETRY_DELAY_MS * attempt; // Aumenta o delay progressivamente
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  const finalError = `Falha ao baixar template após ${maxAttempts} tentativas. Último erro: ${lastError?.message}`;
  console.error(`💥 ${finalError}`);
  throw new Error(finalError);
}

async function validateTokenAccessibility(url) {
  try {
    console.log('Testando acessibilidade da URL do token...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch(url, {
      method: 'HEAD', // Apenas testa a conexão, não baixa o arquivo
      headers: {
        'User-Agent': 'Supabase-Function/1.0',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`URL do token retornou status ${response.status}: ${response.statusText}`);
      return false;
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    console.log('URL do token acessível:', {
      status: response.status,
      contentType,
      contentLength: contentLength ? `${parseInt(contentLength)} bytes` : 'desconhecido'
    });

    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Timeout ao testar acessibilidade da URL do token');
    } else {
      console.error('Erro ao testar acessibilidade da URL do token:', error);
    }
    return false;
  }
}

function validateTokenUrl(url) {
  try {
    const urlObj = new URL(url);

    // Verifica se a URL tem formato esperado
    if (!urlObj.hostname.includes('supabase.co')) {
      console.error('URL do token não é do Supabase');
      return false;
    }

    // Verifica se tem parâmetros de token
    if (!urlObj.searchParams.has('token')) {
      console.error('URL não contém token de autenticação');
      return false;
    }

    console.log('URL do token validada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao validar URL do token:', error);
    return false;
  }
}

function validateWorkbook(workbook) {
  try {
    if (!workbook) {
      console.error('Workbook é null ou undefined');
      return false;
    }

    if (!workbook.worksheets || !Array.isArray(workbook.worksheets)) {
      console.error('Workbook não possui array de worksheets válido');
      return false;
    }

    if (workbook.worksheets.length === 0) {
      console.error('Workbook não possui worksheets');
      return false;
    }

    console.log(`Workbook validado com sucesso: ${workbook.worksheets.length} worksheets`);

    // Log das worksheets disponíveis
    workbook.worksheets.forEach((ws, index) => {
      console.log(`  Worksheet ${index + 1}: "${ws.name}" (${ws.rowCount}x${ws.columnCount})`);
    });

    return true;
  } catch (error) {
    console.error('Erro ao validar workbook:', error);
    return false;
  }
}

function validateWorksheet(worksheet, context = 'desconhecido') {
  try {
    // Verifica se worksheet é uma instância válida
    if (!worksheet) {
      console.error(`[${context}] Worksheet é null ou undefined`);
      return false;
    }

    // Verifica se tem as propriedades essenciais
    if (typeof worksheet.getCell !== 'function') {
      console.error(`[${context}] Worksheet não possui método getCell`);
      return false;
    }

    if (!worksheet.name || typeof worksheet.name !== 'string') {
      console.error(`[${context}] Worksheet não possui nome definido válido`);
      return false;
    }

    // Verifica se tem dimensões válidas
    if (typeof worksheet.rowCount !== 'number' || worksheet.rowCount < 0) {
      console.error(`[${context}] Worksheet não possui rowCount válido: ${worksheet.rowCount}`);
      return false;
    }

    if (typeof worksheet.columnCount !== 'number' || worksheet.columnCount < 0) {
      console.error(`[${context}] Worksheet não possui columnCount válido: ${worksheet.columnCount}`);
      return false;
    }

    // Verifica se tem pelo menos uma célula
    if (worksheet.rowCount === 0 || worksheet.columnCount === 0) {
      console.error(`[${context}] Worksheet não possui células: ${worksheet.rowCount}x${worksheet.columnCount}`);
      return false;
    }

    // Verifica se o nome da worksheet é válido
    if (worksheet.name.trim().length === 0) {
      console.error(`[${context}] Worksheet possui nome vazio`);
      return false;
    }

    // Verifica se consegue acessar uma célula de teste
    try {
      const testCell = worksheet.getCell('A1');
      if (!testCell) {
        console.error(`[${context}] Não foi possível acessar célula de teste A1`);
        return false;
      }
    } catch (cellError) {
      console.error(`[${context}] Erro ao acessar célula de teste:`, cellError);
      return false;
    }

    console.log(`[${context}] Worksheet validada com sucesso:`, {
      name: worksheet.name,
      rowCount: worksheet.rowCount,
      columnCount: worksheet.columnCount,
      hasGetCell: typeof worksheet.getCell === 'function'
    });

    return true;
  } catch (error) {
    console.error(`[${context}] Erro ao validar worksheet:`, error);
    return false;
  }
}

/**
 * Função para processar o preenchimento da raça/cor na ficha
 * @param worksheet - Planilha Excel onde será feito o preenchimento
 * @param racaCor - Valor do campo personalData.raca_cor
 */
function processRacaCorField(worksheet: ExcelJS.Worksheet, racaCor: string | null | undefined): void {
  console.log('🔍 [RacaCorProcessor] Processando campo raça/cor:', {
    input: racaCor,
    type: typeof racaCor
  });

  // Verifica se a raça/cor foi informada
  if (!racaCor || typeof racaCor !== 'string') {
    console.log('⚠️ [RacaCorProcessor] Raça/cor não informada ou inválida:', racaCor);
    return;
  }

  // Normaliza o valor removendo espaços e acentos
  const normalizedRacaCor = racaCor.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Busca a célula correspondente no mapeamento
  const targetCell = racaCorCellMapping[normalizedRacaCor as keyof typeof racaCorCellMapping];

  if (!targetCell) {
    console.log('⚠️ [RacaCorProcessor] Raça/cor não encontrada no mapeamento:', normalizedRacaCor);
    console.log('📋 [RacaCorProcessor] Opções disponíveis:', Object.keys(racaCorCellMapping));
    return;
  }

  try {
    // Verifica se a célula existe na planilha
    if (worksheet.getCell) {
      // Preenche a célula com "( x )"
      worksheet.getCell(targetCell).value = '( x )';
      console.log(`✅ [RacaCorProcessor] Raça/cor preenchida com sucesso:`, {
        racaCor: normalizedRacaCor,
        cell: targetCell,
        value: '( x )'
      });
    } else {
      console.error(`❌ [RacaCorProcessor] Método getCell não disponível na worksheet`);
    }
  } catch (error) {
    console.error(`❌ [RacaCorProcessor] Erro ao preencher célula ${targetCell}:`, error);
  }
}

/**
 * Função para processar o preenchimento do campo "É gêmeo" na ficha
 * @param worksheet - Planilha Excel onde será feito o preenchimento
 * @param isGemeo - Valor do campo personalData.is_gemeo (boolean)
 */
function processIsGemeoField(worksheet: ExcelJS.Worksheet, isGemeo: boolean | null | undefined): void {
  console.log('🔍 [IsGemeoProcessor] Processando campo "É gêmeo":', {
    input: isGemeo,
    type: typeof isGemeo
  });

  // Verifica se o campo foi definido (não é null ou undefined)
  if (isGemeo === null || isGemeo === undefined) {
    console.log('⚠️ [IsGemeoProcessor] Campo "É gêmeo" não definido:', isGemeo);
    return;
  }

  // Busca a célula correspondente no mapeamento
  const targetCell = isGemeoCellMapping[isGemeo];

  if (!targetCell) {
    console.log('⚠️ [IsGemeoProcessor] Valor de "É gêmeo" não encontrado no mapeamento:', isGemeo);
    console.log('📋 [IsGemeoProcessor] Opções disponíveis:', Object.keys(isGemeoCellMapping));
    return;
  }

  try {
    // Verifica se a célula existe na planilha
    if (worksheet.getCell) {
      // Preenche a célula com "( x )"
      worksheet.getCell(targetCell).value = '( x )';
      console.log(`✅ [IsGemeoProcessor] Campo "É gêmeo" preenchido com sucesso:`, {
        isGemeo: isGemeo,
        cell: targetCell,
        value: '( x )'
      });
    } else {
      console.error(`❌ [IsGemeoProcessor] Método getCell não disponível na worksheet`);
    }
  } catch (error) {
    console.error(`❌ [IsGemeoProcessor] Erro ao preencher célula ${targetCell}:`, error);
  }
}

/**
 * Função para processar o preenchimento dos campos de escolaridade na ficha
 * @param worksheet - Planilha Excel onde será feito o preenchimento
 * @param schoolingData - Dados de escolaridade do estudante
 */
function processSchoolingFields(worksheet: ExcelJS.Worksheet, schoolingData: any): void {
  console.log('🔍 [SchoolingProcessor] Processando campos de escolaridade:', {
    requerMatriculaEm: schoolingData?.requer_matricula_em,
    itinerarioFormativo: schoolingData?.itinerario_formativo
  });

  // Processa o campo "requer_matricula_em"
  if (schoolingData?.requer_matricula_em) {
    const normalizedRequerMatricula = schoolingData.requer_matricula_em.trim();
    const targetCell = requerMatriculaEmCellMapping[normalizedRequerMatricula as keyof typeof requerMatriculaEmCellMapping];

    if (targetCell) {
      try {
        if (worksheet.getCell) {
          worksheet.getCell(targetCell).value = '( x )';
          console.log(`✅ [SchoolingProcessor] Campo "requer_matricula_em" preenchido:`, {
            value: normalizedRequerMatricula,
            cell: targetCell,
            value: '( x )'
          });

          // Se é "Ensino Médio", processa também o itinerário formativo
          if (normalizedRequerMatricula === 'Ensino Médio' && schoolingData?.itinerario_formativo) {
            const normalizedItinerario = schoolingData.itinerario_formativo.trim();
            const itinerarioCell = itinerarioFormativoCellMapping[normalizedItinerario as keyof typeof itinerarioFormativoCellMapping];

            if (itinerarioCell) {
              worksheet.getCell(itinerarioCell).value = '( x )';
              console.log(`✅ [SchoolingProcessor] Campo "itinerario_formativo" preenchido:`, {
                value: normalizedItinerario,
                cell: itinerarioCell,
                value: '( x )'
              });
            } else {
              console.log('⚠️ [SchoolingProcessor] Itinerário formativo não encontrado no mapeamento:', normalizedItinerario);
              console.log('📋 [SchoolingProcessor] Opções disponíveis:', Object.keys(itinerarioFormativoCellMapping));
            }
          }
        } else {
          console.error(`❌ [SchoolingProcessor] Método getCell não disponível na worksheet`);
        }
      } catch (error) {
        console.error(`❌ [SchoolingProcessor] Erro ao preencher célula ${targetCell}:`, error);
      }
    } else {
      console.log('⚠️ [SchoolingProcessor] Valor de "requer_matricula_em" não encontrado no mapeamento:', normalizedRequerMatricula);
      console.log('📋 [SchoolingProcessor] Opções disponíveis:', Object.keys(requerMatriculaEmCellMapping));
    }
  } else {
    console.log('⚠️ [SchoolingProcessor] Campo "requer_matricula_em" não informado');
  }
}

/**
 * Função para processar o preenchimento da última série concluída na ficha
 * @param worksheet - Planilha Excel onde será feito o preenchimento
 * @param ultimaSerieConcluida - Valor do campo schoolingData.ultima_serie_concluida
 */
function processUltimaSerieConcluidaField(worksheet: ExcelJS.Worksheet, ultimaSerieConcluida: string | null | undefined): void {
  console.log('🔍 [UltimaSerieProcessor] Processando última série concluída:', {
    input: ultimaSerieConcluida,
    type: typeof ultimaSerieConcluida
  });

  // Verifica se a série foi informada
  if (!ultimaSerieConcluida || typeof ultimaSerieConcluida !== 'string') {
    console.log('⚠️ [UltimaSerieProcessor] Última série concluída não informada ou inválida:', ultimaSerieConcluida);
    return;
  }

  // Normaliza o valor removendo espaços extras e garantindo correspondência exata
  const normalizedSerie = ultimaSerieConcluida.trim();

  // Busca a célula correspondente no mapeamento
  const targetCell = ultimaSerieConcluidaCellMapping[normalizedSerie as keyof typeof ultimaSerieConcluidaCellMapping];

  if (!targetCell) {
    console.log('⚠️ [UltimaSerieProcessor] Série não encontrada no mapeamento:', normalizedSerie);
    console.log('📋 [UltimaSerieProcessor] Opções disponíveis:', Object.keys(ultimaSerieConcluidaCellMapping));
    return;
  }

  try {
    // Verifica se a célula existe na planilha
    if (worksheet.getCell) {
      // Preenche a célula com "( x )"
      worksheet.getCell(targetCell).value = '( x )';
      console.log(`✅ [UltimaSerieProcessor] Última série concluída preenchida com sucesso:`, {
        serie: normalizedSerie,
        cell: targetCell,
        value: '( x )'
      });
    } else {
      console.error(`❌ [UltimaSerieProcessor] Método getCell não disponível na worksheet`);
    }
  } catch (error) {
    console.error(`❌ [UltimaSerieProcessor] Erro ao preencher célula ${targetCell}:`, error);
  }
}

/**
 * Função para processar o preenchimento dos campos adicionais na ficha
 * @param worksheet - Planilha Excel onde será feito o preenchimento
 * @param personalData - Dados pessoais do estudante
 * @param addressData - Dados de endereço do estudante
 * @param schoolingData - Dados de escolaridade do estudante
 */
function processAdditionalFields(worksheet: ExcelJS.Worksheet, personalData: any, addressData: any, schoolingData: any): void {
  console.log('🔍 [AdditionalFieldsProcessor] Processando campos adicionais...');

  // Processa o campo "estudou_no_ceeja"
  if (schoolingData?.estudou_no_ceeja !== null && schoolingData?.estudou_no_ceeja !== undefined) {
    const targetCell = estudouNoCeejaCellMapping[schoolingData.estudou_no_ceeja];
    if (targetCell) {
      try {
        if (worksheet.getCell) {
          worksheet.getCell(targetCell).value = '( x )';
          console.log(`✅ [AdditionalFieldsProcessor] Campo "estudou_no_ceeja" preenchido:`, {
            value: schoolingData.estudou_no_ceeja,
            cell: targetCell
          });
        }
      } catch (error) {
        console.error(`❌ [AdditionalFieldsProcessor] Erro ao preencher célula ${targetCell}:`, error);
      }
    }
  }

  // Processa o campo "eliminou_disciplina"
  if (schoolingData?.eliminou_disciplina !== null && schoolingData?.eliminou_disciplina !== undefined) {
    const targetCell = eliminouDisciplinaCellMapping[schoolingData.eliminou_disciplina];
    if (targetCell) {
      try {
        if (worksheet.getCell) {
          worksheet.getCell(targetCell).value = '( x )';
          console.log(`✅ [AdditionalFieldsProcessor] Campo "eliminou_disciplina" preenchido:`, {
            value: schoolingData.eliminou_disciplina,
            cell: targetCell
          });
        }
      } catch (error) {
        console.error(`❌ [AdditionalFieldsProcessor] Erro ao preencher célula ${targetCell}:`, error);
      }
    }
  }

  // Processa o campo "eliminou_disciplina_nivel"
  if (schoolingData?.eliminou_disciplina_nivel) {
    try {
      if (worksheet.getCell) {
        worksheet.getCell('C28').value = schoolingData.eliminou_disciplina_nivel;
        console.log(`✅ [AdditionalFieldsProcessor] Campo "eliminou_disciplina_nivel" preenchido:`, {
          value: schoolingData.eliminou_disciplina_nivel,
          cell: 'C28'
        });
      }
    } catch (error) {
      console.error(`❌ [AdditionalFieldsProcessor] Erro ao preencher célula C28:`, error);
    }
  }

  // Processa o campo "eliminou_disciplinas"
  if (schoolingData?.eliminou_disciplinas) {
    const disciplinasValue = Array.isArray(schoolingData.eliminou_disciplinas)
      ? schoolingData.eliminou_disciplinas.join(', ')
      : schoolingData.eliminou_disciplinas;

    try {
      if (worksheet.getCell) {
        worksheet.getCell('I28').value = disciplinasValue;
        console.log(`✅ [AdditionalFieldsProcessor] Campo "eliminou_disciplinas" preenchido:`, {
          value: disciplinasValue,
          cell: 'I28'
        });
      }
    } catch (error) {
      console.error(`❌ [AdditionalFieldsProcessor] Erro ao preencher célula I28:`, error);
    }
  }

  // Processa o campo "is_pcd" e "deficiência"
  if (personalData?.is_pcd !== null && personalData?.is_pcd !== undefined) {
    const targetCell = isPcdCellMapping[personalData.is_pcd];
    if (targetCell) {
      try {
        if (worksheet.getCell) {
          worksheet.getCell(targetCell).value = '( x )';
          console.log(`✅ [AdditionalFieldsProcessor] Campo "is_pcd" preenchido:`, {
            value: personalData.is_pcd,
            cell: targetCell
          });

          // Se é PCD, preenche também o campo deficiência
          if (personalData.is_pcd && personalData?.deficiencia) {
            worksheet.getCell('I14').value = personalData.deficiencia;
            console.log(`✅ [AdditionalFieldsProcessor] Campo "deficiencia" preenchido:`, {
              value: personalData.deficiencia,
              cell: 'I14'
            });
          }
        }
      } catch (error) {
        console.error(`❌ [AdditionalFieldsProcessor] Erro ao preencher célula ${targetCell}:`, error);
      }
    }
  }

  // Processa o campo "zona"
  if (addressData?.zona) {
    const normalizedZona = addressData.zona.trim();
    const targetCell = zonaCellMapping[normalizedZona as keyof typeof zonaCellMapping];

    if (targetCell) {
      try {
        if (worksheet.getCell) {
          worksheet.getCell(targetCell).value = '( x )';
          console.log(`✅ [AdditionalFieldsProcessor] Campo "zona" preenchido:`, {
            value: normalizedZona,
            cell: targetCell
          });
        }
      } catch (error) {
        console.error(`❌ [AdditionalFieldsProcessor] Erro ao preencher célula ${targetCell}:`, error);
      }
    } else {
      console.log('⚠️ [AdditionalFieldsProcessor] Valor de "zona" não encontrado no mapeamento:', normalizedZona);
      console.log('📋 [AdditionalFieldsProcessor] Opções disponíveis:', Object.keys(zonaCellMapping));
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('🚀 Iniciando processamento da ficha de matrícula...');

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

    const personalDataId = student_id;

    const { data: personalData, error: personalError } = await supabaseClient
      .from('personal_data').select('*').eq('id', personalDataId).maybeSingle();
    if (personalError) throw new Error(`Erro ao buscar dados pessoais: ${personalError.message}`);
    
    if (!personalData) {
      return new Response(JSON.stringify({ error: `Registro de dados pessoais com ID ${personalDataId} não encontrado.` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const actualStudentId = personalData.student_id;

    const { data: addressData, error: addressError } = await supabaseClient
      .from('addresses').select('*').eq('student_id', actualStudentId).maybeSingle();
    if (addressError) throw new Error(`Erro ao buscar endereço: ${addressError.message}`);
      
    const { data: schoolingData, error: schoolingError } = await supabaseClient
      .from('schooling_data').select('*').eq('student_id', actualStudentId).maybeSingle();
    if (schoolingError) throw new Error(`Erro ao buscar dados de escolaridade: ${schoolingError.message}`);

    const studentFullData = { personalData, addressData, schoolingData };

    // Validação do token de autenticação
    console.log('Validando token de autenticação...');
    if (!validateTokenUrl(EXCEL_TEMPLATE_URL)) {
      throw new Error('URL do token de autenticação inválida');
    }

    // Testa se a URL do token está acessível
    console.log('Testando acessibilidade da URL do token...');
    const isTokenAccessible = await validateTokenAccessibility(EXCEL_TEMPLATE_URL);
    if (!isTokenAccessible) {
      console.warn('⚠️ URL do token pode não estar acessível, mas continuando...');
      // Não falha completamente, pois pode ser um problema temporário
    }

    // Download do template com validação e retry
    console.log('Iniciando download do template Excel...');
    const excelArrayBuffer = await downloadTemplateWithRetry(EXCEL_TEMPLATE_URL);
    console.log(`Template Excel baixado e validado. Tamanho: ${excelArrayBuffer.byteLength} bytes.`);

    console.log('Carregando workbook Excel...');
    const workbook = new ExcelJS.Workbook();

    // Validação adicional do workbook
    if (!workbook || typeof workbook.xlsx === 'undefined') {
      throw new Error('Instância do workbook ExcelJS não foi criada corretamente');
    }

    let worksheet: ExcelJS.Worksheet | null = null;

    try {
      await workbook.xlsx.load(excelArrayBuffer);
      console.log('Workbook carregado com sucesso do Storage.');

      // Validação do workbook
      if (!validateWorkbook(workbook)) {
        throw new Error('Workbook carregado é inválido');
      }

      // Validação do workbook
      worksheet = workbook.getWorksheet('Plan1');
      if (!worksheet) {
        throw new Error(`A planilha "Plan1" não foi encontrada no arquivo. Planilhas disponíveis: ${workbook.worksheets.map(ws => ws.name).join(', ')}`);
      }

      console.log(`Planilha "Plan1" encontrada com ${worksheet.rowCount} linhas e ${worksheet.columnCount} colunas.`);
      console.log('Worksheet definido com sucesso:', !!worksheet);
    } catch (error) {
      console.error('Erro ao carregar workbook:', error);
      if (error instanceof Error) {
        throw new Error(`Falha ao processar o arquivo Excel: ${error.message}`);
      } else {
        throw new Error('Falha ao processar o arquivo Excel: erro desconhecido');
      }
    }

    // Validação adicional da worksheet
    if (!validateWorksheet(worksheet)) {
      console.error('ERRO CRÍTICO: worksheet não passou na validação após carregamento do workbook');
      throw new Error('Worksheet não foi inicializado corretamente ou não possui métodos necessários');
    }

    console.log('🚀 Iniciando preenchimento dos dados no template Excel...');
    console.log('📊 [ExcelFormatter] IMPORTANTE: Formatação de data será aplicada APENAS no Excel (formato brasileiro)');
    console.log('📊 [ExcelFormatter] Banco de dados mantém formato ISO para evitar erros do PostgreSQL');
    console.log('Worksheet válido para preenchimento:', {
        name: worksheet.name,
        rowCount: worksheet.rowCount,
        columnCount: worksheet.columnCount,
        hasGetCell: typeof worksheet.getCell === 'function'
    });

    for (const [path, cell] of Object.entries(cellMapping)) {
      try {
        // Verificação adicional antes de cada célula
        if (!validateWorksheet(worksheet)) {
          throw new Error('Worksheet se tornou inválida durante o preenchimento');
        }

        const rawValue = get(studentFullData, path, null);

        // Aplica formatação especial para campos de data usando função específica
        let processedValue = rawValue;
        if (path.includes('data_nascimento') && rawValue && typeof rawValue === 'string') {
            // Converte data ISO para formato brasileiro usando função específica para Excel
            processedValue = formatDateForExcel(rawValue);
            console.log(`📅 [ExcelDateFormatter] Data de nascimento formatada para Excel: "${rawValue}" -> "${processedValue}"`);
        }

        const sanitizedValue = sanitizeString(processedValue);

        // Verificação adicional antes de acessar a célula
        if (worksheet.getCell) {
          worksheet.getCell(cell).value = sanitizedValue;
          console.log(`Campo ${path} -> Célula ${cell}: "${rawValue}" -> "${processedValue}" -> "${sanitizedValue}"`);
        } else {
          console.error(`Método getCell não disponível na worksheet para célula ${cell}`);
          throw new Error('Worksheet não possui método getCell');
        }
      } catch (cellError) {
        console.error(`Erro ao preencher célula ${cell} com campo ${path}:`, cellError);
        throw new Error(`Falha ao preencher campo ${path}: ${cellError instanceof Error ? cellError.message : 'erro desconhecido'}`);
      }
    }
    console.log('✅ Preenchimento dos dados concluído.');
    console.log('📊 [ExcelFormatter] RESUMO: Formatação aplicada apenas no Excel');
    console.log('📊 [ExcelFormatter] - Banco: formato ISO (1990-12-25) ✅');
    console.log('📊 [ExcelFormatter] - Excel: formato brasileiro (25/12/1990) ✅');
    console.log('📊 [ExcelFormatter] - PostgreSQL: sem erros de formato ✅');

    // Processa o preenchimento da raça/cor
    console.log('🔍 [RacaCorProcessor] Iniciando processamento da raça/cor...');
    processRacaCorField(worksheet, personalData.raca_cor);
    console.log('✅ [RacaCorProcessor] Processamento da raça/cor concluído.');

    // Processa o preenchimento do campo "É gêmeo"
    console.log('🔍 [IsGemeoProcessor] Iniciando processamento do campo "É gêmeo"...');
    processIsGemeoField(worksheet, personalData.is_gemeo);
    console.log('✅ [IsGemeoProcessor] Processamento do campo "É gêmeo" concluído.');

    // Processa o preenchimento dos campos de escolaridade
    console.log('🔍 [SchoolingProcessor] Iniciando processamento dos campos de escolaridade...');
    processSchoolingFields(worksheet, schoolingData);
    console.log('✅ [SchoolingProcessor] Processamento dos campos de escolaridade concluído.');

    // Processa o preenchimento dos campos adicionais
    console.log('🔍 [AdditionalFieldsProcessor] Iniciando processamento dos campos adicionais...');
    processAdditionalFields(worksheet, personalData, addressData, schoolingData);
    console.log('✅ [AdditionalFieldsProcessor] Processamento dos campos adicionais concluído.');

    // Processa o preenchimento da última série concluída
    console.log('🔍 [UltimaSerieProcessor] Iniciando processamento da última série concluída...');
    processUltimaSerieConcluidaField(worksheet, schoolingData?.ultima_serie_concluida);
    console.log('✅ [UltimaSerieProcessor] Processamento da última série concluída concluído.');

    console.log(' Gerando buffer final do Excel...');
    let finalExcelBuffer: ArrayBuffer;

    try {
      console.log('📝 Iniciando escrita do workbook...');
      finalExcelBuffer = await workbook.xlsx.writeBuffer();
      console.log(`✅ Buffer final do Excel gerado. Tamanho: ${finalExcelBuffer.byteLength} bytes.`);

      // Validação final do buffer com contexto detalhado
      if (!validateExcelBuffer(finalExcelBuffer, 'buffer-final')) {
        console.error('❌ Buffer final do Excel inválido após geração');
        throw new Error('Buffer final do Excel inválido após geração');
      }

      // Validação adicional de integridade
      const bufferArray = new Uint8Array(finalExcelBuffer);
      const hasValidSignature = bufferArray[0] === 0x50 && bufferArray[1] === 0x4B && bufferArray[2] === 0x03 && bufferArray[3] === 0x04;

      if (!hasValidSignature) {
        console.error('❌ Assinatura ZIP inválida no buffer final');
        console.error('🔍 Primeiros bytes do buffer:', Array.from(bufferArray.slice(0, 20)));
        throw new Error('Buffer final não possui assinatura ZIP válida');
      }

      // Verificar se o tamanho do arquivo está dentro de limites razoáveis
      const MIN_SIZE = 1024; // 1KB mínimo
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB máximo

      if (finalExcelBuffer.byteLength < MIN_SIZE) {
        console.error(`❌ Arquivo Excel muito pequeno: ${finalExcelBuffer.byteLength} bytes (mínimo: ${MIN_SIZE})`);
        throw new Error('Arquivo Excel gerado é muito pequeno');
      }

      if (finalExcelBuffer.byteLength > MAX_SIZE) {
        console.error(`❌ Arquivo Excel muito grande: ${finalExcelBuffer.byteLength} bytes (máximo: ${MAX_SIZE})`);
        throw new Error('Arquivo Excel gerado é muito grande');
      }

      // Verificação de estrutura ZIP adicional
      const zipEntries = countZipEntries(bufferArray);
      console.log(`📦 Buffer contém ${zipEntries} entradas ZIP`);

      // Logs detalhados para debugging
      console.log('✅ Validação final do Excel concluída com sucesso');
      console.log('📊 Estatísticas detalhadas do buffer final:', {
        size: finalExcelBuffer.byteLength,
        hasValidSignature,
        zipEntries,
        firstBytes: Array.from(bufferArray.slice(0, 10)),
        lastBytes: Array.from(bufferArray.slice(-10)),
        sizeRange: finalExcelBuffer.byteLength >= MIN_SIZE && finalExcelBuffer.byteLength <= MAX_SIZE ? 'válido' : 'inválido'
      });

      // Criar nome do arquivo baseado nos dados do estudante
      const studentName = sanitizeString(personalData.nome_completo || 'estudante');
      const safeFileName = studentName.replace(/[^a-zA-Z0-9]/g, '_') || 'estudante';
      const fileName = `FICHA_DE_MATRICULA_${safeFileName}_${personalData.id}.xlsx`;

      console.log('📁 Nome do arquivo gerado:', fileName);
      console.log('📊 Headers de resposta configurados:', {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        contentDisposition: `attachment; filename="${fileName}"`,
        contentLength: finalExcelBuffer.byteLength,
        cacheControl: 'no-cache'
      });

      // ABORDAGEM BASE64: Mais confiável para transmissão HTTP
      console.log('🔄 Convertendo para base64...');
      console.log('📊 Buffer final - Tamanho:', finalExcelBuffer.byteLength);

      // Converte ArrayBuffer para base64 com validação
      const uint8Array = new Uint8Array(finalExcelBuffer);
      console.log('📊 Uint8Array criado:', uint8Array.length, 'bytes');

      let base64String; // Declara a variável fora do try
      try {
        const binaryString = uint8ToBinaryString(uint8Array);
        console.log('📊 String binária criada:', binaryString.length, 'caracteres');

        // Usa fallback seguro para base64
        if (globalThis.btoa) {
          base64String = btoa(binaryString);
        } else {
          // Fallback para ambientes que não têm btoa (como alguns runtimes Edge)
          try {
            // Tenta usar Buffer se disponível (Node.js/Deno)
            base64String = Buffer.from(binaryString, 'binary').toString('base64');
          } catch (bufferError) {
            // Último fallback: implementação manual de base64
            console.warn('Buffer não disponível, usando implementação manual de base64');
            base64String = manualBase64Encode(binaryString);
          }
        }
        console.log('✅ Conversão base64 concluída:', base64String.length, 'caracteres');

        // Validação da string base64
        if (base64String.length === 0) {
          throw new Error('String base64 resultante está vazia');
        }

        // Verifica se a string base64 é válida (só contém caracteres válidos)
        const invalidChars = base64String.match(/[^A-Za-z0-9+/=]/g);
        if (invalidChars) {
          console.warn('⚠️ String base64 contém caracteres inválidos:', invalidChars.slice(0, 10));
        }

        // Verifica se o tamanho está dentro do esperado (aproximadamente 4/3 do original)
        const expectedMinSize = Math.floor((finalExcelBuffer.byteLength * 4) / 3);
        const expectedMaxSize = Math.ceil((finalExcelBuffer.byteLength * 4) / 3) + 4; // + padding

        if (base64String.length < expectedMinSize || base64String.length > expectedMaxSize) {
          console.warn(`⚠️ Tamanho da string base64 inesperado: ${base64String.length} (esperado: ${expectedMinSize}-${expectedMaxSize})`);
        }

        console.log('📊 Comparação de tamanhos:', {
          original: finalExcelBuffer.byteLength,
          base64: base64String.length,
          ratio: (base64String.length / finalExcelBuffer.byteLength).toFixed(2)
        });

        // Verificação final da integridade da string base64
        try {
          // Testa se a string base64 pode ser decodificada de volta
          let testDecoded;
          if (globalThis.atob) {
            testDecoded = atob(base64String);
          } else {
            try {
              testDecoded = Buffer.from(base64String, 'base64').toString('binary');
            } catch (bufferError) {
              console.warn('Buffer não disponível para decodificação, usando implementação manual');
              testDecoded = manualBase64Decode(base64String);
            }
          }
          const testBuffer = new Uint8Array(testDecoded.length);
          for (let i = 0; i < testDecoded.length; i++) {
            testBuffer[i] = testDecoded.charCodeAt(i);
          }

          if (testBuffer.length !== finalExcelBuffer.byteLength) {
            console.warn(`⚠️ Tamanho do buffer decodificado difere: ${testBuffer.length} vs ${finalExcelBuffer.byteLength}`);
          } else {
            console.log('✅ Validação base64: decodificação bem-sucedida');
          }
        } catch (decodeError) {
          console.error('❌ Erro ao validar decodificação base64:', decodeError);
          throw new Error('String base64 inválida');
        }

        // Logs finais detalhados
        console.log('🎉 Excel gerado com sucesso! Resumo final:');
        console.log('📋 Resumo da operação:', {
          studentId: actualStudentId,
          fileName: fileName,
          originalSize: finalExcelBuffer.byteLength,
          base64Size: base64String ? base64String.length : 'erro na conversão',
          compressionRatio: base64String ? ((finalExcelBuffer.byteLength - base64String.length) / finalExcelBuffer.byteLength * 100).toFixed(2) + '%' : 'erro na conversão',
          processingTime: Date.now() - startTime + 'ms'
        });
      } catch (base64Error) {
        console.error('❌ Erro ao converter para base64:', base64Error);
        console.error('🔍 Detalhes do erro de conversão:', {
          name: base64Error instanceof Error ? base64Error.name : 'Unknown',
          message: base64Error instanceof Error ? base64Error.message : 'Erro desconhecido',
          stack: base64Error instanceof Error ? base64Error.stack : undefined
        });
        base64String = null; // Define como null para evitar erro de referência
        throw new Error(`Falha na conversão base64: ${base64Error instanceof Error ? base64Error.message : 'erro desconhecido'}`);
      }

      // Verifica se a conversão base64 foi bem-sucedida
      if (!base64String) {
        throw new Error('Falha na conversão base64 - base64String é null');
      }

      // Retorna como JSON com dados base64
      return new Response(JSON.stringify({
        success: true,
        fileName: fileName,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        data: base64String,
        size: finalExcelBuffer.byteLength,
        metadata: {
          studentId: actualStudentId,
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - startTime
        }
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (error) {
      console.error('Erro ao gerar buffer final do Excel:', error);
      if (error instanceof Error) {
        throw new Error(`Falha ao gerar o arquivo Excel final: ${error.message}`);
      } else {
        throw new Error('Falha ao gerar o arquivo Excel final: erro desconhecido');
      }
    }

  } catch (error) {
    console.error("[FUNCTION ERROR]", error);

    // Tratamento específico de diferentes tipos de erro
    let errorMessage = 'Erro interno do servidor';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Erros de validação
      if (errorMessage.includes('não foi fornecido') || errorMessage.includes('não encontrado')) {
        statusCode = 400;
      } else if (errorMessage.includes('não foi encontrada')) {
        statusCode = 404;
      } else if (errorMessage.includes('Falha ao buscar') || errorMessage.includes('HTTP')) {
        statusCode = 502; // Bad Gateway
      } else if (errorMessage.includes('token') || errorMessage.includes('autenticação')) {
        statusCode = 401; // Unauthorized
      } else if (errorMessage.includes('Excel') || errorMessage.includes('Buffer')) {
        statusCode = 422; // Unprocessable Entity - erro específico de processamento do Excel
      } else if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
        statusCode = 408; // Request Timeout
      }
    } else {
      errorMessage = 'Erro desconhecido';
    }

    console.error(`💥 Erro final - Status: ${statusCode}, Mensagem: ${errorMessage}`);
    console.error('🔍 Detalhes do erro:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      error: errorMessage,
      statusCode,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      details: error instanceof Error ? {
        name: error.name,
        stack: error.stack
      } : undefined
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
