import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPassport } from '../requests.ts';
import type { PassportDto } from '@shared/types';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export const ACCESS_TOKEN_STORAGE_KEY = 'access_token';
const REDIRECT_AFTER_LOGIN_STORAGE_KEY = 'redirect_after_login';

const STRATEGIES = [
  {
    title: 'Google',
    href: `${API_URL}/login/google`,
    icon: 'G',
  },
  {
    title: 'Yandex',
    href: `${API_URL}/login/yandex`,
    icon: 'Я',
  },
];

type User = {
  id: number;
  title: string;
  age: number | null;
  image: string | null;
};

type AuthContextType = {
  passport: PassportDto | null;
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  strategies: typeof STRATEGIES;
  authHandler: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [passport, setPassport] = useState<PassportDto | null>(null);

  const { data } = useQuery({
    queryKey: ['passport'],
    queryFn: fetchPassport,
    enabled: Boolean(token),
  });

  useEffect(() => {
    const tokenFromUrl = getTokenFromUrl();
    const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

    const finalToken = tokenFromUrl || storedToken;

    if (finalToken) {
      setToken(finalToken);
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, finalToken);
    }
  }, []);

  useEffect(() => {
    if (data) {
      setPassport(data);
      setUser(data.users?.[0]);
    }
  }, [data]);

  useEffect(() => {
    if (!token) return;

    const redirectUrl = localStorage.getItem(REDIRECT_AFTER_LOGIN_STORAGE_KEY);

    console.log('redirectUrl', redirectUrl);

    if (redirectUrl) {
      localStorage.removeItem(REDIRECT_AFTER_LOGIN_STORAGE_KEY);

      window.location.href = redirectUrl;
    }
  }, [token]);

  const login = (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setPassport(null);
  };
  const authHandler = () => {
    localStorage.setItem(REDIRECT_AFTER_LOGIN_STORAGE_KEY, window.location.pathname + window.location.search);

    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{ passport, user, token, login, logout, strategies: STRATEGIES, authHandler }}>
      <>
        {children}
        <Dialog
          sx={{
            zIndex: theme => theme.zIndex.appBar - 1,
          }}
          open={isAuthModalOpen}
          fullScreen={false}
          onClose={() => setIsAuthModalOpen(false)}
        >
          <DialogTitle>
            Вход
          </DialogTitle>

          <DialogContent dividers>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                alignItems: {
                  xs: 'stretch',
                  sm: 'center',
                },
                justifyContent: 'space-between',
              }}
            >
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Выберите удобный способ авторизации
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                {STRATEGIES.map(strategy => (
                  <Button
                    component="a"
                    variant="contained"
                    href={strategy.href}
                    key={strategy.title}
                    sx={{ minWidth: 120 }}
                    onClick={() => {
                      localStorage.setItem('message_after_login', strategy.title);
                    }}
                  >
                    <Box component="span" sx={{ mr: 1, fontWeight: 900 }}>
                      {strategy.icon}
                    </Box>
                    {strategy.title}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>
      </>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const getTokenFromUrl = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const url = new URL(window.location.href);
  const token = url.searchParams.get('access_token');

  if (!token) return null;

  url.searchParams.delete('access_token');
  window.history.replaceState({}, document.title, url.toString());

  return token;
};