import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaceProfile, fetchProjects } from '../requests.ts';
import Projects from '../features/project/ui/Projects.tsx';
import { useFilters } from '../features/idea/hooks/useFilters.ts';
import LocationCard from '../features/place/LocationCard.tsx';
import TeacherCard from '../features/teacher/TeacherCard.tsx';
import { PlaceGallery } from '../features/place/PlaceGallery.tsx';
import { PlaceMap } from '../features/place/ui/PlaceMap.tsx';
import { getBrowser } from '../shared/lib/browser.ts';

export default function PlacesPage() {
  const { id } = useParams<{ id: string }>();
  return <PlaceProfilePage key={id} id={id} />;
}

function PlaceProfilePage({ id }: { id: string | undefined }) {
  const filter = useFilters({ projects: true });
  const [shareMessage, setShareMessage] = useState('');
  const profile = useQuery({ queryKey: ['place-profile', id], queryFn: () => fetchPlaceProfile(Number(id)), enabled: Boolean(id) });
  const projects = useQuery({ queryKey: ['projects', id, filter.filters], queryFn: () => fetchProjects({ ...filter.filters, placeId: Number(id) }), enabled: Boolean(id) });
  const share = async () => {
    const browser = getBrowser();
    if (!browser) return;
    try {
      const url = `${browser.location.origin}/places/${id}`;
      if (browser.navigator.share) await browser.navigator.share({ title: profile.data?.place.title ?? 'Центр', url });
      else { await browser.navigator.clipboard.writeText(url); setShareMessage('Ссылка скопирована'); }
    } catch { setShareMessage('Не удалось поделиться. Скопируйте адрес страницы.'); }
  };
  if (profile.isPending) return <Typography role="status">Загрузка центра…</Typography>;
  if (profile.isError) return <Alert severity="error" action={<Button onClick={() => void profile.refetch()}>Повторить</Button>}>{profile.error.message}</Alert>;
  const { place, rooms, teachers, schedule } = profile.data;
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return <Stack spacing={4} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
    <Card><CardContent><Stack spacing={2}>
      <Typography variant="h3" component="h1">{place.title ?? 'Образовательный центр'}</Typography>
      <Stack spacing={0.5}>
        <Typography variant="h6" component="h2">Режим работы</Typography>
        {!schedule.length && <Typography>Расписание пока не указано.</Typography>}
        {schedule.map(day => <Typography key={day.weekday}>{weekdays[day.weekday - 1]}: {day.enabled ? `${day.startTime.slice(0, 5)}–${day.endTime.slice(0, 5)} (МСК)` : 'Выходной'}</Typography>)}
      </Stack>
      <PlaceGallery place={place} rooms={rooms} />
      {place.description && <Typography sx={{ whiteSpace: 'pre-line' }}>{place.description}</Typography>}
      <Typography>{place.address}</Typography>
      {place.phone ? <Typography component="a" href={`tel:${place.phone}`}>{place.phone}</Typography> : <Typography>Телефон пока не указан.</Typography>}
      <Typography variant="h6" component="h2">Залы центра</Typography>
      {rooms.length ? <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>{rooms.map(room => <Button key={room.id} href={`#room-${room.id}`} variant="outlined">{room.title}</Button>)}</Stack> : <Typography>Залы пока не добавлены.</Typography>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="outlined" href="#rooms">Выбрать зал</Button>
        <Button onClick={() => void share()}>Поделиться</Button>
      </Stack>
      {shareMessage && <Typography role="status">{shareMessage}</Typography>}
    </Stack></CardContent></Card>
    {projects.isPending ? <Typography role="status">Загрузка проектов…</Typography> : projects.isError
      ? <Alert severity="error" action={<Button onClick={() => void projects.refetch()}>Повторить</Button>}>Не удалось загрузить проекты</Alert>
      : <><Projects title="Проекты центра" filter={filter} projects={projects.data} refetch={() => void projects.refetch()} withoutIdea />{!projects.data.length && <Typography>Проектов центра пока нет.</Typography>}</>}
    <Stack spacing={2}>
      <Typography variant="h4" component="h2">Преподаватели</Typography>
      {!teachers.length && <Typography>Преподаватели пока не добавлены.</Typography>}
      <Grid container spacing={2}>{teachers.map(teacher => <Grid key={teacher.id} size={{ xs: 12, sm: 6, md: 4 }}>
        <TeacherCard teacher={teacher} />
      </Grid>)}</Grid>
    </Stack>
    <Stack id="rooms" spacing={2} sx={{ scrollMarginTop: 90 }}>
      <Typography variant="h4" component="h2">Залы</Typography>
      {!rooms.length && <Typography>Залы пока не добавлены.</Typography>}
      <Grid container spacing={2}>{rooms.map(room => <Grid key={room.id} size={{ xs: 12, md: 6 }}>
        <LocationCard location={room} />
      </Grid>)}</Grid>
    </Stack>
    <Stack spacing={2}><Typography variant="h4" component="h2">Как добраться</Typography><Typography>{place.address}</Typography>
      {Number.isFinite(Number(place.latitude)) && Number.isFinite(Number(place.longitude)) && <PlaceMap lat={Number(place.latitude)} lng={Number(place.longitude)} zoom={15} places={[place]} />}
      <Button component="a" href={`https://yandex.ru/maps/?rtext=~${encodeURIComponent(`${place.latitude},${place.longitude}`)}&rtt=auto`} target="_blank" rel="noopener noreferrer">Построить маршрут</Button>
    </Stack>
  </Stack>;
}
