import { Box, Typography, Button, Stack } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

type Props = {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
};

export default function AIBanner({ title, description, buttonText, onClick }: Props) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, #FFB628 0%, #FFD978 100%)',
        color: '#111',
        mb: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
      >
        {/* TEXT */}
        <Box>
          <Typography variant="h6">{title}</Typography>

          <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
            {description}
          </Typography>
        </Box>

        {/* CTA */}
        <Button
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          onClick={onClick}
          sx={{
            backgroundColor: 'secondary.main',
            color: '#fff',
            whiteSpace: 'nowrap',
            '&:hover': {
              backgroundColor: '#3B1992',
            },
          }}
        >
          {buttonText}
        </Button>
      </Stack>
    </Box>
  );
}
