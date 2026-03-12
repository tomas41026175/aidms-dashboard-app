import { createTheme } from '@mui/material/styles'

export function createAppTheme(mode: 'light' | 'dark') {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary: { main: '#a78bfa' },
            background: {
              default: '#09090b',
              paper: '#111113',
            },
            divider: 'rgba(255, 255, 255, 0.07)',
            text: {
              primary: '#fafafa',
              secondary: 'rgba(250, 250, 250, 0.45)',
            },
          }
        : {
            primary: { main: '#7c3aed' },
            background: { default: '#f4f4f5', paper: '#ffffff' },
            divider: 'rgba(0, 0, 0, 0.08)',
            text: { primary: '#09090b', secondary: '#71717a' },
          }),
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", system-ui, sans-serif',
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(mode === 'dark' && {
              backgroundColor: '#111113',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              boxShadow: 'none',
            }),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            ...(mode === 'dark' && {
              backgroundColor: 'rgba(9, 9, 11, 0.85)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
              boxShadow: 'none',
            }),
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6 },
        },
      },
    },
  })
}
