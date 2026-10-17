import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { Link } from 'react-router-dom';
import { fetchNotifications, fetchReadNotification, fetchPushConfig, fetchPushSubscribe, fetchPushUnsubscribe } from '../requests.ts';
import { useAuth } from '../providers/auth-context.ts';
import ClosableDialogTitle from './ClosableDialogTitle.tsx';
import { getBrowser } from '../shared/lib/browser.ts';
export default function NotificationCenter({ messageCount }: { messageCount: number }) {
  const { passport } = useAuth();
  const [open,setOpen] = useState(false);
  const [pushEnabled,setPushEnabled] = useState(false);
  const client = useQueryClient();
  const notifications = useQuery({ queryKey:['notifications',passport?.id],queryFn:fetchNotifications,enabled:!!passport,refetchInterval:15000,retry:false });
  const count = (notifications.data ?? []).filter(n => !n.readAt && !n.url.startsWith('/chats/')).length;
  const push = useMutation({ mutationFn:async () => {
    const browser = getBrowser();
    if (!browser || !('serviceWorker' in navigator) || !('PushManager' in browser) || !('Notification' in browser)) throw new Error('Этот браузер не поддерживает Push');
    if (!pushEnabled && await Notification.requestPermission() !== 'granted') throw new Error('Уведомления отключены в настройках браузера');
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) throw new Error('Сервис уведомлений ещё не готов. Обновите страницу.');
    const subscription = await registration.pushManager.getSubscription();
    if (pushEnabled && subscription) {
      await fetchPushUnsubscribe(subscription.endpoint);
      await subscription.unsubscribe(); setPushEnabled(false); return;
    }
    const config = await fetchPushConfig();
    if (!config.publicKey) throw new Error('Push ещё не настроен на сервере');
    const base64 = config.publicKey.replace(/-/g,'+').replace(/_/g,'/');
    const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length/4)*4,'=')),c => c.charCodeAt(0));
    const next = subscription ?? await registration.pushManager.subscribe({ userVisibleOnly:true,applicationServerKey:bytes });
    await fetchPushSubscribe(next.toJSON()); setPushEnabled(true);
  } });
  useEffect(() => {
    if ('serviceWorker' in navigator) void navigator.serviceWorker.getRegistration().then(r => r?.pushManager.getSubscription()).then(s => setPushEnabled(!!s)).catch(() => setPushEnabled(false));
  }, [passport?.id]);
  useEffect(() => {
    const nav = navigator as Navigator & { setAppBadge?(count: number): Promise<void>; clearAppBadge?(): Promise<void> };
    const total = passport ? count + messageCount : 0;
    void (total ? nav.setAppBadge?.(total) : nav.clearAppBadge?.())?.catch(() => undefined);
  }, [count,messageCount,passport]);
  if (!passport) return null;
  return <>
    <IconButton aria-label="Уведомления" onClick={() => setOpen(true)}><Badge badgeContent={count} color="error"><NotificationsOutlinedIcon /></Badge></IconButton>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <ClosableDialogTitle onClose={() => setOpen(false)}>Уведомления</ClosableDialogTitle>
      <DialogContent><Stack spacing={2}>
        <Button disabled={push.isPending} onClick={() => push.mutate()}>{pushEnabled ? 'Отключить Push на этом устройстве' : 'Включить Push на этом устройстве'}</Button>
        {push.error && <Alert severity="info">{push.error.message}</Alert>}
        {notifications.isError && <Alert severity="error" action={<Button onClick={() => void notifications.refetch()}>Повторить</Button>}>Не удалось загрузить уведомления</Alert>}
        {notifications.isPending && <Typography>Загрузка…</Typography>}
        {notifications.data?.length === 0 && <Typography>Важных уведомлений пока нет.</Typography>}
        {notifications.data?.map(item => <Stack key={item.id} spacing={1} sx={{ p:2,bgcolor:item.readAt ? undefined : 'action.hover',borderRadius:2 }}>
          <Typography sx={{ fontWeight:600 }}>{item.title}</Typography><Typography>{item.body}</Typography>
          <Button component={Link} to={item.url} onClick={() => {
            void fetchReadNotification(item.id).then(() => client.invalidateQueries({ queryKey:['notifications',passport.id] })); setOpen(false);
          }}>Открыть</Button>
        </Stack>)}
      </Stack></DialogContent>
    </Dialog>
  </>;
}
