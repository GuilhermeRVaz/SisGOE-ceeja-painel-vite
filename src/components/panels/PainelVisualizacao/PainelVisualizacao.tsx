// ARQUIVO: src/components/panels/PainelVisualizacao/PainelVisualizacao.tsx
import React, { useState } from 'react';
import { useCockpitContext } from '../../cockpit/CockpitLayout';
import { 
    Box, 
    Typography, 
    Paper, 
    IconButton, 
    Tooltip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    RestartAlt as ResetIcon,
    RotateRight as RotateIcon,
} from '@mui/icons-material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

// =====================================================================
// COMPONENTE DE VISUALIZAÇÃO DE IMAGEM COM ZOOM E PAN
// =====================================================================
const ImageViewer: React.FC<{ 
    imageUrl: string; 
    fileName: string;
    rotation: number;
}> = ({ imageUrl, fileName, rotation }) => {
    console.log('🖼️ [ImageViewer] Renderizando imagem:', fileName, 'URL:', imageUrl);
    
    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <TransformWrapper
                initialScale={1}
                minScale={0.1}
                maxScale={8}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ step: 2 }}
            >
                {({ zoomIn, zoomOut, resetTransform, centerView }) => {
                    console.log('🔄 [TransformWrapper] Renderizando controles');
                    
                    return (
                        <>
                            {/* Controles de Zoom */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    zIndex: 10,
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    gap: '4px',
                                    p: '8px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}
                            >
                                <Tooltip title="Aumentar Zoom (Scroll ou +)">
                                    <IconButton 
                                        onClick={() => {
                                            console.log('🔍 [ImageViewer] Zoom In');
                                            zoomIn(0.5);
                                        }} 
                                        size="small"
                                        sx={{ 
                                            '&:hover': { 
                                                backgroundColor: 'primary.light',
                                                color: 'primary.contrastText'
                                            }
                                        }}
                                    >
                                        <ZoomInIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Diminuir Zoom (Scroll ou -)">
                                    <IconButton 
                                        onClick={() => {
                                            console.log('🔍 [ImageViewer] Zoom Out');
                                            zoomOut(0.5);
                                        }} 
                                        size="small"
                                        sx={{ 
                                            '&:hover': { 
                                                backgroundColor: 'primary.light',
                                                color: 'primary.contrastText'
                                            }
                                        }}
                                    >
                                        <ZoomOutIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Resetar Visualização (Duplo clique)">
                                    <IconButton 
                                        onClick={() => {
                                            console.log('🔄 [ImageViewer] Reset View');
                                            resetTransform();
                                            centerView();
                                        }} 
                                        size="small"
                                        sx={{ 
                                            '&:hover': { 
                                                backgroundColor: 'primary.light',
                                                color: 'primary.contrastText'
                                            }
                                        }}
                                    >
                                        <ResetIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            
                            {/* Imagem com Transformações */}
                            <TransformComponent>
                                <img
                                    src={imageUrl}
                                    alt={fileName}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        width: 'auto',
                                        height: 'auto',
                                        objectFit: 'contain',
                                        transform: `rotate(${rotation}deg)`,
                                        transition: 'transform 0.3s ease',
                                        cursor: 'grab',
                                        userSelect: 'none',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                    }}
                                    onError={(e) => {
                                        console.error('❌ Erro ao carregar imagem:', e);
                                    }}
                                    onLoad={(e) => {
                                        console.log('✅ [ImageViewer] Imagem carregada:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
                                    }}
                                    draggable={false}
                                />
                            </TransformComponent>
                        </>
                    );
                }}
            </TransformWrapper>
        </Box>
    );
};

// =====================================================================
// COMPONENTE DE VISUALIZAÇÃO DE PDF
// =====================================================================
const PDFViewer: React.FC<{ 
    pdfUrl: string; 
    fileName: string;
}> = ({ pdfUrl, fileName }) => {
    return (
        <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
            <object
                data={pdfUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '8px' }}
                aria-label={`Visualizador de PDF para ${fileName}`}
            >
                <Box sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center'
                }}>
                    <Alert severity="warning" sx={{ mb: 3, maxWidth: '400px' }}>
                        <Typography variant="body2" gutterBottom>
                            Seu navegador não suporta a visualização de PDFs.
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Clique no botão abaixo para abrir o PDF em uma nova aba.
                        </Typography>
                    </Alert>
                    <a 
                        href={pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                            textDecoration: 'none',
                            padding: '12px 24px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: 500,
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1565c0';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1976d2';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.3)';
                        }}
                    >
                        📄 Abrir PDF em Nova Aba
                    </a>
                </Box>
            </object>
        </Box>
    );
};

// =====================================================================
// COMPONENTE PRINCIPAL - PAINEL DE VISUALIZAÇÃO
// =====================================================================
const PainelVisualizacao = () => {
    const { selectedDocument, documentUrl } = useCockpitContext();
    const [rotation, setRotation] = useState(0);

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    const resetView = () => {
        setRotation(0);
    };

    return (
        <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} elevation={0} square>
            <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.100', 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6" noWrap>
                    {selectedDocument ? selectedDocument.file_name : 'Visualizador'}
                </Typography>
                
                {/* Controles de Visualização */}
                {selectedDocument && documentUrl && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Girar 90°">
                            <IconButton 
                                onClick={handleRotate} 
                                size="small"
                                sx={{ 
                                    '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        color: 'primary.contrastText'
                                    }
                                }}
                            >
                                <RotateIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Resetar Visualização">
                            <IconButton 
                                onClick={resetView} 
                                size="small"
                                sx={{ 
                                    '&:hover': { 
                                        backgroundColor: 'primary.light',
                                        color: 'primary.contrastText'
                                    }
                                }}
                            >
                                <ResetIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>
            
            <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {documentUrl && selectedDocument ? (
                    <>
                        {/* Suporte a PDFs */}
                        {selectedDocument.file_name?.toLowerCase().endsWith('.pdf') ? (
                            <PDFViewer 
                                pdfUrl={documentUrl} 
                                fileName={selectedDocument.file_name} 
                            />
                        ) : (
                            /* Suporte a Imagens com Zoom, Pan e Rotação */
                            <ImageViewer 
                                imageUrl={documentUrl}
                                fileName={selectedDocument.file_name}
                                rotation={rotation}
                            />
                        )}
                    </>
                ) : (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center" 
                        height="100%"
                        bgcolor="grey.50"
                        flexDirection="column"
                        gap={2}
                    >
                        <Typography variant="body1" color="text.secondary">
                            {selectedDocument ? 'Carregando documento...' : 'Selecione um documento da lista para visualizar.'}
                        </Typography>
                        {selectedDocument && (
                            <CircularProgress size={24} />
                        )}
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default PainelVisualizacao;
