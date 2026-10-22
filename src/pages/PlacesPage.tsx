import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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
  const filter = useFilters({ projects: true, compactViews: true, allowWhen: false, allowNearby: false });
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
  const hasPhotos = Boolean(place.image || rooms.some(room => room.photos.length));
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return <Stack spacing={4} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
    <Card><Grid container>
      {hasPhotos && <Grid size={{ xs: 12, md: 6 }} sx={{ minWidth: 0, p: { xs: 1.5, md: 2 } }}>
        <PlaceGallery place={place} rooms={rooms} />
      </Grid>}
      <Grid size={{ xs: 12, md: hasPhotos ? 6 : 12 }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: { xs: 2, md: 3 } }}>
          <Typography variant="h3" component="h1" sx={{ overflowWrap: 'anywhere' }}>{place.title ?? 'Образовательный центр'}</Typography>
          <Typography color="text.secondary">{place.address}</Typography>
          {place.phone && <Typography component="a" href={`tel:${place.phone}`} sx={{ alignSelf: 'flex-start' }}>{place.phone}</Typography>}
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Button variant="contained" href="#projects">Проекты центра</Button>
            {rooms.length > 0 && <Button variant="outlined" href="#rooms">Залы</Button>}
            <Button variant="text" href="#directions">Как добраться</Button>
            <Button variant="text" onClick={() => void share()}>Поделиться</Button>
          </Stack>
          {shareMessage && <Typography role="status">{shareMessage}</Typography>}
        </CardContent>
      </Grid>
    </Grid></Card>
    {(place.description || schedule.length > 0) && <Grid container spacing={3}>
      {place.description && <Grid size={{ xs: 12, md: 7 }}><Stack spacing={1}>
        <Typography variant="h5" component="h2">О центре</Typography>
        <Typography sx={{ whiteSpace: 'pre-line' }}>{place.description}</Typography>
      </Stack></Grid>}
      {schedule.length > 0 && <Grid size={{ xs: 12, md: 5 }}><Stack spacing={1}>
        <Typography variant="h5" component="h2">Режим работы</Typography>
        {schedule.map(day => <Typography key={day.weekday}>{weekdays[day.weekday - 1]}: {day.enabled ? `${day.startTime.slice(0, 5)}–${day.endTime.slice(0, 5)}` : 'Выходной'}</Typography>)}
      </Stack></Grid>}
    </Grid>}
    <Stack id="projects" sx={{ scrollMarginTop: 90 }}>{projects.isPending ? <Typography role="status">Загрузка проектов…</Typography> : projects.isError
      ? <Alert severity="error" action={<Button onClick={() => void projects.refetch()}>Повторить</Button>}>Не удалось загрузить проекты</Alert>
      : <Projects title="Проекты центра" filter={filter} projects={projects.data} refetch={() => void projects.refetch()} withoutIdea compactViews cardVariant="catalog" emptyText="Проектов центра пока нет." />}</Stack>
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
        <LocationCard location={room} showRate={false} />
      </Grid>)}</Grid>
    </Stack>
    <Stack id="directions" spacing={2} sx={{ scrollMarginTop: 90 }}><Typography variant="h4" component="h2">Как добраться</Typography><Typography>{place.address}</Typography>
      {Number.isFinite(Number(place.latitude)) && Number.isFinite(Number(place.longitude)) && <PlaceMap lat={Number(place.latitude)} lng={Number(place.longitude)} zoom={15} places={[place]} />}
      <Button component="a" href={`https://yandex.ru/maps/?rtext=~${encodeURIComponent(`${place.latitude},${place.longitude}`)}&rtt=auto`} target="_blank" rel="noopener noreferrer">Построить маршрут</Button>
    </Stack>
  </Stack>;
}
