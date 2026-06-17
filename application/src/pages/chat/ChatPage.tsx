import { useAuth } from '../../providers/AuthProvider.tsx';
import { useChat } from './useChat.ts';
import { useChatEffects } from './useChatEffects.ts';
import { useEffect, useRef } from 'react';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MapDialog from '../../components/MapDialog.tsx';
import Typography from '@mui/material/Typography';
import ChatMessageList from '../../components/ChatMessageList.tsx';
import ChatComposer from '../../components/ChatComposer.tsx';
import type { Target } from '@shared/types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { Link, useSearchParams } from 'react-router-dom';
import ChatIntroduction from '../../components/ChatIntroduction.tsx';
import IdeaCard from '../../components/IdeaCard.tsx';
import ProjectCard from '../../components/ProjectCard.tsx';
import MeetCard from '../../components/MeetCard.tsx';

function ChatPage() {
  const { token, authHandler } = useAuth();

  const [searchParams] = useSearchParams();
  const target = (searchParams.get('target') ?? 'idea') as Target;
  const projectId = (searchParams.get('projectId') ?? '0') as string;
  const ideaId = (searchParams.get('ideaId') ?? '0') as string;

  const chat = useChat(target, Number(projectId), Number(ideaId));

  const effects = useChatEffects({
    ui: chat.context?.ui,
    messages: chat.messages,
    sendMessage: chat.sendMessage,
    token,
    authHandler,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

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
        <Stack spacing={2}>
          {chat.isLoading && <Typography>Загрузка...</Typography>}

          <ChatIntroduction target={target} />

          <ChatMessageList messages={chat.messages} isSending={chat.isSending} />

          <MapDialog
            isAuthModalOpen={effects.isMapOpen}
            setIsAuthModalOpen={effects.setIsMapOpen}
            onClick={place => {
              chat.sendMessage(place.title, { place });
              effects.setIsMapOpen(false);
            }}
          />

          {chat?.context?.ui === 'ideas' && (
            <>
              {chat.context.ideas?.map((idea) => (
                <IdeaCard idea={idea} actionType="draft" onSelect={() => chat.sendMessage(idea.title, { idea })} />
              ))}
            </>
          )}
          {chat?.context?.ui === 'project' && chat?.context?.project && <ProjectCard project={chat.context.project} />}
          {chat?.context?.ui === 'meet' && chat?.context?.meet && <MeetCard meet={chat.context.meet} />}
          {chat?.context?.ui === 'idea' && chat?.context?.idea && <IdeaCard idea={chat.context.idea} />}
        </Stack>
      </Container>

      <div ref={messagesEndRef} />

      <ChatComposer
        message={chat.message}
        isSending={chat.isSending}
        onMessageChange={chat.setMessage}
        onSendMessage={() => chat.sendMessage(chat.message)}
      />
    </Box>
  );
}

export default ChatPage;
