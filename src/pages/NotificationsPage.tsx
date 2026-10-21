import { useEffect, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/auth-context.ts';
import { fetchNotifications, fetchPushConfig, fetchPushSubscribe, fetchPushUnsubscribe, fetchReadNotification } from '../requests.ts';
import { getBrowser } from '../shared/lib/browser.ts';
import { moscowFormat } from '../features/meets/moscow-time.ts';
import type { AppNotification } from 'entities';

export default function NotificationsPage() {
  const { passport, token, isPending, authHandler } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const notifications = useInfiniteQuery({
    queryKey: ['notifications', passport?.id, unreadOnly],
    queryFn: ({ pageParam }) => fetchNotifications(unreadOnly, pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: page => page.nextCursor,
    enabled: !!passport, retry: false,
  });
  const read = useMutation({
    mutationFn: fetchReadNotification,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['notifications', passport?.id] }),
        client.invalidateQueries({ queryKey: ['notification-count', passport?.id] }),
      ]);
    },
  });
  const push = useMutation({ mutationFn: async () => {
    const browser = getBrowser();
    if (!browser || !('serviceWorker' in navigator) || !('PushManager' in browser) || !('Notification' in browser)) throw new Error('Этот браузер не поддерживает Push');
    if (!pushEnabled && await Notification.requestPermission() !== 'granted') throw new Error('Уведомления отключены в настройках браузера');
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) throw new Error('Сервис уведомлений ещё не готов. Обновите страницу.');
    const subscription = await registration.pushManager.getSubscription();
    if (pushEnabled && subscription) {
      await fetchPushUnsubscribe(subscription.endpoint);
      await subscription.unsubscribe();
      setPushEnabled(false);
      return;
    }
    const config = await fetchPushConfig();
    if (!config.publicKey) throw new Error('Push ещё не настроен на сервере');
    const base64 = config.publicKey.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), char => char.charCodeAt(0));
    const next = subscription ?? await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: bytes });
    await fetchPushSubscribe(next.toJSON());
    setPushEnabled(true);
  } });

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistration().then(registration => registration?.pushManager.getSubscription())
        .then(subscription => setPushEnabled(!!subscription)).catch(() => setPushEnabled(false));
    }
  }, [passport?.id]);

  const openNotification = async (item: AppNotification) => {
    if (!item.readAt) {
      try { await read.mutateAsync(item.id); } catch { /* Keep the item unread if the request fails. */ }
    }
    navigate(item.url);
  };

  if (token && isPending) return <Typography role="status">Загрузка аккаунта…</Typography>;
  if (!passport) return <Stack spacing={2}>
    <Typography component="h1" variant="h4">Уведомления</Typography>
    <Typography>Войдите, чтобы увидеть свои уведомления.</Typography>
    <Button onClick={() => authHandler(location.pathname)}>Войти</Button>
  </Stack>;

  const items = notifications.data?.pages.flatMap(page => page.items) ?? [];
  return <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
    <Typography component="h1" variant="h4">Уведомления</Typography>
    <Tabs value={unreadOnly ? 'unread' : 'all'} onChange={(_event, value: 'all' | 'unread') => setUnreadOnly(value === 'unread')} aria-label="Фильтр уведомлений">
      <Tab value="all" label="Все" />
      <Tab value="unread" label="Непрочитанные" />
    </Tabs>
    {read.isError && <Alert severity="error">Не удалось отметить уведомление прочитанным.</Alert>}
    {notifications.isPending && <Typography role="status">Загрузка уведомлений…</Typography>}
    {notifications.isError && <Alert severity="error" action={<Button onClick={() => void notifications.refetch()}>Повторить</Button>}>Не удалось загрузить уведомления.</Alert>}
    {!notifications.isPending && !notifications.isError && !items.length &&
      <Typography color="text.secondary">{unreadOnly ? 'Непрочитанных уведомлений нет.' : 'Уведомлений пока нет.'}</Typography>}
    <Stack component="section" aria-label="Список уведомлений" spacing={1.5}>
      {items.map(item => <Card key={item.id} variant="outlined" sx={{ p: 2, bgcolor: item.readAt ? 'background.paper' : 'action.hover', borderColor: item.readAt ? 'divider' : 'primary.main', borderLeftWidth: item.readAt ? 1 : 4 }}>
        <Stack spacing={1}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: item.readAt ? 500 : 700 }}>{item.title}</Typography>
            {!item.readAt && <Chip size="small" color="primary" label="Новое" />}
          </Stack>
          <Typography>{item.body}</Typography>
          <Typography variant="caption" color="text.secondary">{moscowFormat(item.createdAt, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" onClick={() => void openNotification(item)}>Открыть</Button>
            {!item.readAt && <Button size="small" disabled={read.isPending} onClick={() => read.mutate(item.id)}>Отметить прочитанным</Button>}
          </Box>
        </Stack>
      </Card>)}
    </Stack>
    {notifications.hasNextPage && <Button disabled={notifications.isFetchingNextPage} onClick={() => void notifications.fetchNextPage()}>
      {notifications.isFetchingNextPage ? 'Загрузка…' : 'Показать ещё'}
    </Button>}
    <Button variant="text" disabled={push.isPending} onClick={() => push.mutate()}>
      {pushEnabled ? 'Отключить Push на этом устройстве' : 'Включить Push на этом устройстве'}
    </Button>
    {push.error && <Alert severity="info">{push.error.message}</Alert>}
  </Stack>;
}
