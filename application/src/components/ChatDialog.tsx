import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchConversation, fetchCreateMessage, fetchStartChat } from '../requests';

type Props = {
  open: boolean;
  teacherId: number;
  onClose: () => void;
};

const ChatDialog: React.FC<Props> = ({ open, teacherId, onClose }) => {
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Загрузка или создание чата
  const { data: chat, isLoading, error } = useQuery({
    queryKey: ['chat', teacherId],
    queryFn: () => fetchStartChat(teacherId),
    enabled: open
  });

  console.log(chat)

  // Загрузка сообщений чата
  const { data: conversation } = useQuery({
    queryKey: ['messages', chat?.conversation.id],
    queryFn: () => fetchConversation(chat?.conversation.id || 0),
    enabled: !!chat?.conversation.id
  });

  // Мутация для отправки сообщения
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => fetchCreateMessage(chat?.conversation.id || 0, content),
    onMutate: async (content) => {
      setSending(true);
      setSendError(null);
      
      // Оптимистичное обновление
      await queryClient.cancelQueries({ queryKey: ['messages', chat?.conversation.id] });
      
      const previousMessages = queryClient.getQueryData(['messages', chat?.conversation.id]);
      
      queryClient.setQueryData(['messages', chat?.conversation.id], (old: any) => ({
        ...old,
        messages: [
          ...(old?.messages || []),
          {
            id: Date.now(), // временный ID
            text: content,
            createdAt: new Date().toISOString(),
            senderId: 0, // текущий пользователь
          },
        ],
      }));
      
      return { previousMessages };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chat?.conversation.id] });
      setNewMessage('');
      setSending(false);
    },
    onError: (error, _, context) => {
      setSendError('Ошибка отправки сообщения');
      queryClient.setQueryData(['messages', chat?.conversation.id], context?.previousMessages);
      setSending(false);
    }
  });

  const handleSend = () => {
    if (newMessage.trim() && chat?.conversation.id) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Typography color="error">Ошибка загрузки чата</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Чат с учителем</DialogTitle>
      <DialogContent>
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {conversation?.messages?.map(message => (
            <ListItem key={message.id}>
              <ListItemText primary={message.text} secondary={new Date(message.createdAt).toLocaleString()} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <IconButton 
            onClick={handleSend} 
            color="primary"
            disabled={sending || !newMessage.trim()}
          >
            {sending ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
        {sendError && (
          <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
            {sendError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatDialog;