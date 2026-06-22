import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Message from './Message.tsx';

function ChatWelcome() {
  return (
    <>
      <Stack spacing={2}>
        <Box
          component="img"
          src="/parent.svg"
          alt="Воплощаем идеи детских проектов"
          sx={{
            width: '100%',
            maxHeight: 220,
            objectFit: 'cover',
            borderRadius: 3,
          }}
        />

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
            Воплощаем идеи детских проектов
          </Typography>

          <Typography sx={{ color: 'text.secondary' }}>
            Даем возможность придумать свой собственный проект. Помогаем подбирать для ребенка интересные проекты, секции, кружки и мастер классы.
            Гении всегда делятся идеями
          </Typography>
        </Box>
      </Stack>

      <Message role="assistant">
        <Typography sx={{ color: 'text.secondary' }}>Расскажите поподробнее идею проекта вашего ребенка. В чем она заключается ?</Typography>
      </Message>
    </>
  );
}

export default ChatWelcome;
