import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { Link } from 'react-router-dom';
import { fetchNotificationUnreadCount } from '../requests.ts';
import { useAuth } from '../providers/auth-context.ts';

export default function NotificationCenter({ messageCount }: { messageCount: number }) {
  const { passport } = useAuth();
  const notifications = useQuery({
    queryKey: ['notification-count', passport?.id], queryFn: fetchNotificationUnreadCount,
    enabled: !!passport, refetchInterval: 15000, retry: false,
  });
  const count = notifications.data?.count ?? 0;

  useEffect(() => {
    const nav = navigator as Navigator & { setAppBadge?(count: number): Promise<void>; clearAppBadge?(): Promise<void> };
    const total = passport ? count + messageCount : 0;
    void (total ? nav.setAppBadge?.(total) : nav.clearAppBadge?.())?.catch(() => undefined);
  }, [count, messageCount, passport]);

  if (!passport) return null;
  return <IconButton component={Link} to="/notifications" aria-label={`Уведомления: ${count} непрочитанных`} title="Уведомления">
    <Badge badgeContent={count} color="error"><NotificationsOutlinedIcon /></Badge>
  </IconButton>;
}
