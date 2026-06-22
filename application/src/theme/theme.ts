import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FFB628', // твой оранжевый
    },
    secondary: {
      main: '#7139FF', //'#00a7e1'//'#1E3A8A', // тёмно-синий для контраста // 6B21A8 //
    },
    background: {
      default: '#FFB628',
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
  },
});