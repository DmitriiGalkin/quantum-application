import Paper from '@mui/material/Paper';
import type { MessageDto } from '@shared/types';
import React from 'react';

type ChatBubbleProps = {
  role: MessageDto['role'];
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
        borderRadius: isUserMessage ? `16px 16px ${onClick ? '16px' : '0'} 16px` : '16px 16px 16px 0',
        border: isUserMessage ? 0 : 1,
        borderColor: 'divider',
        bgcolor: isUserMessage ? userBgColor : 'white',
        color: isUserMessage ? 'white' : 'text.primary',
        textShadow: isUserMessage ? '0 1px 3px rgba(0, 0, 0, 0.8)' : undefined,
      }}
      onClick={onClick}
    >
      {children}
    </Paper>
  );
}
