import type { MeetExtendedDto } from '@shared/types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/People';

type Props = {
  meet: MeetExtendedDto;
  isNextMeet?: boolean;
};

function Meet({ meet, isNextMeet }: Props) {
  return (
    <Box>
      <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,182,40,0.15)' }}>
        {isNextMeet && (
          <Typography variant="caption" color="text.secondary">
            Ближайшая встреча
          </Typography>
        )}
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1}>
            <Box
              sx={{
                width: 44,
                height: 56,
                borderRadius: 2,
                backgroundColor: 'rgba(255,182,40,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Typography variant="caption">
                {new Date(meet.startedAt).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '').toUpperCase()}
              </Typography>

              <Typography variant="h6">{new Date(meet.startedAt).getDate()}</Typography>
            </Box>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <div>
                  <Typography variant="body2">
                    {new Date(meet.startedAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    ул. Северодвинская 11
                  </Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{meet.price ? `${meet.price} ₽` : 'Бесплатно'}</Typography>
                </div>
                <Stack sx={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                    <PeopleIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                    <Typography variant="caption">{meet.users?.length || 0} идут</Typography>
                  </Stack>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default Meet;
