// =====================================================================
// HOOK PRINCIPAL PARA DADOS DO COCKPIT
// =====================================================================

import { useState, useCallback, useEffect } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import type { MergedStudentData, StudentData } from '../../types/cockpit';

export const useCockpitData = (studentId: string) => {
  const [data, setData] = useState<MergedStudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const dataProvider = useDataProvider();
  const notify = useNotify();

  // Busca dados unificados
  const fetchData = useCallback(async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 useCockpitData: Iniciando busca de dados para student_id:', studentId);
      
      // Buscar dados do aluno
      const studentResponse = await dataProvider.getOne('alunos', { id: studentId });
      const studentData = studentResponse.data;
      
      console.log('👤 useCockpitData: Dados do aluno obtidos:', studentData);
      
      // Buscar endereço
      let addressData = null;
      try {
        const addressResponse = await dataProvider.getList('addresses', {
          filter: { student_id: studentId },
          pagination: { page: 1, perPage: 1 },
          sort: { field: 'id', order: 'DESC' }
        });
        addressData = addressResponse.data[0] || null;
        console.log('🏠 useCockpitData: Dados de endereço obtidos:', addressData);
      } catch (addressError) {
        console.log('⚠️ useCockpitData: Erro ao buscar endereço (pode não existir):', addressError);
      }
      
      // Buscar dados de escolaridade
      let schoolingData = null;
      try {
        const schoolingResponse = await dataProvider.getList('schooling_data', {
          filter: { student_id: studentId },
          pagination: { page: 1, perPage: 1 },
          sort: { field: 'id', order: 'DESC' }
        });
        schoolingData = schoolingResponse.data[0] || null;
        console.log('🎓 useCockpitData: Dados de escolaridade obtidos:', schoolingData);
      } catch (schoolingError) {
        console.log('⚠️ useCockpitData: Erro ao buscar escolaridade (pode não existir):', schoolingError);
      }
      
      // Buscar enrollment_id para documentos
      let enrollmentId = null;
      try {
        const enrollmentResponse = await dataProvider.getList('enrollments', {
          filter: { student_id: studentId },
          pagination: { page: 1, perPage: 1 },
          sort: { field: 'id', order: 'DESC' }
        });
        enrollmentId = enrollmentResponse.data[0]?.id || null;
        console.log('📋 useCockpitData: Enrollment ID obtido:', enrollmentId);
      } catch (enrollmentError) {
        console.log('⚠️ useCockpitData: Erro ao buscar enrollment (pode não existir):', enrollmentError);
      }
      
      // Buscar documentos se tiver enrollment_id
      let documents = [];
      if (enrollmentId) {
        try {
          const documentsResponse = await dataProvider.getList('document_extractions', {
            filter: { enrollment_id: enrollmentId },
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'created_at', order: 'DESC' }
          });
          documents = documentsResponse.data;
          console.log('📄 useCockpitData: Documentos obtidos:', documents.length);
        } catch (documentsError) {
          console.log('⚠️ useCockpitData: Erro ao buscar documentos:', documentsError);
        }
      }
      
      // Dados unificados
      const mergedData: MergedStudentData = {
        ...studentData,
        student_id: studentId,
        enrollment_id: enrollmentId,
        addresses: addressData,
        schooling_data: schoolingData,
        documents: documents
      };
      
      console.log('✅ useCockpitData: Dados unificados preparados:', mergedData);
      setData(mergedData);
      
    } catch (err: any) {
      console.error('❌ useCockpitData: Erro ao buscar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
      notify('Erro ao carregar dados do aluno', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [studentId, dataProvider, notify]);

  // Auto-save
  const saveData = useCallback(async (updates: Partial<StudentData>) => {
    if (!data || !studentId) return;
    
    try {
      console.log('💾 useCockpitData: Salvando dados:', updates);
      
      // Separar dados por tabela
      const studentUpdates: any = {};
      const addressUpdates: any = {};
      const schoolingUpdates: any = {};
      
      // Classificar campos
      Object.entries(updates).forEach(([key, value]) => {
        if (['nome', 'email', 'telefone', 'data_nascimento', 'cpf', 'rg', 'nome_mae', 'nome_pai'].includes(key)) {
          studentUpdates[key] = value;
        } else if (key === 'addresses' && typeof value === 'object') {
          Object.assign(addressUpdates, value);
        } else if (key === 'schooling_data' && typeof value === 'object') {
          Object.assign(schoolingUpdates, value);
        }
      });
      
      // Atualizar dados do aluno
      if (Object.keys(studentUpdates).length > 0) {
        await dataProvider.update('alunos', {
          id: studentId,
          data: studentUpdates,
          previousData: data
        });
        console.log('✅ useCockpitData: Dados do aluno atualizados');
      }
      
      // Atualizar endereço
      if (Object.keys(addressUpdates).length > 0) {
        if (data.addresses?.id) {
          await dataProvider.update('addresses', {
            id: data.addresses.id,
            data: addressUpdates,
            previousData: data.addresses
          });
        } else {
          await dataProvider.create('addresses', {
            data: { ...addressUpdates, student_id: studentId }
          });
        }
        console.log('✅ useCockpitData: Dados de endereço atualizados');
      }
      
      // Atualizar escolaridade
      if (Object.keys(schoolingUpdates).length > 0) {
        if (data.schooling_data?.id) {
          await dataProvider.update('schooling_data', {
            id: data.schooling_data.id,
            data: schoolingUpdates,
            previousData: data.schooling_data
          });
        } else {
          await dataProvider.create('schooling_data', {
            data: { ...schoolingUpdates, student_id: studentId }
          });
        }
        console.log('✅ useCockpitData: Dados de escolaridade atualizados');
      }
      
      notify('Dados salvos com sucesso!', { type: 'success' });
      
      // Recarregar dados
      await fetchData();
      
    } catch (err: any) {
      console.error('❌ useCockpitData: Erro ao salvar:', err);
      notify('Erro ao salvar dados', { type: 'error' });
      throw err;
    }
  }, [data, studentId, dataProvider, notify, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    saveData,
    refetch: fetchData
  };
};
