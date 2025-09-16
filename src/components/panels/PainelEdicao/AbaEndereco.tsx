// ARQUIVO: src/components/panels/PainelEdicao/AbaEndereco.tsx
import React from 'react';
import {
    TextInput,
    SelectInput,
    BooleanInput,
    FormDataConsumer,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
import { 
    ESTADOS_BRASIL, 
    ZONA_RESIDENCIAL_OPTIONS, 
    LOCALIZACAO_DIFERENCIADA_OPTIONS 
} from '../../../types/student';
import { validateRequired } from '../../../core/utils/validators';

export const AbaEndereco = () => (
    <Box p={3}>
        <Typography variant="h6" color="primary" gutterBottom>
            Endereço Residencial
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 20%', minWidth: '150px' }}>
                <TextInput source="addresses.cep" label="CEP" fullWidth validate={validateRequired} />
            </Box>
            <Box sx={{ flex: '1 1 55%', minWidth: '300px' }}>
                <TextInput source="addresses.logradouro" label="Logradouro" fullWidth validate={validateRequired} />
            </Box>
            <Box sx={{ flex: '1 1 20%', minWidth: '100px' }}>
                <TextInput source="addresses.numero" label="Número" fullWidth validate={validateRequired} />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="addresses.complemento" label="Complemento (Opcional)" fullWidth />
            </Box>
            <Box sx={{ flex: '1 1 48%', minWidth: '300px' }}>
                <TextInput source="addresses.bairro" label="Bairro" fullWidth validate={validateRequired} />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 45%', minWidth: '300px' }}>
                <TextInput source="addresses.nomeCidade" label="Cidade" fullWidth validate={validateRequired} />
            </Box>
            <Box sx={{ flex: '1 1 25%', minWidth: '100px' }}>
                <SelectInput
                    source="addresses.ufCidade"
                    label="UF"
                    choices={ESTADOS_BRASIL}
                    fullWidth
                    validate={validateRequired}
                />
            </Box>
            <Box sx={{ flex: '1 1 25%', minWidth: '150px' }}>
                <SelectInput
                    source="addresses.zona"
                    label="Zona"
                    choices={ZONA_RESIDENCIAL_OPTIONS}
                    fullWidth
                    validate={validateRequired}
                />
            </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ flex: '0 0 auto' }}>
                <BooleanInput source="addresses.temLocalizacaoDiferenciada" label="Localização Diferenciada?" />
            </Box>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.addresses?.temLocalizacaoDiferenciada &&
                    <Box sx={{ flex: '1 1 65%', minWidth: '400px' }}>
                        <SelectInput
                            source="addresses.localizacaoDiferenciada"
                            label="Descrição da Localização"
                            choices={LOCALIZACAO_DIFERENCIADA_OPTIONS}
                            fullWidth
                            {...rest}
                        />
                    </Box>
                }
            </FormDataConsumer>
        </Box>
    </Box>
);
