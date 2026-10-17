import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchConversations } from '../requests.ts';
import { useAuth } from '../providers/auth-context.ts';
import ConversationPanel from '../components/ConversationPanel.tsx';

export default function ChatPage() {
  const { passport, token, authHandler, isPending } = useAuth();
  const { id } = useParams();
  const location = useLocation();
  const conversations = useQuery({
    queryKey: ['conversations', passport?.id], queryFn: fetchConversations, enabled: !!passport,
    refetchInterval: 10000, retry: false,
  });
  if (token && isPending) return <Typography role="status">Загрузка аккаунта…</Typography>;
  if (!passport) return <Stack spacing={2}>
    <Typography component="h1" variant="h4">Сообщения</Typography>
    <Typography>Войдите, чтобы открыть свои диалоги.</Typography>
    <Button onClick={() => authHandler(location.pathname + location.search)}>Войти</Button>
  </Stack>;
  if (id) return <Paper sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 900, mx: 'auto', width: '100%', boxSizing: 'border-box' }}>
    <Button component={Link} to="/chats">Все сообщения</Button>
    {/^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id))
      ? <ConversationPanel key={`${passport.id}:${id}`} conversationId={Number(id)} />
      : <Alert severity="error">Диалог не найден.</Alert>}
  </Paper>;
  return <Stack spacing={2}>
    <Typography component="h1" variant="h4">Сообщения</Typography>
    {conversations.isPending ? <Typography role="status">Загрузка диалогов…</Typography>
      : conversations.isError ? <Alert severity="error" action={<Button onClick={() => void conversations.refetch()}>Повторить</Button>}>Не удалось загрузить диалоги.</Alert>
        : <Paper><List aria-label="Диалоги">
          {conversations.data.map(conversation => <ListItemButton component={Link} to={`/chats/${conversation.id}`} key={conversation.id}>
            {!!conversation.unreadCount && <Chip size="small" color="primary" label={conversation.unreadCount} aria-label="Непрочитанные сообщения" sx={{ mr: 1 }} />}
            <ListItemAvatar><Avatar src={conversation.counterpart?.image || undefined} /></ListItemAvatar>
            <ListItemText primary={conversation.counterpart?.title || 'Собеседник'} sx={{ overflowWrap: 'anywhere' }}
              secondary={conversation.lastMessage ? `${conversation.lastMessage.text} · ${informationDateTime(conversation.lastMessage.createdAt)} МСК` : 'Сообщений пока нет'}
              slotProps={{ secondary: { sx: { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } } }} />
          </ListItemButton>)}
          {!conversations.data.length && <Typography sx={{ p: 2 }}>Диалогов пока нет. Написать преподавателю можно на странице проекта.</Typography>}
        </List></Paper>}
  </Stack>;
}
import { informationDateTime } from '../features/meets/moscow-time.ts';
