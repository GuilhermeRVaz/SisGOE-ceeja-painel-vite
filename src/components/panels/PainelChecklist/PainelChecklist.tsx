// ARQUIVO: src/components/panels/PainelChecklist/PainelChecklist.tsx
import React, { useState } from 'react';
import { useCockpitContext } from '../../cockpit/CockpitLayout';
import { useDocumentChecklist } from '../../../hooks/useDocumentChecklist';
import {
    Box,
    Paper,
    Typography,
    Checkbox,
    FormControlLabel,
    Divider,
    Chip,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Tooltip,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Schedule as ScheduleIcon,
    Note as NoteIcon,
    ThumbUp as ThumbUpIcon,
    ThumbDown as ThumbDownIcon,
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material';

// Constantes inline
const DOCUMENT_CATEGORY_LABELS = {
  personal: 'Documentos Pessoais',
  address: 'Documentos de Endereço',
  schooling: 'Documentos Escolares',
  other: 'Outros Documentos'
} as const;

const DOCUMENT_STATUS_LABELS = {
  missing: 'Documento Pendente',
  delivered: 'Aguardando Aprovação',
  approved: 'Documento Aprovado',
  rejected: 'Documento Rejeitado'
} as const;

// Interface inline
interface DocumentChecklistItem {
  id: string;
  document_type: string;
  document_name: string;
  is_required: boolean;
  is_delivered: boolean;
  delivered_at?: string;
  approved_by_admin?: boolean;
  admin_notes?: string;
  required_for_enrollment: boolean;
  category: 'personal' | 'address' | 'schooling' | 'other';
}

const PainelChecklist = () => {
    const { studentData } = useCockpitContext();
    const {
        checklist,
        loading,
        error,
        updateDocumentStatus,
        approveDocument,
        rejectDocument,
        approveAllPending,
        refreshChecklist
    } = useDocumentChecklist(studentData?.student_id || studentData?.id);

    const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
    const [notesDialog, setNotesDialog] = useState<{
        open: boolean;
        documentType: string;
        currentNotes: string;
    }>({
        open: false,
        documentType: '',
        currentNotes: ''
    });

    const handleDocumentToggle = async (
        documentType: string,
        isDelivered: boolean,
        approvedByAdmin?: boolean
    ) => {
        await updateDocumentStatus(
            documentType,
            isDelivered,
            approvedByAdmin,
            adminNotes[documentType]
        );
    };

    const handleApproveDocument = async (documentType: string) => {
        await approveDocument(documentType, adminNotes[documentType] || 'Documento aprovado');
    };

    const handleRejectDocument = async (documentType: string) => {
        await rejectDocument(documentType, adminNotes[documentType] || 'Documento rejeitado - verificar');
    };

    const handleNotesDialogOpen = (documentType: string, currentNotes: string = '') => {
        setNotesDialog({
            open: true,
            documentType,
            currentNotes
        });
    };

    const handleNotesDialogClose = () => {
        setNotesDialog({
            open: false,
            documentType: '',
            currentNotes: ''
        });
    };

    const handleNotesSave = async () => {
        const { documentType, currentNotes } = notesDialog;
        setAdminNotes(prev => ({
            ...prev,
            [documentType]: currentNotes
        }));

        // Se o documento já está marcado como entregue, atualizar com as novas notas
        const document = checklist?.items.find(item => item.document_type === documentType);
        if (document?.is_delivered) {
            await updateDocumentStatus(documentType, true, document.approved_by_admin, currentNotes);
        }

        handleNotesDialogClose();
    };

    const getDocumentStatusColor = (item: DocumentChecklistItem) => {
        if (item.approved_by_admin === true) return 'success';
        if (item.approved_by_admin === false) return 'error';
        if (item.is_delivered) return 'warning';
        return 'default';
    };

    const getDocumentIcon = (item: DocumentChecklistItem) => {
        if (item.approved_by_admin === true) return <ThumbUpIcon />;
        if (item.approved_by_admin === false) return <ThumbDownIcon />;
        if (item.is_delivered) return <ScheduleIcon />;
        return <ErrorIcon />;
    };

    const groupDocumentsByCategory = (items: DocumentChecklistItem[]) => {
        const grouped: { [key: string]: DocumentChecklistItem[] } = {};

        items.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });

        return grouped;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={2}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                    Carregando checklist...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={2}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!checklist) {
        return (
            <Box p={2}>
                <Alert severity="info">
                    Nenhum checklist encontrado para este estudante.
                    <br />
                    <br />
                    <strong>Solução:</strong> Você precisa criar um checklist manualmente no banco de dados ou usar a API.
                    <br />
                    <br />
                    <em>Nota: O sistema está funcionando, mas o checklist precisa ser criado primeiro.</em>
                </Alert>
            </Box>
        );
    }

    const groupedDocuments = groupDocumentsByCategory(checklist.items);
    const { status_summary: status } = checklist;

    return (
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} elevation={0} square>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="h6">Checklist de Documentos</Typography>
                <Typography variant="body2" color="text.secondary">
                    {status.total_required} documentos obrigatórios
                </Typography>
            </Box>

            <Divider />

            {/* Bulk Actions */}
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                    Ações em Lote
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<ThumbUpIcon />}
                        onClick={approveAllPending}
                        disabled={!checklist?.items.some(item => item.is_delivered && !item.approved_by_admin)}
                    >
                        Aprovar Todos Pendentes
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<ThumbDownIcon />}
                        onClick={() => {
                            const deliveredDocuments = checklist?.items.filter(item =>
                                item.is_delivered && item.approved_by_admin !== false
                            ) || [];
                            deliveredDocuments.forEach(doc => handleRejectDocument(doc.document_type));
                        }}
                    >
                        Rejeitar Todos Entregues
                    </Button>
                </Box>
            </Box>

            <Divider />

            {/* Status Summary */}
            <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                    icon={<CheckCircleIcon />}
                    label={`${status.total_approved} Aprovados`}
                    color="success"
                    variant={status.total_approved > 0 ? 'filled' : 'outlined'}
                />
                <Chip
                    icon={<ScheduleIcon />}
                    label={`${status.total_delivered - status.total_approved} Aguardando`}
                    color="warning"
                    variant={(status.total_delivered - status.total_approved) > 0 ? 'filled' : 'outlined'}
                />
                <Chip
                    icon={<ErrorIcon />}
                    label={`${status.missing_documents.length} Pendentes`}
                    color="error"
                    variant={status.missing_documents.length > 0 ? 'filled' : 'outlined'}
                />
            </Box>

            <Divider />

            {/* Document List */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
                {Object.entries(groupedDocuments).map(([category, documents]) => (
                    <Accordion key={category} defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {DOCUMENT_CATEGORY_LABELS[category as keyof typeof DOCUMENT_CATEGORY_LABELS]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                ({documents.length} documentos)
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            {documents.map((item) => (
                                <Box key={item.document_type} sx={{ px: 2, py: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={item.is_delivered}
                                                    onChange={(e) => handleDocumentToggle(
                                                        item.document_type,
                                                        e.target.checked,
                                                        item.approved_by_admin
                                                    )}
                                                    color={item.approved_by_admin ? 'success' : 'primary'}
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2">
                                                        {item.document_name}
                                                    </Typography>
                                                    {item.is_required && (
                                                        <Chip
                                                            label="Obrigatório"
                                                            size="small"
                                                            color="error"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            sx={{ flex: 1 }}
                                        />

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip
                                                icon={getDocumentIcon(item)}
                                                label={DOCUMENT_STATUS_LABELS[
                                                    item.approved_by_admin === true ? 'approved' :
                                                    item.approved_by_admin === false ? 'rejected' :
                                                    item.is_delivered ? 'delivered' : 'missing'
                                                ]}
                                                color={getDocumentStatusColor(item)}
                                                size="small"
                                            />

                                            {/* Botões de aprovação - só aparecem quando o documento está entregue */}
                                            {item.is_delivered && (
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Aprovar documento">
                                                        <IconButton
                                                            size="small"
                                                            color={item.approved_by_admin ? "success" : "default"}
                                                            onClick={() => handleApproveDocument(item.document_type)}
                                                        >
                                                            <ThumbUpIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Rejeitar documento">
                                                        <IconButton
                                                            size="small"
                                                            color={item.approved_by_admin === false ? "error" : "default"}
                                                            onClick={() => handleRejectDocument(item.document_type)}
                                                        >
                                                            <ThumbDownIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            )}

                                            <Tooltip title="Adicionar observações">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleNotesDialogOpen(
                                                        item.document_type,
                                                        item.admin_notes || ''
                                                    )}
                                                >
                                                    <NoteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>

                                    {item.admin_notes && (
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                                            Nota: {item.admin_notes}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>

            <Divider />

            {/* Status Boxes */}
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Card
                        sx={{
                            flex: 1,
                            bgcolor: status.is_complete ? 'success.light' : 'grey.100',
                            border: status.is_complete ? '2px solid' : '1px solid',
                            borderColor: status.is_complete ? 'success.main' : 'grey.300'
                        }}
                    >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <CheckCircleIcon
                                color={status.is_complete ? 'success' : 'disabled'}
                                sx={{ fontSize: 32, mb: 1 }}
                            />
                            <Typography variant="h6" color={status.is_complete ? 'success.main' : 'text.secondary'}>
                                Documentos OK
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {status.is_complete
                                    ? 'Todos os documentos obrigatórios foram aprovados!'
                                    : 'Aguardando aprovação de documentos obrigatórios'
                                }
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card
                        sx={{
                            flex: 1,
                            bgcolor: status.missing_documents.length > 0 ? 'error.light' : 'grey.100',
                            border: status.missing_documents.length > 0 ? '2px solid' : '1px solid',
                            borderColor: status.missing_documents.length > 0 ? 'error.main' : 'grey.300'
                        }}
                    >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                            <ErrorIcon
                                color={status.missing_documents.length > 0 ? 'error' : 'disabled'}
                                sx={{ fontSize: 32, mb: 1 }}
                            />
                            <Typography variant="h6" color={status.missing_documents.length > 0 ? 'error.main' : 'text.secondary'}>
                                Deve Documentos
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {status.missing_documents.length > 0
                                    ? `${status.missing_documents.length} documento(s) obrigatório(s) pendente(s)`
                                    : 'Todos os documentos obrigatórios foram entregues'
                                }
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Notes Dialog */}
            <Dialog open={notesDialog.open} onClose={handleNotesDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Observações do Documento
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        multiline
                        rows={4}
                        fullWidth
                        value={notesDialog.currentNotes}
                        onChange={(e) => setNotesDialog(prev => ({
                            ...prev,
                            currentNotes: e.target.value
                        }))}
                        placeholder="Adicione observações sobre este documento..."
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleNotesDialogClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleNotesSave} variant="contained">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default PainelChecklist;