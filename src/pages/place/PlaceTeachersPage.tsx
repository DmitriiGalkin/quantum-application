import { getBrowser } from '../../shared/lib/browser.ts';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, useSyncExternalStore } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { fetchAddTeacher, fetchPlaceTeachers, fetchRemoveTeacher, fetchLeavePlace } from '../../requests.ts';
import TeacherCard from '../../features/teacher/TeacherCard.tsx';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { useAuth } from '../../providers/auth-context.ts';
import Alert from '@mui/material/Alert';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import MenuButton, { type MenuItemType } from '../../components/MenuButton.tsx';

const subscribeToBrowser = () => () => {};
const canBrowserShare = () => Boolean(getBrowser()?.navigator.share);
const serverCannotShare = () => false;

export default function PlaceTeachersPage() {
  const { placeId, passport, role } = useAuth();
  const canShare = useSyncExternalStore(subscribeToBrowser, canBrowserShare, serverCannotShare);
  const [isPersonAddModalOpen, setIsPersonAddModalOpen] = useState(false);

  const [passportId, setPassportId] = useState('');

  const { data: teachers, refetch } = useQuery({
    queryKey: ['place-teachers', placeId],
    queryFn: fetchPlaceTeachers,
    enabled: Boolean(placeId),
  });

  const addTeacher = useMutation({
    mutationFn: () => fetchAddTeacher(Number(passportId)),
    onSuccess: () => {
      refetch();
      setPassportId('');
    },
  });

  const removeTeacher = useMutation({
    mutationFn: (teacherId: number) => fetchRemoveTeacher(placeId!, teacherId),
    onSuccess: () => refetch(),
  });
  const leaveTeacher = useMutation({
    mutationFn: () => fetchLeavePlace(placeId!),
    onSuccess: () => refetch(),
  });

  async function handleCopy() {
    const browser = getBrowser();
    if (browser) await browser.navigator.clipboard.writeText(`${browser.location.origin}/place/${placeId}/invite`);
  }

  async function handleShare() {
    const browser = getBrowser();
    if (!browser) return;
    if (!browser.navigator.share) {
      await handleCopy();
      return;
    }

    try {
      await browser.navigator.share({
        title: `Приглашение в центр`,
        text: 'Присоединяйтесь к центру в качестве преподавателя.',
        url: `${browser.location.origin}/place/${placeId}/invite`,
      });
    } catch {
      // Пользователь закрыл системное окно "Поделиться"
    }
  }

  if (!placeId) return null;

  return (
    <Box>
      <Stack spacing={1}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ color: 'white' }}>
            Учителя центра
          </Typography>

          <IconButton aria-label="Добавить преподавателя" onClick={() => setIsPersonAddModalOpen(true)}>
            <PersonAddIcon sx={{ color: 'white' }} />
          </IconButton>
        </Stack>

        <Stack spacing={2}>
          {(removeTeacher.error || leaveTeacher.error) && <Alert severity="error">{(removeTeacher.error ?? leaveTeacher.error)?.message}</Alert>}
          {teachers?.map(teacher => {
            const menuItems: MenuItemType[] = [];
            if (passport?.places.some(place => place.id === placeId) && role === 'teacher' && teacher.id === passport.id) {
              menuItems.push({ key: 'leave', label: 'Выйти из центра', icon: <PersonRemoveIcon fontSize="small" />, onClick: () => leaveTeacher.mutate() });
            }
            if (role === 'place') {
              menuItems.push({ key: 'delete', label: 'Удалить из центра', icon: <PersonRemoveIcon fontSize="small" />, onClick: () => removeTeacher.mutate(teacher.id) });
            }
            return <TeacherCard key={teacher.id} teacher={teacher} highlighted={teacher.id === passport?.id} actions={<MenuButton menuItems={menuItems} />} />;
          })}
        </Stack>
      </Stack>

      <Dialog open={isPersonAddModalOpen} fullScreen={false} onClose={() => setIsPersonAddModalOpen(false)}>
        <DialogTitle>Добавьте учителя удобным способом</DialogTitle>

        <DialogContent dividers>
          <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField label="Passport ID" value={passportId} onChange={e => setPassportId(e.target.value)} />

              <Button variant="contained" onClick={() => addTeacher.mutate()}>
                Добавить
              </Button>
            </Stack>

            <Stack direction="column" spacing={2}>
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                Копировать ссылку приглашение
              </Button>

              {canShare && (
                <Button variant="contained" startIcon={<ShareIcon />} onClick={handleShare}>
                  Поделиться приглашением
                </Button>
              )}
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
