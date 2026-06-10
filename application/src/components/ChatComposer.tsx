import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useRef } from 'react';

type ChatComposerProps = {
  message: string;
  isSending: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
};

function ChatComposer({ message, isSending, onMessageChange, onSendMessage }: ChatComposerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 1200,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(8px)',
        px: 2,
        py: 1,
        pb: 'calc(8px + env(safe-area-inset-bottom))',
      }}
    >
      <Container maxWidth="md" disableGutters>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            placeholder="Введите сообщение..."
            variant="outlined"
            value={message}
            onChange={event => onMessageChange(event.target.value)}
            onKeyDown={event => {
              if (event.key !== 'Enter' || event.shiftKey) {
                return;
              }

              event.preventDefault();
              onSendMessage();
            }}
          />

          <IconButton
            aria-label="Отправить"
            disabled={!message.trim() || isSending}
            onClick={onSendMessage}
            sx={{
              color: isSending ? '#FF8F28' : '#111827',
              border: 1,
              borderColor: isSending ? '#FF8F28' : 'divider',
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Container>
    </Box>
  );
}

export default ChatComposer;
