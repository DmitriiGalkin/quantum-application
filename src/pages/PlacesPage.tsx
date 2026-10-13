import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaceProfile, fetchProjects } from '../requests.ts';
import Projects from '../features/project/ui/Projects.tsx';
import { useFilters } from '../features/idea/hooks/useFilters.ts';
import { RoomGallery } from '../features/place/RoomGallery.tsx';
import { RentalDialog } from '../features/place/RentalDialog.tsx';
import { useRentalForm } from '../features/place/hooks/useRentalForm.ts';
import { PlaceMap } from '../features/place/ui/PlaceMap.tsx';
import { getBrowser } from '../shared/lib/browser.ts';
import { moscowFormat } from '../features/meets/moscow-time.ts';
import { formatMoney } from '../utils/time.ts';

export default function PlacesPage() {
  const { id } = useParams<{ id: string }>();
  return <PlaceProfilePage key={id} id={id} />;
}

function PlaceProfilePage({ id }: { id: string | undefined }) {
  const filter = useFilters({ projects: true });
  const [shareMessage, setShareMessage] = useState('');
  const profile = useQuery({ queryKey: ['place-profile', id], queryFn: () => fetchPlaceProfile(Number(id)), enabled: Boolean(id) });
  const projects = useQuery({ queryKey: ['projects', id, filter.filters], queryFn: () => fetchProjects({ ...filter.filters, placeId: Number(id) }), enabled: Boolean(id) });
  const form = useRentalForm(Number(id), profile.data?.rooms ?? []);
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
  const { place, rooms, meets, teachers, schedule } = profile.data;
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return <Container maxWidth="lg"><Stack spacing={4}>
    <Card><CardContent><Stack spacing={2}>
      {place.image && <Box component="img" src={place.image} alt={`Логотип ${place.title ?? 'центра'}`} sx={{ width: '100%', maxWidth: 260, height: 160, objectFit: 'contain' }} />}
      <Typography variant="h3" component="h1">{place.title ?? 'Образовательный центр'}</Typography>
      {place.description && <Typography sx={{ whiteSpace: 'pre-line' }}>{place.description}</Typography>}
      <Typography>{place.address}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="contained" href="#upcoming">Ближайшие занятия</Button>
        <Button variant="outlined" href="#rooms">Выбрать зал</Button>
        <Button onClick={() => void share()}>Поделиться</Button>
      </Stack>
      {shareMessage && <Typography role="status">{shareMessage}</Typography>}
    </Stack></CardContent></Card>
    <Stack id="upcoming" spacing={2} sx={{ scrollMarginTop: 90 }}>
      <Typography variant="h4" component="h2">Ближайшие занятия</Typography>
      {!meets.length && <Typography>Будущих опубликованных занятий пока нет.</Typography>}
      <Grid container spacing={2}>{meets.map(meet => <Grid key={meet.id} size={{ xs: 12, md: 6 }}>
        <Card><CardContent><Stack spacing={1}>
          <Typography variant="h6">{meet.projectTitle}</Typography>
          <Typography>Преподаватель: <Link to={`/teachers/${meet.teacher.id}`}>{meet.teacher.title}</Link></Typography>
          {meet.locationTitle && <Typography>Зал: {meet.locationTitle}</Typography>}
          <Typography>{moscowFormat(meet.startedAt, { dateStyle: 'long', timeStyle: 'short' })} (МСК){meet.duration !== null && ` · ${meet.duration} мин.`}</Typography>
          <Typography>{meet.price === null ? 'Стоимость по согласованию' : formatMoney(meet.price)}</Typography>
          {meet.availableSeats !== null && <Typography>Свободных мест: {meet.availableSeats}</Typography>}
          <Button component={Link} to={`/project/${meet.projectId}#meet-${meet.id}`}>Подробнее и запись</Button>
        </Stack></CardContent></Card>
      </Grid>)}</Grid>
    </Stack>
    {projects.isPending ? <Typography role="status">Загрузка проектов…</Typography> : projects.isError
      ? <Alert severity="error" action={<Button onClick={() => void projects.refetch()}>Повторить</Button>}>Не удалось загрузить проекты</Alert>
      : <><Projects title="Проекты центра" filter={filter} projects={projects.data} refetch={() => void projects.refetch()} withoutIdea />{!projects.data.length && <Typography>Проектов центра пока нет.</Typography>}</>}
    <Stack spacing={2}>
      <Typography variant="h4" component="h2">Преподаватели</Typography>
      {!teachers.length && <Typography>Преподаватели пока не добавлены.</Typography>}
      <Grid container spacing={2}>{teachers.map(teacher => <Grid key={teacher.id} size={{ xs: 12, sm: 6, md: 4 }}><Card><CardContent><Stack spacing={1}>
        <Avatar src={teacher.image ?? undefined} alt={teacher.title} sx={{ width: 72, height: 72 }} />
        <Typography variant="h6">{teacher.title}</Typography>
        {teacher.description && <Typography>{teacher.description.slice(0, 240)}</Typography>}
        <Button component={Link} to={`/teachers/${teacher.id}`}>Профиль преподавателя</Button>
      </Stack></CardContent></Card></Grid>)}</Grid>
    </Stack>
    <Stack id="rooms" spacing={2} sx={{ scrollMarginTop: 90 }}>
      <Typography variant="h4" component="h2">Залы</Typography>
      {!rooms.length && <Typography>Залы пока не добавлены.</Typography>}
      <Grid container spacing={2}>{rooms.map(room => <Grid key={room.id} size={{ xs: 12, md: 6 }}><Card><CardContent><Stack spacing={1}>
        <RoomGallery title={room.title} photos={room.photos} />
        <Typography variant="h6">{room.title}</Typography>
        {room.description && <Typography sx={{ whiteSpace: 'pre-line' }}>{room.description}</Typography>}
        {room.capacity !== null && <Typography>Вместимость: {room.capacity} человек</Typography>}
        {room.rentalEnabled && <Typography>{room.hourlyRate === null ? 'Цена по согласованию' : `${formatMoney(room.hourlyRate)} / час`}</Typography>}
        {room.rentalEnabled ? <Button variant="contained" onClick={() => form.choose(room.id)}>Заявка на аренду</Button> : <Typography>Аренда пока недоступна</Typography>}
      </Stack></CardContent></Card></Grid>)}</Grid>
    </Stack>
    <Stack spacing={2}><Typography variant="h4" component="h2">Как добраться</Typography><Typography>{place.address}</Typography>
      {Number.isFinite(Number(place.latitude)) && Number.isFinite(Number(place.longitude)) && <PlaceMap lat={Number(place.latitude)} lng={Number(place.longitude)} zoom={15} places={[place]} />}
      <Button component="a" href={`https://yandex.ru/maps/?rtext=~${encodeURIComponent(`${place.latitude},${place.longitude}`)}&rtt=auto`} target="_blank" rel="noopener noreferrer">Построить маршрут</Button>
    </Stack>
    <Stack spacing={1}><Typography variant="h4" component="h2">Контакты и режим работы</Typography>
      {place.phone ? <Typography component="a" href={`tel:${place.phone}`}>{place.phone}</Typography> : <Typography>Телефон пока не указан.</Typography>}
      {!schedule.length && <Typography>Расписание пока не указано.</Typography>}
      {schedule.map(day => <Typography key={day.weekday}>{weekdays[day.weekday - 1]}: {day.enabled ? `${day.startTime.slice(0, 5)}–${day.endTime.slice(0, 5)} (МСК)` : 'Выходной'}</Typography>)}
    </Stack>
  </Stack><RentalDialog form={form} rooms={rooms} /></Container>;
}
