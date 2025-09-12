import * as React from "react";
import { AppBar, Typography, Toolbar, IconButton } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import type { ReactNode } from 'react';

interface MyAppBarProps {
  children?: ReactNode;
  open?: boolean;
  onMenuClick?: () => void;
}

export const MyAppBar: React.FC<MyAppBarProps> = ({
  children,
  open,
  onMenuClick,
}) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#F28500", // Laranja tangerina oficial do CEEJA
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {onMenuClick && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1, fontWeight: "bold" }}
        >
          SisGOE-e - Cockpit de Verificação de Matrícula
        </Typography>
        {children}
      </Toolbar>
    </AppBar>
  );
};