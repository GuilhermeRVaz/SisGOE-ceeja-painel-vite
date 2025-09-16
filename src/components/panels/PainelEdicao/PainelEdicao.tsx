// ARQUIVO: src/components/panels/PainelEdicao/PainelEdicao.tsx
import React from 'react';
import {
    TabbedForm,
    FormTab,
    SaveButton,
    Toolbar,
    useNotify,
    Button,
    useDataProvider,
    useRecordContext,
} from 'react-admin';
import { Box } from '@mui/material';
import { AbaDadosPessoais } from './AbaDadosPessoais';
import { AbaEndereco } from './AbaEndereco';
import { AbaEscolaridade } from './AbaEscolaridade';
import { useCockpitContext } from '../../cockpit/CockpitLayout';

// Barra de ferramentas customizada
const AlunoEditToolbar = () => {
    const notify = useNotify();

    const handleApproveAndAutomate = () => {
        notify('Função de automação ainda não implementada.', { type: 'info' });
    };

    return (
        <Toolbar>
            <SaveButton label="Salvar Alterações" />
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    label="Aprovar e Iniciar Matrícula na SED" 
                    onClick={handleApproveAndAutomate}
                    variant="contained"
                    color="success"
                />
            </Box>
        </Toolbar>
    );
};

const PainelEdicao = () => {
    const { studentData } = useCockpitContext();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const record = useRecordContext();

    if (!studentData) {
        return <div>Carregando dados do formulário...</div>;
    }

    const transform = async (data: any) => {
        const { addresses, schooling_data, ...personal_data } = data;
        const studentId = personal_data.student_id || personal_data.id;
        
        try {
            const updates = [];

            // 1. Atualizar dados pessoais
            updates.push(
                dataProvider.update('personal_data', { 
                    id: personal_data.id, 
                    data: personal_data, 
                    previousData: record 
                })
            );

            // 2. Gerenciar endereço (CREATE/UPDATE)
            if (addresses && Object.keys(addresses).length > 0) {
                if (addresses.id) {
                    updates.push(dataProvider.update('addresses', { id: addresses.id, data: addresses, previousData: studentData.addresses }));
                } else {
                    updates.push(dataProvider.create('addresses', { data: { ...addresses, student_id: studentId } }));
                }
            }

            // 3. Gerenciar dados de escolaridade (CREATE/UPDATE)
            if (schooling_data && Object.keys(schooling_data).length > 0) {
                if (schooling_data.id) {
                    updates.push(dataProvider.update('schooling_data', { id: schooling_data.id, data: schooling_data, previousData: studentData.schooling_data }));
                } else {
                    updates.push(dataProvider.create('schooling_data', { data: { ...schooling_data, student_id: studentId } }));
                }
            }

            await Promise.all(updates);
            notify('Alterações salvas com sucesso!', { type: 'success' });
            
        } catch (error: any) {
            const errorMessage = error.message || 'Um erro inesperado ocorreu.';
            notify(`Erro ao salvar: ${errorMessage}`, { type: 'error' });
            // Retorna um objeto de erro formatado para o react-hook-form
            return { FORM_ERROR: errorMessage };
        }
        
        // Não é mais necessário retornar `data` aqui, pois o onSubmit do react-admin
        // lida com o sucesso. O retorno só é crucial em caso de erro de submissão.
    };

    return (
        <TabbedForm record={studentData} toolbar={<AlunoEditToolbar />} onSubmit={transform}>
            <FormTab label="Dados Pessoais">
                <AbaDadosPessoais />
            </FormTab>
            <FormTab label="Endereço">
                <AbaEndereco />
            </FormTab>
            <FormTab label="Escolaridade">
                <AbaEscolaridade />
            </FormTab>
        </TabbedForm>
    );
};

export default PainelEdicao;
