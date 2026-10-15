import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchParentConversation, fetchStartChat } from '../requests.ts';
import { useAuth } from '../providers/auth-context.ts';
import ConversationPanel from './ConversationPanel.tsx';

type ChatDialogProps = { open: boolean; onClose: () => void } & ({ teacherId: number; parentUserId?: never } | { parentUserId: number; teacherId?: never });

export default function ChatDialog({ open, teacherId, parentUserId, onClose }: ChatDialogProps) {
  const { passport } = useAuth();
  const { placeId, role } = useAuth();
  const parent = parentUserId !== undefined;
  const chat = useQuery({ queryKey: ['chat', passport?.id, parent ? 'parent' : 'teacher', parentUserId ?? teacherId, role, placeId],
    queryFn: () => parentUserId !== undefined ? fetchParentConversation(parentUserId) : fetchStartChat(teacherId!),
    enabled: open && !!passport, retry: false, staleTime: 0 });
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>{parent ? 'Чат с родителем' : 'Чат с преподавателем'}</DialogTitle>
    <DialogContent>
      {!passport ? <Typography>Войдите, чтобы открыть диалог.</Typography>
        : chat.isPending || (parent && chat.isFetching) ? <Typography>Загрузка диалога…</Typography>
          : chat.isError ? <Alert severity="error" action={<Button onClick={() => void chat.refetch()}>Повторить</Button>}>Не удалось открыть диалог.</Alert>
            : <ConversationPanel key={`${passport.id}:${chat.data.conversation.id}`} conversationId={chat.data.conversation.id} />}
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Закрыть</Button></DialogActions>
  </Dialog>;
}
