// ARQUIVO: src/components/cockpit/CockpitLayout.tsx

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery } from 'react-query';
import PainelEdicao from '../panels/PainelEdicao/PainelEdicao';
import PainelDocumentos from '../panels/PainelDocumentos/PainelDocumentos';
import PainelVisualizacao from '../panels/PainelVisualizacao/PainelVisualizacao';
import { useDataProvider, type RaRecord, useEditController } from 'react-admin';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useStudentDocuments } from '../../hooks/useStudentDocuments';

// --- Tipos ---
interface Document {
    id: string;
    file_name: string;
    storage_path: string;
    document_type: string;
    status: string;
}
interface CockpitContextType {
    studentData: RaRecord | null;
    loading: boolean;
    error: any;
    selectedDocument: Document | null;
    setSelectedDocument: React.Dispatch<React.SetStateAction<Document | null>>;
    documentUrl: string;
    documents: Document[];
    documentsLoading: boolean;
}

// --- Contexto ---
const CockpitContext = createContext<CockpitContextType | undefined>(undefined);
export const useCockpitContext = () => {
    const context = useContext(CockpitContext);
    if (!context) throw new Error('useCockpitContext must be used within a CockpitProvider');
    return context;
};

// --- Provider (O Cérebro) ---
const CockpitProvider: React.FC<{ studentId: string; children: ReactNode }> = ({ studentId, children }) => {
    const dataProvider = useDataProvider();
    const { data: studentData, isLoading: loading, error } = useQuery(
        ['studentData', studentId],
        async () => {
            const { data: personalData } = await dataProvider.getOne('personal_data', { id: studentId });
            const relatedStudentId = personalData.student_id || studentId;
            const [addressesRes, schoolingRes] = await Promise.all([
                dataProvider.getList('addresses', { filter: { student_id: relatedStudentId }, pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' } }),
                dataProvider.getList('schooling_data', { filter: { student_id: relatedStudentId }, pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'ASC' } })
            ]);
            return {
                ...personalData,
                addresses: addressesRes.data[0] || {},
                schooling_data: schoolingRes.data[0] || {},
            };
        },
        { enabled: !!studentId }
    );

    const {
        documents,
        selectedDocument,
        setSelectedDocument,
        loading: documentsLoading,
        documentUrl,
    } = useStudentDocuments(studentData?.student_id || studentData?.id);

    const value = {
        studentData: studentData || null,
        loading,
        error,
        documents,
        selectedDocument,
        setSelectedDocument,
        documentsLoading,
        documentUrl,
    };

    return (
        <CockpitContext.Provider value={value}>
            {loading ? <CircularProgress /> : error ? <Alert severity="error">{(error as Error).message}</Alert> : children}
        </CockpitContext.Provider>
    );
};

// --- Layout Principal (As 3 Colunas) ---
export const CockpitLayout: React.FC<{ children: [ReactNode, ReactNode, ReactNode] }> = ({ children }) => {
    const [PainelEdicao, PainelDocumentos, PainelVisualizacao] = children;

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}> {/* Altura total menos o header */}
            <Box sx={{ width: '15%', borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
                {PainelDocumentos}
            </Box>
            <Box sx={{ width: '45%', borderRight: 1, borderColor: 'divider', overflowY: 'auto' }}>
                {PainelEdicao}
            </Box>
            <Box sx={{ width: '40%', overflowY: 'auto' }}>
                {PainelVisualizacao}
            </Box>
        </Box>
    );
};

// --- O Orquestrador Final ---
export const AlunoEditOrchestrator: React.FC = () => {
    const { record } = useEditController();
    if (!record) return null;

    return (
        <CockpitProvider studentId={record.id}>
            <CockpitLayout>
                <PainelEdicao />
                <PainelDocumentos />
                <PainelVisualizacao />
            </CockpitLayout>
        </CockpitProvider>
    );
};
