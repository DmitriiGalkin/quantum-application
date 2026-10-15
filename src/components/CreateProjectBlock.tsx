import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function CreateProjectBlock({ onCreate }: { onCreate: () => void }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'action.selected',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'center' }}>
        <Box
          component="img"
          src="/teacher.svg"
          alt="Создание проекта"
          sx={{
            width: { xs: '100%', sm: 240 },
            maxWidth: '100%',
            flexShrink: 0,
            height: 200,
            borderRadius: 2,
            objectFit: 'cover',
          }}
        />

        <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
            Создайте свой проект
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Вы можете объединить людей вокруг своей идеи, управлять задачами и развивать проект вместе с командой.
          </Typography>

          <Button
            onClick={onCreate}
            variant="contained"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 2,
            }}
          >
            Создать проект
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
