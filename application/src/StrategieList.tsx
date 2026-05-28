import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { strategies } from './helper.ts';

function StrategieList() {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      {strategies.map(strategy => (
        <Button
          component="a"
          variant="contained"
          href={strategy.href}
          key={strategy.title}
          sx={{ minWidth: 120 }}
          onClick={() => {
            localStorage.setItem('redirect_after_login', window.location.pathname);
            localStorage.setItem('message_after_login', strategy.title);
          }}
        >
          <Box component="span" sx={{ mr: 1, fontWeight: 900 }}>
            {strategy.icon}
          </Box>
          {strategy.title}
        </Button>
      ))}
    </Stack>
  );
}

export default StrategieList;
