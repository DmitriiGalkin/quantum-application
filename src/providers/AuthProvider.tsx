import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPassport } from '../requests.ts';
import { type ActiveRole, type PassportExtendedDto } from 'dto';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { MESSAGE_AFTER_LOGIN_STORAGE_KEY } from '../features/chat/model/useChatEffects.ts';
import { useLocation } from 'react-router-dom';
import { AUTH_401_EVENT } from '../api.ts';
import {
  ACCESS_TOKEN_STORAGE_KEY,
  ACTIVE_CONTEXT_STORAGE_KEY, type ActiveContext,
  getContext,
  getTokenFromUrl,
  STRATEGIES,
} from './helper.ts';



type ContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  authHandler: (next2?: string) => void;
  refetch: () => void;

  passport: PassportExtendedDto | null;

  role: ActiveRole;
  userId?: number;
  placeId?: number;

  switchUser: (userId: number) => void;
  switchTeacher: () => void;
  switchPlace: (placeId: number) => void;

  isPending: boolean;
};

const AuthContext = createContext<ContextType>(null!);

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [activeContext, setActiveContext] = useState<ActiveContext>({
    role: 'guest',
  });

  const [isContextInitialized, setIsContextInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_CONTEXT_STORAGE_KEY);

    if (stored) {
      try {
        setActiveContext(JSON.parse(stored) as ActiveContext);
      } catch {
        localStorage.removeItem(ACTIVE_CONTEXT_STORAGE_KEY);
      }
    }

    setIsContextInitialized(true);
  }, []);

  const [passport, setPassport] = useState<PassportExtendedDto | null>(null);
  const [redirect, setRedirect] = useState('');

  const { data, refetch, isPending } = useQuery({
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
    if (!data || !isContextInitialized) return;

    setPassport(data);

    const stored = localStorage.getItem(ACTIVE_CONTEXT_STORAGE_KEY);

    if (!stored) {
      const defaultContext = getContext(data);

      setActiveContext(defaultContext);

      localStorage.setItem(ACTIVE_CONTEXT_STORAGE_KEY, JSON.stringify(defaultContext));
    }
  }, [data, isContextInitialized]);

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
    localStorage.removeItem(ACTIVE_CONTEXT_STORAGE_KEY);

    setActiveContext({
      role: 'guest',
    });

    setToken(null);
    setPassport(null);
  };

  const authHandler = () => {
    setOpen(true);
  };

  const switchUser = (userId: number) => {
    setActiveRole({
      role: 'user',
      userId,
    });
  };

  const switchTeacher = () => {
    setActiveRole({
      role: 'teacher',
    });
  };

  const switchPlace = (placeId: number) => {
    setActiveRole({
      role: 'place',
      placeId,
    });
  };

  const setActiveRole = (context: ActiveContext) => {
    setActiveContext(context);

    localStorage.setItem(ACTIVE_CONTEXT_STORAGE_KEY, JSON.stringify(context));
  };

  return (
    <AuthContext.Provider
      value={{
        passport,
        token,
        login,
        logout,
        authHandler,
        refetch,
        role: activeContext.role,
        userId: activeContext.role === 'user' ? activeContext?.userId : undefined,
        placeId: activeContext.role === 'place' ? activeContext?.placeId : undefined,
        switchUser,
        switchTeacher,
        switchPlace,
        isPending,
      }}
    >
      <>
        {children}
        <Dialog
          sx={{
            zIndex: theme => theme.zIndex.appBar - 1,
          }}
          open={open}
          fullScreen={false}
          onClose={() => setOpen(false)}
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