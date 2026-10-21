import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { fetchPlaceStats } from '../../requests.ts';
import { useAuth } from '../../providers/auth-context.ts';

export default function PlaceStatsPage() {
  const { placeId } = useAuth();
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['place-stats', placeId, days], queryFn: () => fetchPlaceStats(days), enabled: Boolean(placeId),
  });
  if (!placeId) return <Typography>Выберите центр в меню профиля.</Typography>;
  return <Stack spacing={3}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
      <Typography component="h1" variant="h4">Статистика центра</Typography>
      <ToggleButtonGroup exclusive size="small" value={days} onChange={(_event, value: 7 | 30 | 90 | null) => { if (value) setDays(value); }} aria-label="Период статистики">
        <ToggleButton value={7}>7 дней</ToggleButton><ToggleButton value={30}>30 дней</ToggleButton><ToggleButton value={90}>90 дней</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
    <Typography color="text.secondary">Проведённые подтверждённые встречи и действующие записи на них за выбранный период. Записи показывают текущее состояние, а не число участников на дату занятия.</Typography>
    {isPending ? <Typography role="status">Загрузка статистики…</Typography>
      : isError ? <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить статистику.</Alert>
        : data && <>
          <Grid container spacing={2}>
            {[
              { label: 'Встреч проведено', value: data.meets },
              { label: 'Действующих записей', value: data.bookings },
              { label: 'Мест с известной вместимостью', value: data.knownCapacity },
              { label: 'Встреч без указанной вместимости', value: data.unknownCapacityMeets },
            ].map(item => <Grid key={item.label} size={{ xs: 6, md: 3 }}><Card sx={{ height: '100%' }}><CardContent><Typography variant="h4">{item.value}</Typography><Typography color="text.secondary">{item.label}</Typography></CardContent></Card></Grid>)}
          </Grid>
          <Stack spacing={2} component="section">
            <Typography component="h2" variant="h5">По проектам</Typography>
            {data.projects.length ? data.projects.map(project => <Card key={project.projectId}><CardContent>
              <Typography component={Link} to={`/project/${project.projectId}`} variant="h6" sx={{ color: 'primary.main' }}>{project.title}</Typography>
              <Typography>Встреч: {project.meets} · Записей: {project.bookings}</Typography>
              <Typography color="text.secondary">{project.unknownCapacityMeets ? `Известных мест: ${project.knownCapacity}; без вместимости: ${project.unknownCapacityMeets}` : `Заполнено ${project.knownCapacity ? Math.round(project.bookings / project.knownCapacity * 100) : 0}% из ${project.knownCapacity} мест`}</Typography>
            </CardContent></Card>) : <Typography color="text.secondary">За этот период подтверждённых встреч нет.</Typography>}
          </Stack>
          <Stack spacing={2} component="section">
            <Typography component="h2" variant="h5">Рекламные ссылки</Typography>
            <Typography color="text.secondary">Переходы и действующие записи, связанные с рекламными ссылками за период. Запись учитывается, если она сделана в течение 7 дней после последнего перехода по ссылке этого проекта.</Typography>
            {data.campaigns.length ? data.campaigns.map(campaign => <Card key={campaign.id}><CardContent>
              <Typography component={Link} to={`/project/${campaign.projectId}`} variant="h6" sx={{ color: 'primary.main' }}>{campaign.projectTitle}</Typography>
              <Typography>{campaign.channel} · {campaign.initiator === 'teacher' ? 'Преподаватель' : 'Центр'}</Typography>
              <Typography color="text.secondary">Переходов: {campaign.visits} · Действующих записей: {campaign.bookings}</Typography>
            </CardContent></Card>) : <Typography color="text.secondary">Рекламных ссылок пока нет.</Typography>}
          </Stack>
        </>}
  </Stack>;
}
