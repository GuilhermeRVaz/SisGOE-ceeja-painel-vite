// =====================================================================
// SISTEMA DE ABAS CUSTOMIZADO
// =====================================================================

import React, { ReactNode } from 'react';
import { Tabs as MuiTabs, Tab as MuiTab, Box, styled } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';

// Estilizando as abas para usar as cores oficiais do CEEJA
const StyledTab = styled(MuiTab)(({ theme }) => ({
  '&.Mui-selected': {
    color: '#006400', // Verde oficial do CEEJA para aba selecionada
  },
}));

// Estilizando a barra de abas para usar as cores oficiais do CEEJA
const StyledTabList = styled(TabList)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: '#F28500', // Laranja tangerina para o indicador
  },
}));

interface TabsProps {
  value: string;
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
  children: ReactNode;
}

interface TabProps {
  label: string;
  value: string;
  icon?: ReactNode;
  children: ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onChange, children }) => {
  return (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <StyledTabList 
          onChange={onChange} 
          aria-label="Abas de edição de aluno"
          textColor="primary"
          sx={{
            '& .MuiTab-root': {
              color: '#484848', // Cinza escuro para abas não selecionadas
            },
          }}
        >
          {children}
        </StyledTabList>
      </Box>
    </TabContext>
  );
};

export const Tab: React.FC<TabProps> = ({ label, value, icon, children }) => {
  return (
    <TabPanel value={value} sx={{ p: 3 }}>
      <StyledTab 
        icon={icon} 
        iconPosition="start"
        label={label} 
        value={value}
        sx={{
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
        }}
      />
      {children}
    </TabPanel>
  );
};
