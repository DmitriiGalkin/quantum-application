import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchStartChat } from '../requests.ts';
import { useAuth } from '../providers/auth-context.ts';
import ConversationPanel from './ConversationPanel.tsx';

export default function ChatDialog({ open, teacherId, onClose }: { open: boolean; teacherId: number; onClose: () => void }) {
  const { passport } = useAuth();
  const chat = useQuery({ queryKey: ['chat', passport?.id, teacherId], queryFn: () => fetchStartChat(teacherId), enabled: open && !!passport, retry: false });
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Чат с преподавателем</DialogTitle>
    <DialogContent>
      {!passport ? <Typography>Войдите, чтобы написать преподавателю.</Typography>
        : chat.isPending ? <Typography>Загрузка диалога…</Typography>
          : chat.isError ? <Alert severity="error" action={<Button onClick={() => void chat.refetch()}>Повторить</Button>}>Не удалось открыть диалог.</Alert>
            : <ConversationPanel key={`${passport.id}:${chat.data.conversation.id}`} conversationId={chat.data.conversation.id} />}
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Закрыть</Button></DialogActions>
  </Dialog>;
}
