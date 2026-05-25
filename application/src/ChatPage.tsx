import { useRef, useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppBar, Box, Container, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  fetchMessages,
  sendMessage,
  type Chat,
  //usePassport,
  type ChatMessage,
  type Workflow, createUser, type ChatTarget,
} from './requests';
import ChatWelcome from './ChatWelcome';
import ChatMessageList from './ChatMessageList';
import ChatComposer from './ChatComposer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCaption } from './helper.ts';
import type { User } from './types.ts';

const createDefaultChat = (workflow: Workflow): Chat => {
  switch (workflow) {
    case 'create_idea':
      return {
        target: 'user',
        messages: [
          {
            id: null,
            chatId: null,
            passportId: null,
            role: 'assistant',
            content: 'Раскажи о своем чаде?',
            source: 'text',
            metadata: null,
            createdAt: null,
          },
        ],
      };
  }
};

const getWorkflowTarget = (workflow: Workflow, target: ChatTarget) => {
  const activeUserId = localStorage.getItem('active_user_id');
  switch (workflow) {
    case 'create_idea': {
      if (!activeUserId) return 'user';
      if (target === 'user' && activeUserId) return 'idea';
      return 'none';
    }
  }
};

function ChatPage() {
  const [searchParams] = useSearchParams();
  const workflow = searchParams.get('workflow') as Workflow;
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const mutation = useMutation({
    mutationFn: sendMessage,
  });

  const { data: chat = createDefaultChat(workflow), isLoading: isMessagesLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchMessages(chatId!),
    enabled: !!chatId,
  });

  const mutation2 = useMutation({
    mutationFn: createUser,
  });

  const messages = useMemo(() => {
    return (chat?.messages as ChatMessage[]) || [];
  }, [chat]); // Пересоздаем массив только если объект chat изменился

  const target = chat?.target || 'none';
  const wTarget = getWorkflowTarget(workflow, chat.target);

  function createUserHandler (user: User) {
    mutation2.mutate(
      user,
      {
        onSuccess: response => {
          localStorage.setItem('active_user_id', String(response.id));
        },
        onError: error => {
          console.error('Ошибка отправки:', error);
          alert('Не удалось сохранить карточку ребенка. Попробуйте ещё раз.');
        },
      },
    );
  }

  function sendChatMessage(text: string) {
    const message = text.trim();

    if (!message || mutation.isPending) {
      return;
    }

    // --- ОПТИМИСТИЧЕСКОЕ ОБНОВЛЕНИЕ ---
    // Мы сразу добавляем сообщение в локальный кэш, чтобы пользователь видел его мгновенно.
    queryClient.setQueryData(
      ['chat', chatId], // Ключ запроса, который мы использовали в useQuery для получения сообщений
      (oldChat: Chat) => {
        return {
          ...oldChat,
          messages: [
            ...((oldChat?.messages as []) || []),
            {
              id: Math.random().toString(), // Временный ID
              content: message,
              role: 'user', // Или какая роль у отправителя
              createdAt: new Date().toISOString(),
              isOptimistic: true, // Флаг, чтобы можно было красиво отрисовать "серое" сообщение
            },
          ],
        };
      },
    );

    console.log(chatId, 'chatId');
    mutation.mutate(
      { chatId, message, target: wTarget },
      {
        onSuccess: response => {
          localStorage.setItem('active_chat_id', String(response.chatId));
          setMessage('');
          setChatId(response.chatId);
          queryClient.setQueryData(['chat', chatId], (oldChat: Chat) => {
            return {
              ...oldChat,
              messages: [...(oldChat.messages as []), response.message],
            };
          });
        },
        onError: error => {
          console.error('Ошибка отправки:', error);
          alert('Не удалось отправить сообщение. Попробуйте ещё раз.');

          queryClient.setQueryData(['chat', chatId], (oldChat: Chat) => {
            return {
              ...oldChat,
              messages: [...(oldChat.messages as []).slice(0, -1)],
            };
          });
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
    if (savedChatId) setChatId(Number(savedChatId));
  }, []);

  const handleSendMessage = () => sendChatMessage(message);

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
                {getCaption(wTarget)}
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
            onCreateUser={createUserHandler}
            //users={passport?.users || []}
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
