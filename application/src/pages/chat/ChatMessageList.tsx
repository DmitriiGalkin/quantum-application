import { Box, Stack, Typography } from '@mui/material';
import Message from './Message';
import { type ChatMessage } from '../../requests';
import ReactMarkdown from 'markdown-to-jsx';
import React from 'react';
import ProjectCard from '../../ProjectCard.tsx';
import type { Project, User } from '../../types.ts';
import UserCard from '../../UserCard.tsx';
import StrategieList from '../../StrategieList.tsx';

type ChatMessageListProps = {
  chatId: number;
  messages: ChatMessage[];
  isSending: boolean;
};

function ChatMessageList({
  messages,
  isSending,
}: ChatMessageListProps) {

  return (
    <>
      {messages.map((chatMessage) => {
        return (
          <Box
            key={chatMessage.id}
            sx={{
              alignSelf: chatMessage.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Message role={chatMessage.role}>
              <Stack spacing={2}>
                <Typography>
                  <ReactMarkdown>{chatMessage.content}</ReactMarkdown>
                </Typography>

                {chatMessage?.meta?.target === 'user' && !!chatMessage?.meta?.data && (
                  <UserCard user={chatMessage?.meta?.data as User} />
                )}
                {chatMessage?.meta?.target === 'idea' && !!chatMessage?.meta?.data && (
                  <ProjectCard project={chatMessage?.meta?.data as Project} />
                )}
                {chatMessage?.meta?.target === 'auth' && <StrategieList />}
              </Stack>
            </Message>
          </Box>
        );
      })}

      {/*<Message role={'assistant'}>*/}
      {/*  <Typography>Интересно, чья это идея?</Typography>*/}
      {/*</Message>*/}

      {/*<Stack spacing={2} sx={{ flexGrow: 1 }} direction="row">*/}
      {/*  {users.map(user => (*/}
      {/*    <UserCard key={user.id} user={user} />*/}
      {/*  ))}*/}
      {/*</Stack>*/}

      {isSending && (
        <Message role={'assistant'}>
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </Message>
      )}
    </>
  );
}

export default React.memo(ChatMessageList);
