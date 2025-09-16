// ARQUIVO: src/components/panels/PainelEdicao/AbaDadosPessoais.tsx
import React from 'react';
import {
    TextInput,
    BooleanInput,
    DateInput,
    SelectInput,
    FormDataConsumer,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { 
    RACA_COR_OPTIONS, 
    SEXO_OPTIONS, 
    NACIONALIDADE_OPTIONS,
    ESTADOS_BRASIL
} from '../../../types/student';
import {
    validateRequired,
    validateEmail,
    validateCpf,
    validatePhone
} from '../../../core/utils/validators';

export const AbaDadosPessoais = () => (
    <Box p={3}>
        <Typography variant="h6" color="primary" gutterBottom>
            Dados Pessoais do Aluno
        </Typography>
        
        {/* Seção: Identificação */}
        <Typography variant="subtitle1" color="primary" sx={{ mt: 2, mb: 1 }}>
            Identificação
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 100%', minWidth: '300px' }}>
                <TextInput source="nome_completo" label="Nome Completo" fullWidth validate={validateRequired} />
            </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: '0 0 auto' }}>
                <BooleanInput source="tem_nome_social" label="Tem Nome Social?" />
            </Box>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.tem_nome_social &&
                    <Box sx={{ flex: '1 1 70%', minWidth: '200px' }}>
                        <TextInput source="nome_social" label="Nome Social" fullWidth {...rest} />
                    </Box>
                }
            </FormDataConsumer>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: '0 0 auto' }}>
                <BooleanInput source="tem_nome_afetivo" label="Tem Nome Afetivo?" />
            </Box>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.tem_nome_afetivo &&
                    <Box sx={{ flex: '1 1 70%', minWidth: '200px' }}>
                        <TextInput source="nome_afetivo" label="Nome Afetivo" fullWidth {...rest} />
                    </Box>
                }
            </FormDataConsumer>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 30%', minWidth: '150px' }}>
                <SelectInput source="sexo" label="Sexo" choices={SEXO_OPTIONS} fullWidth validate={validateRequired} />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '150px' }}>
                <SelectInput source="raca_cor" label="Raça/Cor" choices={RACA_COR_OPTIONS} fullWidth validate={validateRequired} />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '150px' }}>
                <DateInput source="data_nascimento" label="Data de Nascimento" fullWidth validate={validateRequired} />
            </Box>
        </Box>

        {/* Seção: Documentos */}
        <Typography variant="subtitle1" color="primary" sx={{ mt: 3, mb: 1 }}>
            Documentos de Identificação
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 35%', minWidth: '200px' }}>
                <TextInput source="rg" label="RG" fullWidth validate={validateRequired} />
            </Box>
            <Box sx={{ flex: '1 1 10%', minWidth: '80px' }}>
                <TextInput source="rg_digito" label="Dígito" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 15%', minWidth: '100px' }}>
                <SelectInput source="rg_uf" label="UF" choices={ESTADOS_BRASIL} fullWidth validate={validateRequired} />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <DateInput source="rg_data_emissao" label="Data de Emissão" fullWidth validate={validateRequired} />
            </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
             <Box sx={{ flex: '1 1 100%', minWidth: '200px' }}>
                <TextInput source="cpf" label="CPF" fullWidth validate={[validateRequired, validateCpf]} />
            </Box>
        </Box>

        {/* Seção: Filiação */}
        <Typography variant="subtitle1" color="primary" sx={{ mt: 3, mb: 1 }}>
            Filiação e Origem
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="nome_mae" label="Nome da Mãe" fullWidth validate={validateRequired} />
            </Box>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="nome_pai" label="Nome do Pai" fullWidth />
            </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <SelectInput source="nacionalidade" label="Nacionalidade" choices={NACIONALIDADE_OPTIONS} fullWidth validate={validateRequired} />
            </Box>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.nacionalidade === 'Estrangeira' &&
                    <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                        <TextInput source="pais_origem" label="País de Origem" fullWidth validate={validateRequired} {...rest} />
                    </Box>
                }
            </FormDataConsumer>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <SelectInput source="nascimento_uf" label="UF de Nascimento" choices={ESTADOS_BRASIL} fullWidth validate={validateRequired} />
            </Box>
            <Box sx={{ flex: '1 1 35%', minWidth: '200px' }}>
                <TextInput source="nascimento_cidade" label="Cidade de Nascimento" fullWidth validate={validateRequired} />
            </Box>
        </Box>

        {/* Seção: Contato */}
        <Typography variant="subtitle1" color="primary" sx={{ mt: 3, mb: 1 }}>
            Contato e Tecnologia
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="telefone" label="Telefone" fullWidth validate={[validateRequired, validatePhone]} />
            </Box>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="email" label="E-mail" fullWidth type="email" validate={[validateRequired, validateEmail]} />
            </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 25%', minWidth: '150px' }}>
                <BooleanInput source="possui_internet" label="Possui Internet?" />
            </Box>
            <Box sx={{ flex: '1 1 25%', minWidth: '150px' }}>
                <BooleanInput source="possui_device" label="Possui Dispositivo?" />
            </Box>
        </Box>

        {/* Seção: Informações Adicionais */}
        <Typography variant="subtitle1" color="primary" sx={{ mt: 3, mb: 1 }}>
            Informações Adicionais
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: '0 0 auto' }}>
                <BooleanInput source="is_gemeo" label="É Gêmeo?" />
            </Box>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.is_gemeo &&
                    <Box sx={{ flex: '1 1 70%', minWidth: '200px' }}>
                        <TextInput source="nome_gemeo" label="Nome do Gêmeo" fullWidth {...rest} />
                    </Box>
                }
            </FormDataConsumer>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: '0 0 auto' }}>
                <BooleanInput source="trabalha" label="Trabalha?" />
            </Box>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.trabalha &&
                    <>
                        <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                            <TextInput source="profissao" label="Profissão" fullWidth {...rest} />
                        </Box>
                        <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                            <TextInput source="empresa" label="Empresa" fullWidth {...rest} />
                        </Box>
                    </>
                }
            </FormDataConsumer>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: '0 0 auto' }}>
                <BooleanInput source="is_pcd" label="É PCD?" />
            </Box>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.is_pcd &&
                    <Box sx={{ flex: '1 1 70%', minWidth: '200px' }}>
                        <TextInput source="deficiencia" label="Tipo de Deficiência" fullWidth {...rest} />
                    </Box>
                }
            </FormDataConsumer>
        </Box>
    </Box>
);
