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
import { Box, Button as MuiButton, CircularProgress, Tooltip } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { supabase } from '../../../supabase/supabaseClient';
import { AbaDadosPessoais } from './AbaDadosPessoais';
import { AbaEndereco } from './AbaEndereco';
import { AbaEscolaridade } from './AbaEscolaridade';
import { useCockpitContext } from '../../cockpit/CockpitLayout';


// Barra de ferramentas customizada
const AlunoEditToolbar = () => {
    const notify = useNotify();
    const { studentData: studentContextData } = useCockpitContext();
    const [loading, setLoading] = React.useState(false);

    const handleGenerateSheet = async () => {
        if (!studentContextData?.id) {
            notify("ID do estudante não encontrado.", { type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('generate-enrollment-sheet', {
                body: { student_id: studentContextData.id },
                responseType: 'blob',
            });

            if (error) {
                throw error;
            }

            if (data instanceof Blob && data.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                const url = window.URL.createObjectURL(data);
                const a = document.createElement('a');
                a.href = url;
                a.download = `FICHA_DE_MATRICULA_${studentContextData.nome_completo?.replace(/ /g, '_') || studentContextData.id}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                notify('Ficha de matrícula gerada com sucesso!', { type: 'success' });
            } else {
                // Se 'data' não for o blob esperado, um erro ocorreu.
                // A mensagem de erro estará no objeto 'error', que já foi lançado.
                // Este 'else' serve como um fallback para casos inesperados.
                throw new Error('A resposta recebida não era um arquivo Excel válido.');
            }
        } catch (err: any) {
            console.error("Erro ao gerar a ficha de matrícula:", err);
            notify(`Erro ao gerar ficha: ${err.message}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAndAutomate = () => {
        notify('Função de automação ainda não implementada.', { type: 'info' });
    };

    return (
        <Toolbar>
            <SaveButton label="Salvar Alterações" />
            <Tooltip title="Gerar e baixar a ficha de matrícula em formato Excel">
                <Box sx={{ marginLeft: 'auto', marginRight: '8px' }}>
                    <MuiButton
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                        onClick={handleGenerateSheet}
                        disabled={!studentContextData || loading}
                    >
                        {loading ? 'Gerando...' : 'Gerar Ficha'}
                    </MuiButton>
                </Box>
            </Tooltip>
            <Button
                label="Aprovar e Iniciar Matrícula na SED"
                onClick={handleApproveAndAutomate}
                variant="contained"
                color="success"
            />
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
        <TabbedForm record={studentData} toolbar={<AlunoEditToolbar />} onSubmit={transform} defaultValue="pessoal">
            <FormTab label="Dados Pessoais" path="pessoal">
                <AbaDadosPessoais />
            </FormTab>
                <FormTab label="Endereço" path="endereco">
                    <AbaEndereco />
                </FormTab>
                <FormTab label="Escolaridade" path="escolaridade">
                    <AbaEscolaridade />
                </FormTab>
        </TabbedForm>
    );
};

export default PainelEdicao;
