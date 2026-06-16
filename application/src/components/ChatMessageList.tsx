import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Message from './Message.tsx';
import { type CreateMessageDto, Role } from '@shared/types';
import ReactMarkdown from 'markdown-to-jsx';
import React from 'react';

type ChatMessageListProps = {
  messages: CreateMessageDto[];
  isSending: boolean;
};

function ChatMessageList({ messages, isSending }: ChatMessageListProps) {
  return (
    <>
      {messages.map(chatMessage => {
        return (
          <Message role={chatMessage.role}>
            <Stack spacing={2}>
              <Typography>
                <ReactMarkdown>{chatMessage.content}</ReactMarkdown>
              </Typography>
            </Stack>
          </Message>
        );
      })}

      {isSending && (
        <Message role={Role.ASSISTANT}>
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
