import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPassport } from '../requests.ts';
import type { PassportDto } from '@shared/types';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { MESSAGE_AFTER_LOGIN_STORAGE_KEY } from '../features/chat/model/useChatEffects.ts';
import { useLocation } from 'react-router-dom';
import { AUTH_401_EVENT } from '../api.ts';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export const ACCESS_TOKEN_STORAGE_KEY = 'access_token';
export const NEXT_STORAGE_KEY = 'next';
export const ACTIVE_ROLE_STORAGE_KEY = 'active_role';

const STRATEGIES = [
  {
    title: 'Google',
    href: `${API_URL}/login/google`,
    icon: 'G',
  },
  // {
  //   title: 'Yandex',
  //   href: `${API_URL}/login/yandex`,
  //   icon: 'Я',
  // },
];

type User = {
  id: number;
  title: string;
  age: number | null;
  image: string | null;
};

export type ActiveRole = 'user' | 'teacher' | 'place' | 'guest';

type AuthContextType = {
  passport: PassportDto | null;
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  strategies: typeof STRATEGIES;
  authHandler: (next2?: string) => void;
  refetch: () => void;
  activeRole: ActiveRole;
  switchRole: (role: ActiveRole) => void;
  availableRoles: ActiveRole[];
};

const AuthContext = createContext<AuthContextType>(null!);

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<ActiveRole>(() => {
    let role;

    if (typeof window !== 'undefined') {
      role = localStorage.getItem(ACTIVE_ROLE_STORAGE_KEY);
    }

    if (role === 'user' || role === 'teacher' || role === 'place') {
      return role;
    }

    return 'guest';
  });
  const [passport, setPassport] = useState<PassportDto | null>(null);
  const [redirect, setRedirect] = useState('');
  const availableRoles = ['user', 'teacher', 'place'] as ActiveRole[];

  const { data, refetch } = useQuery({
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
    setRedirect(window.location.pathname + window.location.search);
  }, [location]);

  useEffect(() => {
    if (data) {
      setPassport(data);
      setUser(data.users?.[0]);
    }
  }, [data]);

  useEffect(() => {
    const handler = () => {
      logout();
    };

    window.addEventListener(AUTH_401_EVENT, handler);

    return () => {
      window.removeEventListener(AUTH_401_EVENT, handler);
    };
  }, []);

  const login = (token: string) => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ROLE_STORAGE_KEY);

    setToken(null);
    setUser(null);
    setPassport(null);
    setActiveRole('guest');
  };

  const authHandler = () => {
    setIsAuthModalOpen(true);
  };

  const switchRole = (role: ActiveRole) => {
    setActiveRole(role);
    localStorage.setItem(ACTIVE_ROLE_STORAGE_KEY, role);
  };

  return (
    <AuthContext.Provider
      value={{ passport, user, token, login, logout, strategies: STRATEGIES, authHandler, refetch, activeRole, switchRole, availableRoles }}
    >
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
          <DialogTitle>Авторизуйтесь одним нажатием</DialogTitle>

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
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                {STRATEGIES.map(strategy => (
                  <Button
                    component="a"
                    variant="contained"
                    href={`${strategy.href}?redirect=${encodeURIComponent(redirect)}`}
                    key={strategy.title}
                    sx={{ minWidth: 120 }}
                    onClick={() => {
                      localStorage.setItem(MESSAGE_AFTER_LOGIN_STORAGE_KEY, strategy.title);
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