import { useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchMessages, sendMessage, type ChatTarget, fetchPassport } from './requests';
import ChatWelcome from './ChatWelcome';
import ChatMessageList from './ChatMessageList';
import type { SpeechRecognition } from './chatUtils';
import ChatComposer from './ChatComposer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from './api.ts';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function ChatPage() {
  const accessToken = getAccessToken();
  const [searchParams] = useSearchParams();
  const target = searchParams.get('target') as ChatTarget;
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const mutation = useMutation({
    mutationFn: sendMessage,
  });

  const { data: messages = [], isLoading: isMessagesLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => fetchMessages(chatId!),
    enabled: !!chatId,
  });

  const { data: passport } = useQuery({
    queryKey: ['passport'],
    queryFn: fetchPassport,
    enabled: Boolean(accessToken),
  });

  const getCaption = (target: ChatTarget): string => {
    switch (target) {
      case 'idea':
        return 'Помогаю придумать идею проекта';
      case 'user':
        return 'Помогаю придумать идею проекта';
      default:
        return 'Отдыхаю'
    }
  }

  async function sendChatMessage(text: string) {
    const message = text.trim();

    if (!message || mutation.isPending) {
      return;
    }

    // --- ОПТИМИСТИЧЕСКОЕ ОБНОВЛЕНИЕ ---
    // Мы сразу добавляем сообщение в локальный кэш, чтобы пользователь видел его мгновенно.
    queryClient.setQueryData(
      ['messages', chatId], // Ключ запроса, который мы использовали в useQuery для получения сообщений
      (oldMessages = []) => [
        ...(oldMessages as []),
        {
          id: Math.random().toString(), // Временный ID
          content: message,
          role: 'user', // Или какая роль у отправителя
          createdAt: new Date().toISOString(),
          isOptimistic: true, // Флаг, чтобы можно было красиво отрисовать "серое" сообщение
        },
      ],
    );

    mutation.mutate(
      { chatId, message, target },
      {
        onSuccess: response => {
          localStorage.setItem('active_chat_id', String(response.chatId));
          setMessage('');
          queryClient.setQueryData(['messages', chatId], oldMessages => [
            ...(oldMessages as []),
            response.message,
          ]);
        },
        onError: (error) => {
          console.error('Ошибка отправки:', error);
          alert('Не удалось отправить сообщение. Попробуйте ещё раз.');

          queryClient.setQueryData(
            ['messages', chatId],
            (oldMessages = []) => [
              ...(oldMessages as []).slice(0, -1),
            ],
          );
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

  useEffect(() => {
      const savedChatId = localStorage.getItem('active_chat_id');
      if (savedChatId) setChatId(Number(savedChatId))
  }, []);


  const handleSendMessage = async () => {
    await sendChatMessage(message);
  };

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
                {getCaption(target)}
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
          {target === 'idea' && <ChatWelcome />}

          {isMessagesLoading && (
            <Typography color="text.secondary" sx={{ alignSelf: 'center' }}>
              Загружаем историю...
            </Typography>
          )}

          <ChatMessageList
            chatId={chatId as number}
            messages={messages}
            isSending={mutation.isPending}
            onCreateProjectIdea={() => {
              sendChatMessage('Создать идею проекта');
            }}
            users={passport.users}
          />
        </Stack>
      </Container>
      <Box ref={messagesEndRef} />
      <ChatComposer
        message={message}
        isSending={mutation.isPending}
        onMessageChange={setMessage}
        onSendMessage={handleSendMessage}
      />
    </Box>
  );
}

export default ChatPage;
