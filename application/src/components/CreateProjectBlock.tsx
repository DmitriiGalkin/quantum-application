import { Box, Typography, Button, Stack, Paper } from '@mui/material';

export default function CreateProjectBlock() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f5f7ff 0%, #eef2ff 100%)',
        border: '1px solid #e0e7ff',
      }}
    >
      <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
        <Box
          component="img"
          src="/teacher.svg"
          alt="Создание проекта"
          sx={{
            width: 300,
            height: 200,
            borderRadius: 2,
            objectFit: 'cover',
          }}
        />

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
            Создайте свой проект
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Вы можете объединить людей вокруг своей идеи, управлять задачами и развивать проект вместе с командой.
          </Typography>

          <Button
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
