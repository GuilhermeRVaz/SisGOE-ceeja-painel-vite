// ARQUIVO: src/components/panels/PainelEdicao/AbaEndereco.tsx
import React from 'react';
import {
    TextInput,
    BooleanInput,
    SelectInput,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

export const AbaEndereco = () => (
    <Box p={3}>
        <Typography variant="h6" color="primary" gutterBottom>
            Endereço Residencial
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 20%', minWidth: '150px' }}>
                <TextInput source="addresses.cep" label="CEP" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 55%', minWidth: '300px' }}>
                <TextInput source="addresses.logradouro" label="Logradouro" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 20%', minWidth: '100px' }}>
                <TextInput source="addresses.numero" label="Número" fullWidth />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="addresses.complemento" label="Complemento" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="addresses.bairro" label="Bairro" fullWidth />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <TextInput source="addresses.nomeCidade" label="Cidade" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 25%', minWidth: '100px' }}>
                <TextInput source="addresses.ufCidade" label="UF" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 25%', minWidth: '150px' }}>
                <SelectInput 
                    source="addresses.zona" 
                    label="Zona" 
                    choices={[
                        { id: "Urbana", name: "Urbana" },
                        { id: "Rural", name: "Rural" }
                    ]} 
                    fullWidth 
                />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 30%', minWidth: '200px' }}>
                <BooleanInput source="addresses.temLocalizacaoDiferenciada" label="Localização Diferenciada?" />
            </Box>
            <Box sx={{ flex: '1 1 65%', minWidth: '400px' }}>
                <TextInput source="addresses.localizacaoDiferenciada" label="Descrição da Localização Diferenciada" fullWidth />
            </Box>
        </Box>
    </Box>
);
