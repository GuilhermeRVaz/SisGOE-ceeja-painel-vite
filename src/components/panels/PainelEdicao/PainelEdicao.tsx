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
            console.log('🚀 Iniciando geração da ficha de matrícula para estudante:', studentContextData.id);

            const { data, error } = await supabase.functions.invoke('generate-enrollment-sheet', {
                body: { student_id: studentContextData.id }
            });

            console.log('📊 Resposta da função Supabase:', { data, error });
            console.log('📊 Tipo da resposta:', data ? data.constructor.name : 'null');
            console.log('📊 Tamanho da resposta:', data ? data.byteLength || data.size : 'N/A');

            if (error) {
                console.error('❌ Erro na função Supabase:', error);
                throw error;
            }

            // ABORDAGEM ROBUSTA: Funciona com qualquer tipo de resposta
            let excelBlob: Blob;

            if (data instanceof ArrayBuffer) {
                console.log('✅ Resposta é ArrayBuffer nativo - IMPLEMENTAÇÃO ORIGINAL');
                excelBlob = new Blob([data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
            } else if (data instanceof Blob) {
                console.log('✅ Resposta é Blob nativo - IMPLEMENTAÇÃO ORIGINAL');
                excelBlob = data;
            } else if (typeof data === 'object' && data !== null && data.data) {
                console.log('✅ Resposta é objeto JSON com dados base64');

                // Verifica se é a nova estrutura JSON com base64
                if (data.success && data.data && typeof data.data === 'string') {
                    console.log('✅ Estrutura JSON com base64 detectada - NOVA IMPLEMENTAÇÃO');
                    console.log('📋 Dados recebidos:', {
                        success: data.success,
                        fileName: data.fileName,
                        mimeType: data.mimeType,
                        size: data.size,
                        dataLength: data.data.length,
                        hasMetadata: !!data.metadata
                    });

                    try {
                        // Decodifica base64 para ArrayBuffer
                        const binaryString = atob(data.data);
                        const bytes = new Uint8Array(binaryString.length);

                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }

                        const buffer = bytes.buffer;
                        const uint8Array = new Uint8Array(buffer);

                        // Validação da assinatura ZIP
                        const hasValidSignature = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B &&
                                                uint8Array[2] === 0x03 && uint8Array[3] === 0x04;

                        if (hasValidSignature && buffer.byteLength >= 1024) {
                            console.log('✅ Conversão base64 bem-sucedida:', buffer.byteLength, 'bytes');
                            console.log('📋 Metadados do arquivo:', {
                                fileName: data.fileName,
                                mimeType: data.mimeType,
                                size: data.size,
                                originalSize: buffer.byteLength
                            });
                            excelBlob = new Blob([buffer], {
                                type: data.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            });
                        } else {
                            throw new Error('Base64 decodificado não tem assinatura Excel válida');
                        }
                    } catch (jsonError) {
                        console.error('❌ Erro ao processar JSON com base64:', jsonError);
                        throw new Error(`Falha ao processar resposta JSON: ${jsonError.message}`);
                    }
                } else {
                    console.error('❌ Estrutura JSON inesperada:', data);
                    throw new Error('A resposta JSON recebida não tem a estrutura esperada.');
                }
            } else if (typeof data === 'string') {
                console.log('⚠️  Resposta é string - IMPLEMENTAÇÃO ANTERIOR (FALLBACK)');
                console.log('📋 String recebida - tamanho:', data.length, 'caracteres');

                // Verifica se é string binária válida
                const isBinaryString = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(data) || data.includes('PK');

                if (isBinaryString) {
                    console.log('✅ String binária detectada, tentando conversão...');

                    try {
                        // Abordagem 1: Conversão direta para ArrayBuffer
                        const buffer = new ArrayBuffer(data.length);
                        const view = new Uint8Array(buffer);

                        for (let i = 0; i < data.length; i++) {
                            view[i] = data.charCodeAt(i) & 0xFF;
                        }

                        // Validação rigorosa
                        const uint8Array = new Uint8Array(buffer);
                        const hasValidSignature = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B &&
                                                uint8Array[2] === 0x03 && uint8Array[3] === 0x04;

                        if (hasValidSignature && buffer.byteLength >= 1024) {
                            console.log('✅ Conversão ArrayBuffer bem-sucedida:', buffer.byteLength, 'bytes');
                            excelBlob = new Blob([buffer], {
                                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            });
                        } else {
                            console.log('⚠️  Conversão ArrayBuffer falhou, tentando como base64...');

                            // Abordagem 2: Tentar como base64
                            try {
                                const binaryString = atob(data);
                                const bytes = new Uint8Array(binaryString.length);

                                for (let i = 0; i < binaryString.length; i++) {
                                    bytes[i] = binaryString.charCodeAt(i);
                                }

                                const base64Buffer = bytes.buffer;
                                const base64Signature = new Uint8Array(base64Buffer)[0] === 0x50 &&
                                                      new Uint8Array(base64Buffer)[1] === 0x4B;

                                if (base64Signature && base64Buffer.byteLength >= 1024) {
                                    console.log('✅ Conversão base64 bem-sucedida:', base64Buffer.byteLength, 'bytes');
                                    excelBlob = new Blob([base64Buffer], {
                                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                    });
                                } else {
                                    throw new Error('Base64 inválido');
                                }
                            } catch (base64Error) {
                                console.error('❌ Ambas as abordagens falharam');
                                throw new Error('Não foi possível processar o arquivo Excel recebido.');
                            }
                        }
                    } catch (conversionError) {
                        console.error('❌ Erro na conversão:', conversionError);
                        throw new Error('Falha ao processar o arquivo Excel.');
                    }
                } else {
                    console.error('❌ String recebida não é binária:', data.substring(0, 100));
                    throw new Error('A resposta recebida não é um arquivo Excel válido.');
                }
            } else {
                console.error('❌ Tipo de resposta não suportado:', typeof data, data);
                console.error('🔍 Detalhes da resposta não suportada:', {
                    type: typeof data,
                    constructor: data?.constructor?.name,
                    keys: data && typeof data === 'object' ? Object.keys(data) : 'N/A',
                    sample: data && typeof data === 'string' ? data.substring(0, 100) : 'N/A'
                });
                throw new Error('A resposta recebida não é um arquivo Excel válido.');
            }

            // VALIDAÇÃO FINAL DO BLOB
            if (excelBlob.size < 1024) {
                console.error('❌ Blob muito pequeno:', excelBlob.size, 'bytes');
                throw new Error('O arquivo Excel gerado é muito pequeno.');
            }

            console.log('✅ Blob final criado:', {
                size: excelBlob.size,
                type: excelBlob.type
            });

            console.log('✅ Blob criado:', {
                size: excelBlob.size,
                type: excelBlob.type
            });

            // CRIA DOWNLOAD
            const url = window.URL.createObjectURL(excelBlob);

            // Usa o nome do arquivo do backend se disponível, senão gera um novo
            let fileName;
            if (data.fileName) {
                console.log('📁 Usando nome do arquivo do backend:', data.fileName);
                fileName = data.fileName;
            } else {
                const studentName = studentContextData.nome_completo?.replace(/[^a-zA-Z0-9\s]/g, '_') || 'estudante';
                const cleanStudentName = studentName.replace(/\s+/g, '_').replace(/_+/g, '_');
                fileName = `FICHA_DE_MATRICULA_${cleanStudentName}_${studentContextData.id}.xlsx`;
                console.log('📁 Nome do arquivo gerado:', fileName);
            }

            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            console.log('✅ Download iniciado com sucesso');
            notify('Ficha de matrícula gerada com sucesso!', { type: 'success' });

        } catch (err: any) {
            console.error("❌ Erro ao gerar a ficha de matrícula:", err);
            console.error("❌ Stack trace:", err.stack);
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

    // Renderiza o formulário apenas quando o registro do estudante (com seu ID) estiver totalmente carregado.
    if (!studentData?.id) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
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
