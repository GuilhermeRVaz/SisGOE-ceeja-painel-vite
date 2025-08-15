// ARQUIVO: src/components/panels/PainelDocumentos/PainelDocumentos.tsx
import React from 'react';
import { useCockpitContext } from '../../cockpit/CockpitLayout';
import {
    Box,
    List as MuiList,
    ListItemButton,
    ListItemText,
    Typography,
    CircularProgress,
    Alert,
    Divider,
    Paper,
} from '@mui/material';

// Mapeamento de tipos de documentos para nomes amigáveis
const DOCUMENT_TYPE_LABELS: { [key: string]: string } = {
    'declaracao-de-conclusao': 'Declaração de Conclusão',
    'historico-escolar': 'Histórico Escolar',
    'rg-frente': 'RG (Frente)',
    'rg-verso': 'RG (Verso)',
    'cpf': 'CPF',
    'certidao-nascimento-casamento': 'Certidão de Nascimento/Casamento',
    'comprovante-residencia': 'Comprovante de Residência',
};

const PainelDocumentos = () => {
    const { documents, selectedDocument, setSelectedDocument, documentsLoading } = useCockpitContext();

    const getDocumentLabel = (documentType: string, fileName: string) => {
        return DOCUMENT_TYPE_LABELS[documentType] || fileName;
    };

    if (documentsLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={2}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                    Carregando...
                </Typography>
            </Box>
        );
    }

    if (!documents || documents.length === 0) {
        return (
            <Box p={2}>
                <Alert severity="info">Nenhum documento encontrado.</Alert>
            </Box>
        );
    }

    return (
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} elevation={0} square>
            <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="h6">Documentos</Typography>
                <Typography variant="body2" color="text.secondary">
                    {documents.length} item(s)
                </Typography>
            </Box>
            <Divider />
            <MuiList sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
                {documents.map((doc, index) => (
                    <React.Fragment key={doc.id}>
                        <ListItemButton
                            selected={selectedDocument?.id === doc.id}
                            onClick={() => setSelectedDocument(doc)}
                        >
                            <ListItemText 
                                primary={getDocumentLabel(doc.document_type, doc.file_name)}
                                secondary={`Status: ${doc.status}`}
                            />
                        </ListItemButton>
                        {index < documents.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </MuiList>
        </Paper>
    );
};

export default PainelDocumentos;
