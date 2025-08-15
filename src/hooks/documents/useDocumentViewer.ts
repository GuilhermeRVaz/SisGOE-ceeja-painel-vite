// =====================================================================
// HOOK PARA VISUALIZAÇÃO DE DOCUMENTOS
// =====================================================================

import { useState, useCallback, useEffect } from 'react';
import { useDataProvider } from 'react-admin';
import type { DocumentExtraction, DocumentViewerControls } from '../../types/documents';

export const useDocumentViewer = (document: DocumentExtraction | null) => {
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dataProvider = useDataProvider();

  // Buscar URL do documento
  const fetchDocumentUrl = useCallback(async () => {
    if (!document) {
      setDocumentUrl('');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 useDocumentViewer: Buscando URL para documento:', document.file_name);
      
      // Simular busca da URL do Supabase Storage
      // Na implementação real, isso seria uma chamada para o backend
      const mockUrl = `https://exemplo.supabase.co/storage/v1/object/public/documents/${document.storage_path}`;
      
      setDocumentUrl(mockUrl);
      console.log('✅ useDocumentViewer: URL obtida:', mockUrl);
      
    } catch (err: any) {
      console.error('❌ useDocumentViewer: Erro ao buscar URL:', err);
      setError(err.message || 'Erro ao carregar documento');
      setDocumentUrl('');
    } finally {
      setLoading(false);
    }
  }, [document]);

  // Controles de visualização
  const controls: DocumentViewerControls = {
    zoom: {
      value: zoom,
      zoomIn: () => setZoom(prev => Math.min(prev + 25, 300)),
      zoomOut: () => setZoom(prev => Math.max(prev - 25, 25)),
      reset: () => setZoom(100)
    },
    rotation: {
      value: rotation,
      rotate: () => setRotation(prev => (prev + 90) % 360),
      reset: () => setRotation(0)
    }
  };

  // Reset quando documento muda
  useEffect(() => {
    setZoom(100);
    setRotation(0);
    fetchDocumentUrl();
  }, [fetchDocumentUrl]);

  return {
    documentUrl,
    controls,
    loading,
    error
  };
};
