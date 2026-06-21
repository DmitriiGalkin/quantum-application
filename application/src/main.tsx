import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import 'normalize.css';
import { AuthProvider } from './providers/AuthProvider.tsx';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const queryClient = new QueryClient();
const theme = createTheme({
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
      primary: '#1F2937',
      secondary: '#374151',
    },
  },
});

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>,
  // </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}
