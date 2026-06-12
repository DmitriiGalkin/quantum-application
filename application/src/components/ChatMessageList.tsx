import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Message from './Message.tsx';
import type { CreateMessageDto } from '@shared/types';
import ReactMarkdown from 'markdown-to-jsx';
import React from 'react';
import MapIcon from '@mui/icons-material/Map';
import { IconButton } from "@mui/material";

type ChatMessageListProps = {
  messages: CreateMessageDto[];
  isSending: boolean;
  setIsMapOpen: (open: boolean) => void;
};

function ChatMessageList({ messages, isSending, setIsMapOpen }: ChatMessageListProps) {
  return (
    <>
      {messages.map(chatMessage => {
        return (
          <Message role={chatMessage.role}>
            <Stack spacing={2}>
              <Typography>
                <ReactMarkdown>{chatMessage.content}</ReactMarkdown>
              </Typography>
              {chatMessage.target === 'place' && chatMessage.role === 'assistant' && (
                <IconButton onClick={() => setIsMapOpen(true)}>
                  <MapIcon />
                </IconButton>
              )}
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
