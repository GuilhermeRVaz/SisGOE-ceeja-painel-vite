// =====================================================================
// COMPONENTE CARD REUTILIZÁVEL
// =====================================================================

import React, { useState } from 'react';
import { Box, Typography, IconButton, Collapse, styled } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';

// Estilizando o botão de expansão para melhor acessibilidade
const ExpandButton = styled(IconButton)(({ theme }) => ({
  marginLeft: 'auto',
  color: '#006400', // Verde oficial do CEEJA
  backgroundColor: 'rgba(242, 133, 0, 0.1)', // Fundo laranja tangerina transparente
  '&:hover': {
    backgroundColor: 'rgba(242, 133, 0, 0.2)', // Hover com mais opacidade
  },
}));

interface CardProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  sx?: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  actions,
  className,
  collapsible = false,
  defaultCollapsed = false,
  sx
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Box 
      className={className}
      sx={{
        border: '1px solid #F28500', // Borda laranja tangerina
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2,
        backgroundColor: '#fff', // Fundo branco para contraste
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Sombra suave
        ...sx
      }}
    >
      {title && (
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            p: 2,
            backgroundColor: '#F28500', // Fundo laranja tangerina
            color: '#fff', // Texto branco
            cursor: 'pointer',
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              fontWeight: 'bold',
              flexGrow: 1,
            }}
          >
            {title}
          </Typography>
          {collapsible && (
            <ExpandButton aria-label={isCollapsed ? "Expandir" : "Recolher"}>
              {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </ExpandButton>
          )}
        </Box>
      )}
      
      <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      </Collapse>
      
      {actions && (
        <Box sx={{ 
          p: 2, 
          backgroundColor: '#f5f5f5', // Fundo cinza claro para ações
          borderTop: '1px solid #e0e0e0', // Borda separadora
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};
