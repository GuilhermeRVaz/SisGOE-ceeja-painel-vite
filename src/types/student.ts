// =====================================================================
// MODELOS DE DADOS FIÉIS AO PROJETO FLUTTER
// =====================================================================

export interface PersonalDataModel {
  // Dados de Identificação
  nome_completo?: string;
  tem_nome_social: boolean;
  nome_social?: string;
  tem_nome_afetivo: boolean;
  nome_afetivo?: string;
  sexo?: string;
  rg?: string;
  rg_digito?: string;
  rg_uf?: string;
  rg_data_emissao?: string; // ISO 8601 string
  cpf?: string;
  raca_cor?: string;
  data_nascimento?: string; // ISO 8601 string
  idade?: number;

  // Filiação
  nome_mae?: string;
  nome_pai?: string;

  // Nacionalidade
  nacionalidade?: string;
  nascimento_uf?: string;
  nascimento_cidade?: string;
  pais_origem?: string;

  // Contato e Conectividade
  possui_internet?: boolean;
  possui_device?: boolean;
  telefone?: string;
  email?: string;

  // Outros
  is_gemeo?: boolean;
  nome_gemeo?: string;
  trabalha?: boolean;
  profissao?: string;
  empresa?: string;
  is_pcd?: boolean;
  deficiencia?: string;
}

export interface AddressModel {
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  nomeCidade?: string;
  ufCidade?: string;
  zona?: 'Urbana' | 'Rural';
  temLocalizacaoDiferenciada: boolean;
  localizacaoDiferenciada?: 'Área de assentamento' | 'Terra indígena' | 'Área quilombola';
}

export interface SchoolingModel {
  // Nível de Ensino
  nivel_ensino?: string;
  requer_matricula_em?: string;
  itinerario_formativo?: string;
  ultima_serie_concluida?: string;
  ra?: string;
  tipo_escola?: string;
  nome_escola?: string;

  // Histórico CEEJA
  estudou_no_ceeja?: boolean;

  // Dependências
  tem_progressao_parcial?: boolean;
  progressao_parcial_disciplinas?: Record<string, string[]>;

  // Eliminações
  eliminou_disciplina?: boolean;
  eliminou_disciplina_nivel?: string;
  eliminou_disciplinas?: string[];

  // Opcionais
  optou_ensino_religioso?: boolean;
  optou_educacao_fisica?: boolean;

  // Termos
  aceitou_termos?: boolean;
  data_aceite?: string; // ISO 8601 string
}


// =====================================================================
// OPÇÕES PARA FORMULÁRIOS (SELECTS, DROPDOWNS, AUTOCOMPLETE)
// =====================================================================

export const RACA_COR_OPTIONS = [
  { id: 'Não declarada', name: 'Não declarada' },
  { id: 'Branca', name: 'Branca' },
  { id: 'Preta', name: 'Preta' },
  { id: 'Parda', name: 'Parda' },
  { id: 'Amarela', name: 'Amarela' },
  { id: 'Indígena', name: 'Indígena' },
  { id: 'Quilombola', name: 'Quilombola' }
];

export const SEXO_OPTIONS = [
  { id: 'Masculino', name: 'Masculino' },
  { id: 'Feminino', name: 'Feminino' },
  { id: 'Não Binário', name: 'Não Binário' },
  { id: 'Outro', name: 'Outro' },
  { id: 'Prefiro não informar', name: 'Prefiro não informar' }
];

export const NACIONALIDADE_OPTIONS = [
  { id: 'Brasileira', name: 'Brasileira' },
  { id: 'Estrangeira', name: 'Estrangeira' }
];

export const ESCOLARIDADE_OPTIONS = [
  { id: 'Ensino Fundamental Incompleto', name: 'Ensino Fundamental Incompleto' },
  { id: 'Ensino Fundamental Completo', name: 'Ensino Fundamental Completo' },
  { id: 'Ensino Médio Incompleto', name: 'Ensino Médio Incompleto' },
  { id: 'Ensino Médio Completo', name: 'Ensino Médio Completo' },
  { id: 'Ensino Superior Incompleto', name: 'Ensino Superior Incompleto' },
  { id: 'Ensino Superior Completo', name: 'Ensino Superior Completo' }
];

