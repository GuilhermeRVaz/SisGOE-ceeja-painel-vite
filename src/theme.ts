import { createTheme } from '@mui/material/styles';

// Tema customizado para o CEEJA de Lins - SisGOE-e
// Cores oficiais do CEEJA: laranja tangerina e verde
export const theme = createTheme({
  palette: {
    primary: {
      main: '#F28500', // Laranja tangerina oficial do CEEJA
    },
    secondary: {
      main: '#006400', // Verde oficial do CEEJA
    },
    mode: 'light',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#F28500', // Laranja tangerina na AppBar
        },
      },
    },
  },
});