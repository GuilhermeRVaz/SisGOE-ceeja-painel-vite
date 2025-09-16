// ARQUIVO: src/components/panels/PainelEdicao/AbaEscolaridade.tsx
import React from 'react';
import {
    TextInput,
    BooleanInput,
    DateInput,
    ArrayInput,
    SimpleFormIterator,
    SelectInput,
    FormDataConsumer,
    RadioButtonGroupInput,
    CheckboxGroupInput,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { validateRequired, validateTerms } from '../../../core/utils/validators';
import { 
    SERIES_FUNDAMENTAL, 
    SERIES_MEDIO, 
    ITINERARIOS_FORMATIVOS,
    DISCIPLINAS_FUNDAMENTAL,
    DISCIPLINAS_MEDIO
} from '../../../types/student';

export const AbaEscolaridade = () => (
    <Box p={3}>
        <Typography variant="h6" color="primary" gutterBottom>
            Dados de Escolaridade
        </Typography>
        
        <FormSection title="Nível de Ensino">
            <RadioButtonGroupInput 
                source="schooling_data.requer_matricula_em" 
                label="Requer Matrícula em:"
                choices={[
                    { id: 'Ensino Fundamental', name: 'Ensino Fundamental' },
                    { id: 'Ensino Médio', name: 'Ensino Médio' },
                ]}
            />

            <FormDataConsumer>
                {({ formData, ...rest }) => {
                    const nivel = formData.schooling_data?.requer_matricula_em;
                    if (!nivel) return null;

                    const seriesOptions = nivel === 'Ensino Fundamental' ? SERIES_FUNDAMENTAL : SERIES_MEDIO;

                    return (
                        <Box sx={{ mt: 2, width: '100%' }}>
                            <SelectInput 
                                source="schooling_data.ultima_serie_concluida"
                                label="Última série concluída"
                                choices={seriesOptions}
                                fullWidth
                                {...rest}
                            />
                            {nivel === 'Ensino Médio' && (
                                <SelectInput 
                                    source="schooling_data.itinerario_formativo"
                                    label="Área do Itinerário Formativo"
                                    choices={ITINERARIOS_FORMATIVOS}
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    {...rest}
                                />
                            )}
                        </Box>
                    );
                }}
            </FormDataConsumer>
        </FormSection>

        <FormSection title="Dados de Registro">
            <TextInput source="schooling_data.ra" label="RA (Registro do Aluno)" fullWidth />
            <SelectInput 
                source="schooling_data.tipo_escola" 
                label="Tipo de Escola" 
                choices={[{id: 'Pública', name: 'Pública'}, {id: 'Privada', name: 'Privada'}]}
                fullWidth 
                sx={{ mt: 2 }}
            />
            <TextInput source="schooling_data.nome_escola" label="Nome da Escola" fullWidth sx={{ mt: 2 }}/>
        </FormSection>

        <FormSection title="Histórico Acadêmico">
            <BooleanInput source="schooling_data.estudou_no_ceeja" label="Já estudou no CEEJA de Lins antes?" />
            <BooleanInput source="schooling_data.tem_progressao_parcial" label="Tem Progressão Parcial (dependência)?" />
            
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.schooling_data?.tem_progressao_parcial && (
                    <Box sx={{ pl: 2, borderLeft: '2px solid #ccc', mt: 1, mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Adicionar Disciplinas em Progressão Parcial</Typography>
                        <ArrayInput source="schooling_data.progressao_parcial_disciplinas" label="">
                            <SimpleFormIterator>
                                <TextInput source="serie" label="Série da Dependência" helperText="Ex: 8ª Série Ensino Fundamental" fullWidth />
                                <TextInput source="disciplinas" label="Disciplinas em DP" helperText="Separar por vírgula. Ex: Matemática, Português" fullWidth />
                            </SimpleFormIterator>
                        </ArrayInput>
                    </Box>
                )}
            </FormDataConsumer>

            <BooleanInput source="schooling_data.eliminou_disciplina" label="Eliminou Disciplina por ENCCEJA, ENEM, etc.?" />

            <FormDataConsumer>
                {({ formData, ...rest }) => {
                    if (!formData.schooling_data?.eliminou_disciplina) return null;
                    
                    const nivelEliminacao = formData.schooling_data?.eliminou_disciplina_nivel;
                    const disciplineOptions = nivelEliminacao === 'Ensino Fundamental' 
                        ? DISCIPLINAS_FUNDAMENTAL 
                        : DISCIPLINAS_MEDIO;

                    return (
                        <Box sx={{ pl: 2, borderLeft: '2px solid #ccc', mt: 1, mb: 2 }}>
                            <RadioButtonGroupInput 
                                source="schooling_data.eliminou_disciplina_nivel" 
                                label="Nível da Eliminação"
                                choices={[
                                    { id: 'Ensino Fundamental', name: 'Ensino Fundamental' },
                                    { id: 'Ensino Médio', name: 'Ensino Médio' },
                                ]}
                                {...rest}
                            />
                            {nivelEliminacao && (
                                <CheckboxGroupInput
                                    source="schooling_data.eliminou_disciplinas"
                                    label="Disciplinas Eliminadas"
                                    choices={disciplineOptions}
                                    {...rest}
                                />
                            )}
                        </Box>
                    );
                }}
            </FormDataConsumer>
        </FormSection>

        <FormSection title="Disciplinas Opcionais">
            <BooleanInput source="schooling_data.optou_ensino_religioso" label="Optou por Ensino Religioso?" />
            <BooleanInput source="schooling_data.optou_educacao_fisica" label="Optou por Educação Física?" />
        </FormSection>

        <FormSection title="Termos de Matrícula">
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Declaro que todas informações são verdadeiras. Declaro que tenho condições de comparecer às orientações e avaliações. Declaro ciência de que terei minha matrícula cancelada caso não tenha pelo menos 1 (um) comparecimento por mês e que devo efetuar minha rematricula a cada ano.
            </Typography>
            <BooleanInput source="schooling_data.aceitou_termos" label="Li e aceito os termos" validate={validateTerms} />
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.schooling_data?.aceitou_termos &&
                    <DateInput source="schooling_data.data_aceite" label="Data de Aceite" fullWidth disabled {...rest} />
                }
            </FormDataConsumer>
        </FormSection>
    </Box>
);

// Componente auxiliar para agrupar seções do formulário
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="subtitle1" color="primary" gutterBottom>
            {title}
        </Typography>
        <Box sx={{ pl: 2 }}>
            {children}
        </Box>
    </Box>
);

