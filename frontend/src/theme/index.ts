/**
 * CDA Theme - Premium dark theme with Inter font
 */
import { createTheme, alpha } from '@mui/material/styles';

const PRIMARY = '#6366f1';     // Indigo
const SECONDARY = '#06b6d4';   // Cyan
const SUCCESS = '#10b981';     // Emerald
const WARNING = '#f59e0b';     // Amber
const ERROR = '#ef4444';       // Red
const BG_DARK = '#0f172a';     // Slate 900
const BG_PAPER = '#1e293b';    // Slate 800
const BG_CARD = '#334155';     // Slate 700

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: PRIMARY, light: '#818cf8', dark: '#4f46e5' },
    secondary: { main: SECONDARY, light: '#22d3ee', dark: '#0891b2' },
    success: { main: SUCCESS },
    warning: { main: WARNING },
    error: { main: ERROR },
    background: {
      default: BG_DARK,
      paper: BG_PAPER,
    },
    divider: alpha('#94a3b8', 0.12),
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600, fontSize: '0.95rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.85rem' },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { textTransform: 'none' as const, fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${alpha('#94a3b8', 0.3)} transparent`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 3,
            background: alpha('#94a3b8', 0.3),
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          background: `linear-gradient(135deg, ${PRIMARY} 0%, #8b5cf6 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: BG_PAPER,
          border: `1px solid ${alpha('#94a3b8', 0.08)}`,
          borderRadius: 16,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 30px ${alpha('#000', 0.3)}`,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': { borderColor: alpha('#94a3b8', 0.2) },
            '&:hover fieldset': { borderColor: alpha(PRIMARY, 0.5) },
            '&.Mui-focused fieldset': { borderColor: PRIMARY },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500 },
        outlined: {
          borderColor: alpha('#94a3b8', 0.3),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${alpha('#94a3b8', 0.08)}`,
        },
        head: {
          fontWeight: 600,
          backgroundColor: alpha(BG_CARD, 0.5),
          color: '#94a3b8',
          fontSize: '0.8rem',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.05em',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(180deg, ${BG_DARK} 0%, ${BG_PAPER} 100%)`,
          borderRight: `1px solid ${alpha('#94a3b8', 0.08)}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&.Mui-selected': {
            background: alpha(PRIMARY, 0.15),
            '&:hover': { background: alpha(PRIMARY, 0.2) },
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepIcon-root.Mui-completed': { color: SUCCESS },
          '& .MuiStepIcon-root.Mui-active': { color: PRIMARY },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          background: alpha(BG_CARD, 0.3),
          border: `1px solid ${alpha('#94a3b8', 0.08)}`,
          borderRadius: '12px !important',
          '&:before': { display: 'none' },
          marginBottom: 12,
        },
      },
    },
  },
});

export default theme;
