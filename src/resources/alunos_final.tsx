// =====================================================================
// ARQUIVO PRINCIPAL: src/resources/alunos.tsx - SisGOE-e COCKPIT
// DESCRIÇÃO: Cockpit de Verificação de Matrícula integrado ao React Admin
// =====================================================================

import React from 'react';
import {
    List, 
    Datagrid, 
    TextField, 
    EmailField, 
    TextInput, 
    Edit,
    Filter,
    useRecordContext
} from "react-admin";
import { Box } from '@mui/material';
import { CockpitLayout } from '../components/cockpit/CockpitLayout';

// =====================================================================
// COMPONENTE DE EDIÇÃO COM COCKPIT
// =====================================================================

const AlunoEditWithCockpit: React.FC = () => {
  const record = useRecordContext();
  
  if (!record) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
      >
        Carregando dados do aluno...
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <CockpitLayout 
        studentId={record.id.toString()}
        onSave={(data) => {
          console.log('✅ AlunoEdit: Dados salvos:', data);
        }}
        onApprove={(studentId) => {
          console.log('✅ AlunoEdit: Aluno aprovado:', studentId);
        }}
      />
    </Box>
  );
};

// =====================================================================
// FILTRO DE ALUNOS
// =====================================================================

const AlunoFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Buscar por nome" source="nome" alwaysOn />
        <TextInput label="Email" source="email" />
        <TextInput label="CPF" source="cpf" />
    </Filter>
);

// =====================================================================
// LISTA DE ALUNOS
// =====================================================================

export const AlunoList = () => (
    <List filters={<AlunoFilter />} title="Lista de Alunos - SisGOE-e">
        <Datagrid rowClick="edit">
            <TextField source="id" label="ID" />
            <TextField source="nome" label="Nome" />
            <EmailField source="email" label="Email" />
            <TextField source="telefone" label="Telefone" />
            <TextField source="cpf" label="CPF" />
        </Datagrid>
    </List>
);

// =====================================================================
// EDIÇÃO DE ALUNOS COM COCKPIT
// =====================================================================

export const AlunoEdit = () => (
    <Edit title="Cockpit de Verificação - SisGOE-e">
        <AlunoEditWithCockpit />
    </Edit>
);
