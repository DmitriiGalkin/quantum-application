import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Message from './Message.tsx';
import type { MessageDto } from '@shared/types';
import ReactMarkdown from 'markdown-to-jsx';
import React from 'react';
import StrategieList from '../StrategieList.tsx';

type ChatMessageListProps = {
  chatId: number;
  messages: MessageDto[];
  isSending: boolean;
};

function ChatMessageList({ messages, isSending }: ChatMessageListProps) {
  return (
    <>
      {messages.map(chatMessage => {
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
                {chatMessage?.meta?.target === 'auth' && <StrategieList />}
              </Stack>
            </Message>
          </Box>
        );
      })}

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
