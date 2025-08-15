// ARQUIVO: src/resources/alunos.tsx (Versão Simplificada)
import React from 'react';
import { List, Datagrid, TextField, Edit, EmailField } from 'react-admin';
import { AlunoEditOrchestrator } from '../components/cockpit/CockpitLayout'; // Importa o novo orquestrador

export const AlunoEdit = () => (
    <Edit>
        <AlunoEditOrchestrator />
    </Edit>
);

export const AlunoList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="nome_completo" />
            <TextField source="cpf" />
        </Datagrid>
    </List>
);
