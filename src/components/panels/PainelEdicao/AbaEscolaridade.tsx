// ARQUIVO: src/components/panels/PainelEdicao/AbaEscolaridade.tsx
import React from 'react';
import {
    TextInput,
    BooleanInput,
    DateInput,
    ArrayInput,
    SimpleFormIterator,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

export const AbaEscolaridade = () => (
    <Box p={3}>
        <Typography variant="h6" color="primary" gutterBottom>
            Dados de Escolaridade
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="schooling_data.nivel_ensino" label="Nível de Ensino" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="schooling_data.itinerario_formativo" label="Itinerário Formativo" fullWidth />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <TextInput source="schooling_data.ultima_serie_concluida" label="Última Série Concluída" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 25%', minWidth: '150px' }}>
                <BooleanInput source="schooling_data.estudou_no_ceeja" label="Estudou no CEEJA?" />
            </Box>
            <Box sx={{ flex: '1 1 25%', minWidth: '150px' }}>
                <BooleanInput source="schooling_data.tem_progressao_parcial" label="Tem Progressão Parcial?" />
            </Box>
        </Box>

        <Typography variant="subtitle1" color="primary" sx={{ mt: 3, mb: 2 }}>
            Disciplinas em Progressão Parcial
        </Typography>
        <Box sx={{ mb: 3 }}>
            <ArrayInput source="schooling_data.progressao_parcial_disciplinas">
                <SimpleFormIterator>
                    <TextInput source="disciplina" label="Disciplina em DP" helperText={false} />
                </SimpleFormIterator>
            </ArrayInput>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <BooleanInput source="schooling_data.eliminou_disciplina" label="Eliminou Disciplina?" />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <TextInput source="schooling_data.eliminou_disciplina_nivel" label="Nível da Disciplina Eliminada" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 35%', minWidth: '250px' }}>
                <TextInput source="schooling_data.eliminou_disciplinas" label="Disciplinas Eliminadas" fullWidth />
            </Box>
        </Box>

        <Typography variant="subtitle1" color="primary" sx={{ mt: 3, mb: 2 }}>
            Opções Curriculares
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 22%', minWidth: '150px' }}>
                <BooleanInput source="schooling_data.optou_ensino_religioso" label="Optou por Ensino Religioso?" />
            </Box>
            <Box sx={{ flex: '1 1 22%', minWidth: '150px' }}>
                <BooleanInput source="schooling_data.optou_educacao_fisica" label="Optou por Educação Física?" />
            </Box>
            <Box sx={{ flex: '1 1 22%', minWidth: '150px' }}>
                <BooleanInput source="schooling_data.aceitou_termos" label="Aceitou os Termos?" />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <DateInput source="schooling_data.data_aceite" label="Data de Aceite" fullWidth />
            </Box>
        </Box>

        <Typography variant="subtitle1" color="primary" sx={{ mt: 3, mb: 2 }}>
            Dados da Escola Anterior
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <TextInput source="schooling_data.ra" label="RA" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <TextInput source="schooling_data.tipo_escola" label="Tipo de Escola" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 35%', minWidth: '250px' }}>
                <TextInput source="schooling_data.nome_escola" label="Nome da Escola" fullWidth />
            </Box>
        </Box>
    </Box>
);
