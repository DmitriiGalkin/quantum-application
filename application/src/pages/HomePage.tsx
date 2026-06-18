import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import '../App.css';
import { MeetMap } from '../components/Map/MeetMap.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchIdeas, fetchLike, fetchUnlike } from '../requests.ts';
import Stack from '@mui/material/Stack';
import IdeaCard from '../components/IdeaCard.tsx';
import Page from '../components/Page.tsx';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MapIcon from '@mui/icons-material/Map';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import React from 'react';
import { MenuItem, TextField } from '@mui/material';

function HomePage() {
  const [view, setView] = React.useState('module');
  const [sort, setSort] = React.useState('nearby');
  const [when, setWhen] = React.useState('noMatter');

  const {
    data: ideas = [],
    isLoading: isIdeasLoading,
    isError: isIdeasError,
  } = useQuery({
    queryKey: ['ideasHome'],
    queryFn: () => fetchIdeas(),
  });

  const mutationLike = useMutation({
    mutationFn: fetchLike,
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchUnlike,
  });

  const sortOptions = [
    { value: 'nearby', label: 'Поблизости' },
    { value: 'popular', label: 'Популярные' },
    { value: 'new', label: 'Новые' },
  ];
  const whenOptions = [
    { value: 'today', label: 'Сегодня' },
    { value: 'tomorrow', label: 'Завтра' },
  ];

  return (
    <Page isLoading={isIdeasLoading} isError={isIdeasError}>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }} spacing={1}>
          <TextField select size="small" value={sort} onChange={e => setSort(e.target.value)}>
            {sortOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={1}>
            <ToggleButtonGroup value={when} exclusive onChange={(_, val) => setWhen(val)} size="small">
              {whenOptions.map(opt => (
                <ToggleButton key={opt.value} value={opt.value}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(_, nextView: string) => {
                setView(nextView);
              }}
              size="small"
            >
              <ToggleButton value="module" aria-label="module">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="map" aria-label="map">
                <MapIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>

        {view === 'map' && (
          <Paper
            component="section"
            elevation={1}
            sx={{
              mb: 4,
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
              overflow: 'hidden',
            }}
            aria-labelledby="auth-section-title"
          >
            <MeetMap lat={55.75} lng={37.62} zoom={12} />
          </Paper>
        )}

        {view === 'module' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1,
            }}
          >
            {ideas.map(idea => (
              <IdeaCard idea={idea} key={idea.id} like={a => mutationLike.mutate(a)} unlike={a => mutationUnlike.mutate(a)} />
            ))}
          </Box>
        )}
      </Stack>
    </Page>
  );
}

export default HomePage;
