import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { colors } from '../theme/design-tokens';

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
        bgcolor: colors.peach,
        color: colors.onPeach,
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

          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        </Box>

        {/* CTA */}
        <Button
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          onClick={onClick}
          sx={{
            whiteSpace: 'nowrap',
          }}
        >
          {buttonText}
        </Button>
      </Stack>
    </Box>
  );
}
