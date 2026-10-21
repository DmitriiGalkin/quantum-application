import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { fetchCreateProjectCampaign, fetchProjectCampaigns } from '../../../requests.ts';
import { getBrowser } from '../../../shared/lib/browser.ts';
import type { ProjectCampaign } from 'entities';

function campaignUrl(campaign: ProjectCampaign): string {
  const search = new URLSearchParams({ campaign: campaign.token, utm_source: campaign.channel,
    utm_medium: 'community', utm_campaign: `project-${campaign.projectId}-${campaign.id}` });
  return `/project/${campaign.projectId}?${search}`;
}

export default function ProjectCampaigns({ projectId }: { projectId: number }) {
  const [channel, setChannel] = useState('');
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['project-campaigns', projectId], queryFn: () => fetchProjectCampaigns(projectId) });
  const create = useMutation({
    mutationFn: () => fetchCreateProjectCampaign({ projectId, channel: channel.trim() }),
    onSuccess: async () => { setChannel(''); await queryClient.invalidateQueries({ queryKey: ['project-campaigns', projectId] }); },
  });
  return <Card component="section"><CardContent><Stack spacing={2}>
    <Typography component="h2" variant="h6">Реклама проекта</Typography>
    <Typography color="text.secondary">Создайте отдельную ссылку для каждого канала. Перед размещением проверьте ближайшую встречу, свободные места, цену и место проведения.</Typography>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <TextField fullWidth size="small" label="Название канала" value={channel} onChange={event => setChannel(event.target.value)} slotProps={{ htmlInput: { maxLength: 120 } }} />
      <Button variant="contained" disabled={!channel.trim() || create.isPending} onClick={() => create.mutate()}>Создать ссылку</Button>
    </Stack>
    {create.isError && <Alert severity="error">Не удалось создать ссылку.</Alert>}
    {isPending ? <Typography role="status">Загрузка ссылок…</Typography>
      : isError ? <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>Не удалось загрузить ссылки.</Alert>
        : data?.length ? data.map(campaign => <Stack key={campaign.id} spacing={0.5} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }}>{campaign.channel}</Typography>
          <Typography color="text.secondary">{campaign.initiator === 'teacher' ? 'Преподаватель' : 'Центр'} · Переходов: {campaign.visits} · Действующих записей: {campaign.bookings}</Typography>
          <Button size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => {
            const browser = getBrowser();
            if (browser) void browser.navigator.clipboard.writeText(`${browser.location.origin}${campaignUrl(campaign)}`);
          }}>Скопировать ссылку</Button>
        </Stack>) : <Typography color="text.secondary">Рекламных ссылок пока нет.</Typography>}
  </Stack></CardContent></Card>;
}
