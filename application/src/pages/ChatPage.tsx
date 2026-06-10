import { useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchChat, fetchCreateChat, fetchSendMessage } from '../requests.ts';
import ChatMessageList from '../components/ChatMessageList.tsx';
import ChatComposer from '../components/ChatComposer.tsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addMessage, addOptimisticMessage, deleteOptimisticMessage } from '../components/helper.ts';
import type { ChatTarget } from '@shared/types';
import Message from '../components/Message.tsx';
import { ACTIVE_CHAT_ID_STORAGE_KEY } from '../components/HomeDrawer.tsx';

const MESSAGE_AFTER_LOGIN_STORAGE_KEY = 'message_after_login';

function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const target = (searchParams.get('target') ?? 'idea') as ChatTarget;
  const activeChatId = localStorage.getItem(ACTIVE_CHAT_ID_STORAGE_KEY);
  const [chatId, setChatId] = useState<number | null>(activeChatId ? Number(activeChatId) : null);

  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const mutation = useMutation({
    mutationFn: fetchSendMessage,
  });

  const createChatMutation = useMutation({
    mutationFn: fetchCreateChat,
    onSuccess: ({ chatId }) => {
      setChatId(chatId);
    },
  });

  const { data: chat, isLoading: isChatLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchChat({ chatId: chatId!, target }),
    enabled: !!chatId,
  });

  console.log(chat, 'chat');

  const messages = chat?.messages || [];

  async function sendMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed || mutation.isPending) return;

    // 👉 если чата нет — создаём
    if (!chatId) {
      createChatMutation.mutate(
        { target },
        {
          onSuccess: ({ chatId }) => {
            localStorage.setItem(ACTIVE_CHAT_ID_STORAGE_KEY, String(chatId));
            setSearchParams({});

            queryClient.setQueryData(['chat', chatId], addOptimisticMessage(trimmed));
            setMessage('');

            mutation.mutate(
              { chatId, message: trimmed, target },
              {
                onSuccess: response => {
                  queryClient.setQueryData(['chat', chatId], addMessage(response.message));
                },
                onError: () => {
                  queryClient.setQueryData(['chat', chatId], deleteOptimisticMessage);
                },
              },
            );
          },
        },
      );

      return;
    }

    // 👉 если чат есть — обычная отправка
    queryClient.setQueryData(['chat', chatId], addOptimisticMessage(trimmed));
    setMessage('');

    mutation.mutate(
      { chatId, message: trimmed, target },
      {
        onSuccess: response => {
          queryClient.setQueryData(['chat', chatId], addMessage(response.message));
        },
        onError: () => {
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

  const metadata = {} as any; //getObjectFromMetadata(lastMessage?.metadata);
  console.log('metadata', metadata);

  useEffect(() => {
    const currentMessage = localStorage.getItem(MESSAGE_AFTER_LOGIN_STORAGE_KEY);
    console.log('currentMessage', currentMessage);
    if (currentMessage) {
      sendMessage(currentMessage);
      localStorage.removeItem(MESSAGE_AFTER_LOGIN_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const hasTargetInUrl = searchParams.has('target');

    if (hasTargetInUrl) {
      // 👉 очищаем старый чат
      localStorage.removeItem(ACTIVE_CHAT_ID_STORAGE_KEY);

      // 👉 сбрасываем состояние
      setChatId(null);
    }
  }, [searchParams]);

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
            <Typography sx={{ fontWeight: 800, lineHeight: 1.2, color: 'white' }}>Ассистент</Typography>
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

          {isChatLoading && (
            <Typography color="text.secondary" sx={{ alignSelf: 'center' }}>
              Загружаем историю...
            </Typography>
          )}

          {target === 'idea' && (
            <Stack spacing={2}>
              <Box
                component="img"
                src="/parent.svg"
                alt="example"
                sx={{
                  width: '100%',
                  maxWidth: 350,
                  objectFit: 'contain', // важно!
                  alignItems: 'center',
                }}
              />
              <Typography>
                Воплощаем идеи детских проектов Даем возможность придумать свой собственный проект. Помогаем подбирать для ребенка интересные проекты,
                секции, кружки и мастер классы.
              </Typography>
              <Message role="assistant">
                <Typography>
                  Прежде чем мы сформируем идею Вашего ребенка и загрузим ее в проект, расскажите сперва немного о ребенке: как его зовут, возраст,
                  парочку слов о его увлечениях?
                </Typography>
              </Message>
            </Stack>
          )}

          {target === 'project' && (
            <Stack spacing={2}>
              <Box
                component="img"
                src="/teacher.svg"
                alt="example"
                sx={{
                  width: '100%',
                  maxWidth: 350,
                  objectFit: 'contain', // важно!
                  alignItems: 'center',
                }}
              />
              <Typography>
                Помогаем привлекать учеников. Даем возможность мастерам и педагогам развивать детские идеи проектов. Помогаем наполнять группы,
                подбирать оптимальное время и место проведения встреч.
              </Typography>
              <Message role="assistant">
                <Typography>
                  Прежде чем мы сформируем и создадим Ваш проект на базе детских идей, расскажите сперва немного о себе: ваш профессионалный род деятельности и интересы, которые бы Вы могли разделить вместе с детьми?
                </Typography>
              </Message>
            </Stack>
          )}

          <ChatMessageList chatId={chatId as number} messages={messages} isSending={mutation.isPending} />
        </Stack>
      </Container>
      <Box ref={messagesEndRef} />
      <ChatComposer message={message} isSending={mutation.isPending} onMessageChange={setMessage} onSendMessage={sendMessageHandle} />
    </Box>
  );
}

export default ChatPage;
