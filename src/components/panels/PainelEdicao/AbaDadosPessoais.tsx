// ARQUIVO: src/components/panels/PainelEdicao/AbaDadosPessoais.tsx
import React from 'react';
import {
    TextInput,
    BooleanInput,
    DateInput,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

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
            <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <TextInput source="nome_completo" label="Nome Completo" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 20%', minWidth: '150px' }}>
                <BooleanInput source="tem_nome_social" label="Tem Nome Social?" />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <TextInput source="nome_social" label="Nome Social" fullWidth />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 20%', minWidth: '150px' }}>
                <BooleanInput source="tem_nome_afetivo" label="Tem Nome Afetivo?" />
            </Box>
            <Box sx={{ flex: '1 1 35%', minWidth: '200px' }}>
                <TextInput source="nome_afetivo" label="Nome Afetivo" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 20%', minWidth: '150px' }}>
                <TextInput source="sexo" label="Sexo" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 20%', minWidth: '100px' }}>
                <TextInput source="idade" label="Idade" fullWidth />
            </Box>
        </Box>

        {/* Seção: Documentos */}
        <Typography variant="subtitle1" color="primary" sx={{ mt: 3, mb: 1 }}>
            Documentos de Identificação
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 35%', minWidth: '200px' }}>
                <TextInput source="rg" label="RG" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 15%', minWidth: '100px' }}>
                <TextInput source="rg_digito" label="Dígito" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 15%', minWidth: '100px' }}>
                <TextInput source="rg_uf" label="UF" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <DateInput source="rg_data_emissao" label="Data de Emissão" fullWidth />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <TextInput source="cpf" label="CPF" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <TextInput source="raca_cor" label="Raça/Cor" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 35%', minWidth: '200px' }}>
                <DateInput source="data_nascimento" label="Data de Nascimento" fullWidth />
            </Box>
        </Box>

        {/* Seção: Filiação */}
        <Typography variant="subtitle1" color="primary" sx={{ mt: 3, mb: 1 }}>
            Filiação e Origem
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="nome_mae" label="Nome da Mãe" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="nome_pai" label="Nome do Pai" fullWidth />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <TextInput source="nacionalidade" label="Nacionalidade" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <TextInput source="nascimento_uf" label="UF de Nascimento" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 35%', minWidth: '200px' }}>
                <TextInput source="nascimento_cidade" label="Cidade de Nascimento" fullWidth />
            </Box>
        </Box>

        {/* Seção: Contato */}
        <Typography variant="subtitle1" color="primary" sx={{ mt: 3, mb: 1 }}>
            Contato e Tecnologia
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="telefone" label="Telefone" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="email" label="E-mail" fullWidth />
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
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 20%', minWidth: '120px' }}>
                <BooleanInput source="is_gemeo" label="É Gêmeo?" />
            </Box>
            <Box sx={{ flex: '1 1 25%', minWidth: '200px' }}>
                <TextInput source="nome_gemeo" label="Nome do Gêmeo" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 20%', minWidth: '120px' }}>
                <BooleanInput source="trabalha" label="Trabalha?" />
            </Box>
            <Box sx={{ flex: '1 1 20%', minWidth: '120px' }}>
                <BooleanInput source="is_pcd" label="É PCD?" />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <TextInput source="profissao" label="Profissão" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <TextInput source="empresa" label="Empresa" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 35%', minWidth: '200px' }}>
                <TextInput source="deficiencia" label="Tipo de Deficiência" fullWidth />
            </Box>
        </Box>
    </Box>
);
