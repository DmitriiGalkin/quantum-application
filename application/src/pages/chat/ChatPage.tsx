import { useRef, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppBar, Box, Container, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  fetchMessages,
  fetchSendMessage,
} from '../../requests';
import ChatMessageList from './ChatMessageList';
import ChatComposer from './ChatComposer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addMessage,
  addOptimisticMessage,
  deleteOptimisticMessage,
} from './helper.ts';

const MESSAGE_AFTER_LOGIN_STORAGE_KEY = 'message_after_login';


function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const chatId = Number(id);
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const mutation = useMutation({
    mutationFn: fetchSendMessage,
  });

  const { data: chat, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchMessages(chatId),
    enabled: !!chatId,
  });
  const messages = chat?.messages || [];

  function sendMessage(text: string) {
    const message = text.trim();

    if (!message || mutation.isPending) {
      return;
    }

    queryClient.setQueryData(['chat', chatId], addOptimisticMessage(message));
    setMessage('');

    mutation.mutate(
      { chatId, message },
      {
        onSuccess: response => {
          queryClient.setQueryData(['chat', chatId], addMessage(response.message));
        },
        onError: error => {
          console.error('Ошибка отправки:', error);
          alert('Не удалось отправить сообщение. Попробуйте ещё раз.');

          queryClient.setQueryData(['chat', chatId], deleteOptimisticMessage);
        },
      },
    );
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages]);

  const sendMessageHandle = () => sendMessage(message);

  const metadata = {} as any //getObjectFromMetadata(lastMessage?.metadata);
  console.log('metadata', metadata);

  // const generateImageMutation = useMutation({
  //   mutationFn: generateImage,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
  //   },
  // });

  useEffect(() => {
    const currentMessage = localStorage.getItem(MESSAGE_AFTER_LOGIN_STORAGE_KEY);
    console.log('currentMessage', currentMessage);
    if (currentMessage) {
      sendMessage(currentMessage);
      localStorage.removeItem(MESSAGE_AFTER_LOGIN_STORAGE_KEY);
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={1}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundImage: 'linear-gradient(to bottom, #FFB628, #FF8F28)',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton component={Link} to="/" aria-label="Назад" sx={{ color: 'white' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.2, color: 'white' }}>
              Ассистент
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', color: 'white' }}>
              <span className="pulse-circle"></span>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                тест
              </Typography>
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="md"
        sx={{
          py: 3,
          pb: 8,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={2} sx={{ flexGrow: 1 }}>
          {/*{target === 'idea' && <ChatWelcome />}*/}

          {isMessagesLoading && (
            <Typography color="text.secondary" sx={{ alignSelf: 'center' }}>
              Загружаем историю...
            </Typography>
          )}

          <ChatMessageList
            chatId={chatId as number}
            messages={messages}
            isSending={mutation.isPending}
          />

        </Stack>
      </Container>
      <Box ref={messagesEndRef} />
      <ChatComposer
        message={message}
        isSending={mutation.isPending}
        onMessageChange={setMessage}
        onSendMessage={sendMessageHandle}
      />
    </Box>
  );
}

export default ChatPage;
