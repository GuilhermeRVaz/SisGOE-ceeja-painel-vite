// =====================================================================
// TIPOS DE ESTUDANTE
// =====================================================================

export interface Student {
  id: string | number;
  nome: string;
  email: string;
  telefone?: string;
  data_nascimento?: string;
  cpf?: string;
  rg?: string;
  nome_mae?: string;
  nome_pai?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id?: string | number;
  student_id: string | number;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolingData {
  id?: string | number;
  student_id: string | number;
  escolaridade_anterior?: string;
  escola_origem?: string;
  ano_conclusao?: string;
  modalidade_ensino?: string;
  turno_preferencia?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Enrollment {
  id: string | number;
  student_id: string | number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// Opções para dropdowns
export const ESCOLARIDADE_OPTIONS = [
  { id: 'fundamental_incompleto', name: 'Ensino Fundamental Incompleto' },
  { id: 'fundamental_completo', name: 'Ensino Fundamental Completo' },
  { id: 'medio_incompleto', name: 'Ensino Médio Incompleto' },
  { id: 'medio_completo', name: 'Ensino Médio Completo' },
  { id: 'superior_incompleto', name: 'Ensino Superior Incompleto' },
  { id: 'superior_completo', name: 'Ensino Superior Completo' }
];

export const MODALIDADE_ENSINO_OPTIONS = [
  { id: 'presencial', name: 'Presencial' },
  { id: 'ead', name: 'Educação a Distância' },
  { id: 'hibrido', name: 'Híbrido' }
];

export const TURNO_OPTIONS = [
  { id: 'matutino', name: 'Matutino' },
  { id: 'vespertino', name: 'Vespertino' },
  { id: 'noturno', name: 'Noturno' }
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
