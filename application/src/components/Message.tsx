import Paper from '@mui/material/Paper';
import type { ChatMessage } from '../requests.ts';
import React from 'react';

type ChatBubbleProps = {
  role: ChatMessage['role'];
  children: React.ReactNode;
  onClick?: () => void;
  isLastMessage?: boolean;
};

export default function ChatBubble({ role, children, onClick, isLastMessage }: ChatBubbleProps) {
  const isUserMessage = role === 'user';
  const userBgColor = isLastMessage ? '#FFB628' : '#FFD130';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        alignSelf: isUserMessage ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        borderRadius: isUserMessage
          ? `16px 16px ${onClick ? '16px' : '0'} 16px`
          : '16px 16px 16px 0',
        border: isUserMessage ? 0 : 1,
        borderColor: 'divider',
        bgcolor: isUserMessage ? userBgColor : 'white',
        color: isUserMessage ? 'white' : 'text.primary',
      }}
      onClick={onClick}
    >
      {children}
    </Paper>
  );
}
