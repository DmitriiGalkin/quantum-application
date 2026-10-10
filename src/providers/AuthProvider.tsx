import { type ReactNode, useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPassport } from '../requests.ts';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { useLocation } from 'react-router-dom';
import { AUTH_401_EVENT } from '../utils/api.ts';
import { type ActiveContext, getContext, getTokenFromUrl, parseActiveContext, STRATEGIES } from './helper.ts';
import { AuthContext } from './auth-context.ts';
import { getServerAuthSnapshot, getStoredContext, getStoredToken, storeAuth, subscribeAuth } from './auth-store.ts';
import { getBrowser } from '../shared/lib/browser.ts';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const token = useSyncExternalStore(subscribeAuth, getStoredToken, getServerAuthSnapshot);
  const contextSnapshot = useSyncExternalStore(subscribeAuth, getStoredContext, getServerAuthSnapshot);
  const [open, setOpen] = useState(false);
  const redirect = location.pathname + location.search;
  const { data, refetch, isPending } = useQuery({
    queryKey: ['passport', token],
    queryFn: fetchPassport,
    enabled: Boolean(token),
  });
  const passport = token ? (data ?? null) : null;
  const storedContext = parseActiveContext(contextSnapshot);
  const validContext =
    storedContext &&
    passport &&
    (storedContext.role === 'guest' ||
      (storedContext.role === 'teacher' && passport.isTeacher) ||
      (storedContext.role === 'user' && passport.users.some(user => user.id === storedContext.userId)) ||
      (storedContext.role === 'place' && passport.places.some(place => place.id === storedContext.placeId)));
  const activeContext: ActiveContext = validContext ? storedContext : passport ? getContext(passport) : { role: 'guest' };
  const contextJson = JSON.stringify(activeContext);

  useEffect(() => {
    const fromUrl = getTokenFromUrl();
    if (fromUrl) storeAuth(fromUrl);
  }, []);

  useEffect(() => {
    if (token && passport && contextSnapshot !== contextJson) storeAuth(token, JSON.parse(contextJson) as ActiveContext);
  }, [token, passport, contextSnapshot, contextJson]);

  useEffect(() => {
    let previousToken = getStoredToken();
    let previousContext = getStoredContext();
    return subscribeAuth(() => {
      const nextToken = getStoredToken();
      const nextContext = getStoredContext();
      if (nextToken === previousToken && nextContext === previousContext) return;
      previousToken = nextToken;
      previousContext = nextContext;
      void queryClient.cancelQueries().then(() => queryClient.resetQueries());
    });
  }, [queryClient]);

  const login = useCallback((value: string) => storeAuth(value), []);
  const logout = useCallback(() => storeAuth(null), []);
  useEffect(() => {
    const browser = getBrowser();
    browser?.addEventListener(AUTH_401_EVENT, logout);
    return () => browser?.removeEventListener(AUTH_401_EVENT, logout);
  }, [logout]);

  const setActiveRole = (context: ActiveContext) => storeAuth(token, context);
  const switchUser = (userId: number) => setActiveRole({ role: 'user', userId });
  const switchTeacher = () => setActiveRole({ role: 'teacher' });
  const switchPlace = (placeId: number) => setActiveRole({ role: 'place', placeId });
  const authHandler = () => setOpen(true);

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
