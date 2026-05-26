import { useRef, useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AppBar, Box, Container, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  fetchMessages,
  fetchSendMessage,
  type ChatMessage,
  type Workflow,
  generateImage,
} from '../../requests';
import ChatWelcome from './ChatWelcome';
import ChatMessageList from './ChatMessageList';
import ChatComposer from './ChatComposer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addMessage,
  addOptimisticMessage,
  createDefaultChat,
  deleteOptimisticMessage,
  getCaption,
  getWorkflowTarget,
} from './helper.ts';
import type { Project, User } from '../../types.ts';
import { getObjectFromMetadata } from '../../chatUtils.ts';
import UserCard from '../../UserCard.tsx';
import ProjectCard from '../../ProjectCard.tsx';
import Message from './Message.tsx';

function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const chatId = Number(id);
  const [searchParams] = useSearchParams();
  const workflow = searchParams.get('workflow') as Workflow;
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const mutation = useMutation({
    mutationFn: fetchSendMessage,
  });

  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchMessages(chatId),
    enabled: !!chatId,
  });

  function sendMessage(text: string) {
    const message = text.trim();

    if (!message || mutation.isPending) {
      return;
    }

    queryClient.setQueryData(['chat', chatId], addOptimisticMessage(message));
    setMessage('');

    mutation.mutate(
      { chatId, message, target: wTarget },
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

  const lastMessage = messages[messages.length-1];
  const metadata = getObjectFromMetadata(lastMessage?.metadata);
  console.log(metadata, 'metadata');

  const generateImageMutation = useMutation({
    mutationFn: generateImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
    },
  });

  const meta = messages.reduce((acc, message) => {
    const metadata = getObjectFromMetadata(message.metadata);
    if (!metadata) return acc;
    acc[metadata.target] = metadata.data;
    return acc;
  }, {});

  console.log(meta, 'meta');

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
          />

          {metadata?.target === 'idea' && !!lastMessage && (
            <>
              <ProjectCard
                project={metadata.data as Project}
                isGeneratingImage={generateImageMutation.isPending}
                generateImageHandler={() => generateImageMutation.mutate(lastMessage.id)}
              />
              <Message role={'user'} onClick={() => sendMessage('Создать идею проекта')}>
                <Typography>Создать идею проекта</Typography>
              </Message>
            </>
          )}

          {metadata?.target === 'user' && !!lastMessage && (
            <>
              <UserCard user={metadata.data as User} />
              <Message
                role={'user'}
                onClick={() => sendMessage('Создать карточку ученика')}
                isLastMessage={true}
              >
                <Typography>Создать карточку ученика</Typography>
              </Message>
            </>
          )}
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
