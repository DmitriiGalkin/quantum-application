import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Message from './Message.tsx';
import type { MessageDto } from '@shared/types';
import ReactMarkdown from 'markdown-to-jsx';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider.tsx';
import { PlaceMap } from './PlaceMap.tsx';

type ChatMessageListProps = {
  chatId: number;
  messages: MessageDto[];
  isSending: boolean;
  data: any[];
};

function ChatMessageList({ messages, isSending, data }: ChatMessageListProps) {
  const { token, authHandler } = useAuth();

  const [authTriggered, setAuthTriggered] = useState(false);

  useEffect(() => {
    const hasAuthMessage = messages.some(m => m?.target === 'auth');

    if (!token && hasAuthMessage && !authTriggered) {
      authHandler();
      setAuthTriggered(true);
    }
  }, [messages, authTriggered]);

  return (
    <>
      {messages.map(chatMessage => {
        return (
          <Message role={chatMessage.role}>
            <Stack spacing={2}>
              <Typography>
                <ReactMarkdown>{chatMessage.content}</ReactMarkdown>
                {chatMessage.target === 'place' && Boolean(data.length) && <PlaceMap lat={55.75} lng={37.62} zoom={12} places={data} />}
              </Typography>
            </Stack>
          </Message>
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
