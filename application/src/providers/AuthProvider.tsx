import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPassport } from '../requests.ts';
import { type ActiveRole, type PassportDto, type PassportExtendedDto, type PlaceDto, type UserDto } from '@shared/types';
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
export const ACTIVE_CONTEXT_STORAGE_KEY = 'active_context';

const STRATEGIES = [
  {
    title: 'Yandex',
    href: `${API_URL}/login/yandex`,
    icon: 'Я',
  },
];

export interface ActiveContext {
  role: ActiveRole;
  userId?: number;
  placeId?: number;
}

type ContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  authHandler: (next2?: string) => void;
  refetch: () => void;

  passport: PassportDto | null;
  users: UserDto[];
  places: PlaceDto[];

  context: ActiveContext;
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

  const [users, setUsers] = useState<UserDto[]>([]);
  const [places, setPlaces] = useState<PlaceDto[]>([]);

  const [context, setContext] = useState<ActiveContext>(getActiveContext);

  const [passport, setPassport] = useState<PassportDto | null>(null);
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

  const getContext = (data: PassportExtendedDto): ActiveContext => {
    if (Boolean(data.users.length)) {
      return {
        role: 'user' as ActiveRole,
        userId: data.users?.[0]?.id,
      };
    }

    if (data.isTeacher) {
      return {
        role: 'teacher' as ActiveRole,
      };
    }

    if (!!data.places.length) {
      return {
        role: 'place' as ActiveRole,
        placeId: data.places?.[0]?.id,
      };
    }

    return {
      role: 'guest' as ActiveRole,
    };
  };

  useEffect(() => {
    if (data) {
      setPassport(data);
      setUsers(data.users);
      setPlaces(data.places);

      const newContext = getContext(data);

      localStorage.setItem(ACTIVE_CONTEXT_STORAGE_KEY, JSON.stringify(newContext));

      setContext(context => {
        if (context.role !== 'guest') {
          return context;
        }

        return newContext;
      });
    } else {
      setContext(context => {
        if (context.role !== 'guest') {
          return context;
        }

        return {
          role: 'guest' as ActiveRole,
        };
      });
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
    localStorage.removeItem(ACTIVE_CONTEXT_STORAGE_KEY);

    setContext({
      role: 'guest',
    });
    setToken(null);
    setPassport(null);
  };

  const authHandler = () => {
    setOpen(true);
  };

  const switchUser = (userId: number) => {
    const context: ActiveContext = {
      role: 'user',
      userId,
    };

    setContext(context);

    localStorage.setItem(ACTIVE_CONTEXT_STORAGE_KEY, JSON.stringify(context));
  };

  const switchTeacher = () => {
    const context: ActiveContext = {
      role: 'teacher',
    };

    setContext(context);

    localStorage.setItem(ACTIVE_CONTEXT_STORAGE_KEY, JSON.stringify(context));
  };

  const switchPlace = (placeId: number) => {
    const context: ActiveContext = {
      role: 'place',
      placeId,
    };

    setContext(context);

    localStorage.setItem(ACTIVE_CONTEXT_STORAGE_KEY, JSON.stringify(context));
  };

  return (
    <AuthContext.Provider
      value={{
        passport,
        users,
        token,
        login,
        logout,
        authHandler,
        refetch,
        context,
        places,
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