export const ESTADOS_BRASIL = [
  { id: 'AC', name: 'Acre' },
  { id: 'AL', name: 'Alagoas' },
  { id: 'AP', name: 'Amapá' },
  { id: 'AM', name: 'Amazonas' },
  { id: 'BA', name: 'Bahia' },
  { id: 'CE', name: 'Ceará' },
  { id: 'DF', name: 'Distrito Federal' },
  { id: 'ES', name: 'Espírito Santo' },
  { id: 'GO', name: 'Goiás' },
  { id: 'MA', name: 'Maranhão' },
  { id: 'MT', name: 'Mato Grosso' },
  { id: 'MS', name: 'Mato Grosso do Sul' },
  { id: 'MG', name: 'Minas Gerais' },
  { id: 'PA', name: 'Pará' },
  { id: 'PB', name: 'Paraíba' },
  { id: 'PR', name: 'Paraná' },
  { id: 'PE', name: 'Pernambuco' },
  { id: 'PI', name: 'Piauí' },
  { id: 'RJ', name: 'Rio de Janeiro' },
  { id: 'RN', name: 'Rio Grande do Norte' },
  { id: 'RS', name: 'Rio Grande do Sul' },
  { id: 'RO', name: 'Rondônia' },
  { id: 'RR', name: 'Roraima' },
  { id: 'SC', name: 'Santa Catarina' },
  { id: 'SP', name: 'São Paulo' },
  { id: 'SE', name: 'Sergipe' },
  { id: 'TO', name: 'Tocantins' }
];

export const ZONA_RESIDENCIAL_OPTIONS = [
    { id: 'Urbana', name: 'Urbana' },
    { id: 'Rural', name: 'Rural' }
];

export const LOCALIZACAO_DIFERENCIADA_OPTIONS = [
    { id: 'Área de assentamento', name: 'Área de assentamento' },
    { id: 'Terra indígena', name: 'Terra indígena' },
    { id: 'Área quilombola', name: 'Área quilombola' }
];

// --- OPÇÕES PARA ESCOLARIDADE REATIVA ---

export const SERIES_FUNDAMENTAL = [
    { id: '4ª Série Ensino Fundamental', name: '4ª Série Ensino Fundamental' },
    { id: '5ª Série Ensino Fundamental', name: '5ª Série Ensino Fundamental' },
    { id: '6ª Série Ensino Fundamental', name: '6ª Série Ensino Fundamental' },
    { id: '7ª Série Ensino Fundamental', name: '7ª Série Ensino Fundamental' },
    { id: '8ª Série Ensino Fundamental', name: '8ª Série Ensino Fundamental' },
];

export const SERIES_MEDIO = [
    { id: '8ª Série Ensino Fundamental', name: '8ª Série Ensino Fundamental' },
    { id: '1ª Série do Ensino Médio', name: '1ª Série do Ensino Médio' },
    { id: '2ª Série do Ensino Médio', name: '2ª Série do Ensino Médio' },
    { id: '3ª Série do Ensino Médio', name: '3ª Série do Ensino Médio' },
];

export const DISCIPLINAS_FUNDAMENTAL = [
    { id: 'Língua Portuguesa', name: 'Língua Portuguesa' },
    { id: 'Arte', name: 'Arte' },
    { id: 'Língua Inglesa', name: 'Língua Inglesa' },
    { id: 'Matemática', name: 'Matemática' },
    { id: 'Ciências', name: 'Ciências' },
    { id: 'História', name: 'História' },
    { id: 'Geografia', name: 'Geografia' },
    { id: 'Educação Física', name: 'Educação Física' },
];

export const DISCIPLINAS_MEDIO = [
    { id: 'Língua Portuguesa', name: 'Língua Portuguesa' },
    { id: 'Arte', name: 'Arte' },
    { id: 'Língua Inglesa', name: 'Língua Inglesa' },
    { id: 'Matemática', name: 'Matemática' },
    { id: 'Biologia', name: 'Biologia' },
    { id: 'Química', name: 'Química' },
    { id: 'Física', name: 'Física' },
    { id: 'História', name: 'História' },
    { id: 'Geografia', name: 'Geografia' },
    { id: 'Sociologia', name: 'Sociologia' },
    { id: 'Filosofia', name: 'Filosofia' },
    { id: 'Educação Física', name: 'Educação Física' },
];

export const ITINERARIOS_FORMATIVOS = [
    { id: 'Linguagens e Ciências Humanas', name: 'Linguagens e Ciências Humanas' },
    { id: 'Matemática e Ciências da Natureza', name: 'Matemática e Ciências da Natureza' },
];
