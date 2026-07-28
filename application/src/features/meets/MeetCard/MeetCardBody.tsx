import { Box, Chip, Stack, Typography } from '@mui/material';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import PeopleIcon from '@mui/icons-material/People';
import CurrencyRubleIcon from '@mui/icons-material/CurrencyRuble';

import type { MeetExtendedDto } from '@shared/types';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../../providers/AuthProvider.tsx';

interface Props {
  meet: MeetExtendedDto;
  isMember?: boolean;
}

export default function MeetCardBody({ meet, isMember }: Props) {
  const { activeContext } = useAuth();
  const name = meet.passport?.title ?? 'Unknown';
  const duration = meet.duration != null ? `${meet.duration} min` : '—';

  const paymentStatus = meet.isPaid ? 'paid' : meet.price != null ? 'pending' : undefined;
  const isPaid = paymentStatus === 'paid';

  return (
    <>
      <Stack spacing={1}>
        {/* TITLE */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              lineHeight: 1.2,
              fontWeight: 700,
            }}
          >
            {meet.projectTitle ?? 'Untitled meeting'}
          </Typography>
        </Box>

        {/* location */}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <LocationOnOutlinedIcon fontSize="small" color="disabled" />
          <Typography variant="body2">{meet.place?.address ?? 'Unknown location'}</Typography>
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        {/* META INFO */}
        <Stack spacing={1}>
          {/* Преподаватель */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <PersonIcon fontSize="small" color="disabled" />
            <Typography variant="body2">{name}</Typography>
          </Stack>

          {/* duration */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ScheduleOutlinedIcon fontSize="small" color="disabled" />
            <Typography variant="body2">{duration}</Typography>
          </Stack>

          {/* participants (aggregated) */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <PeopleIcon fontSize="small" color="disabled" />

            <Typography variant="body2">
              {meet.users?.length ?? 0}/{meet.capacity} участников проекта
            </Typography>
          </Stack>

          {meet.price ? (
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CurrencyRubleIcon fontSize="small" color="disabled" />

                <Typography variant="body2">{meet.price}</Typography>
              </Stack>

              {isMember && activeContext.role === 'user' && !isPaid && <Chip size="small" label="Ожидает оплату" color="warning" />}
              {activeContext.role === 'user' && isPaid && <Chip size="small" label="Оплачено" color="success" />}
            </Stack>
          ) : (
            <Typography variant="body2">Бесплатная встреча</Typography>
          )}
        </Stack>
      </Stack>
    </>
  );
}
