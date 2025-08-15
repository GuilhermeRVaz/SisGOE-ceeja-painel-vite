// ARQUIVO: src/hooks/useStudentDocuments.ts
import { useState, useEffect } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { supabase } from '../supabase/supabaseClient';

interface Document {
    id: string;
    file_name: string;
    document_type: string;
    status: string;
    storage_path: string;
}

export const useStudentDocuments = (studentId: string | null) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [documentUrl, setDocumentUrl] = useState<string>('');
    const dataProvider = useDataProvider();
    const notify = useNotify();

    useEffect(() => {
        const fetchDocuments = async () => {
            if (!studentId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Estratégia 1: Buscar na tabela 'students' para encontrar o enrollment_id
                const { data: studentRecords } = await dataProvider.getList('students', {
                    filter: { id: studentId },
                    pagination: { page: 1, perPage: 1 },
                    sort: { field: 'created_at', order: 'DESC' },
                });

                if (!studentRecords || studentRecords.length === 0) {
                    throw new Error('Prontuário do aluno (students) não encontrado.');
                }

                const enrollmentId = studentRecords[0].enrollment_id;
                if (!enrollmentId) {
                    throw new Error('ID da matrícula (enrollment_id) não encontrado no prontuário do aluno.');
                }

                // Com o enrollment_id, buscar os documentos
                const { data: documentRecords } = await dataProvider.getList('document_extractions', {
                    filter: { enrollment_id: enrollmentId },
                    pagination: { page: 1, perPage: 100 },
                    sort: { field: 'uploaded_at', order: 'DESC' },
                });

                setDocuments(documentRecords);
                if (documentRecords.length > 0) {
                    setSelectedDocument(documentRecords[0]);
                }

            } catch (err: any) {
                setError(err.message || 'Ocorreu um erro ao buscar os documentos.');
                notify(`Erro: ${err.message}`, { type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [studentId, dataProvider, notify]);

    useEffect(() => {
        const getSignedUrl = async () => {
            if (selectedDocument?.storage_path) {
                try {
                    const { data, error } = await supabase.functions.invoke('get-signed-url', {
                        body: { path: selectedDocument.storage_path },
                    });

                    if (error) throw error;
                    setDocumentUrl(data.signedUrl);

                } catch (err: any) {
                    setError(err.message || 'Erro ao obter URL segura do documento.');
                    notify(`Erro ao obter URL: ${err.message}`, { type: 'error' });
                }
            } else {
                setDocumentUrl('');
            }
        };

        getSignedUrl();
    }, [selectedDocument, notify]);

    return {
        documents,
        selectedDocument,
        setSelectedDocument,
        loading,
        error,
        documentUrl,
    };
};