import React from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { fetchPlace, fetchProjects } from '../requests.ts';
import Projects from '../features/project/ui/Projects.tsx';
import { useFilters } from '../features/idea/hooks/useFilters.ts';

const PlacesPage: React.FC = () => {
  const filter = useFilters();
  const { id } = useParams<{ id: string }>();

  const { data: place } = useQuery({
    queryKey: ['place', id],
    queryFn: () => fetchPlace(Number(id)),
    enabled: Boolean(id),
  });

  const { data: projects, refetch } = useQuery({
    queryKey: ['projects', id, filter.filters],
    queryFn: () => fetchProjects({ ...filter.filters, placeId: Number(id) }),
    enabled: Boolean(id),
  });

  if (!place || !projects) return <Typography>place or projects not found</Typography>;

  return (
    <Box>
      {/*<Grid container spacing={2}>*/}
      {/*  <Grid size={{ xs: 12, md: 3 }}>*/}
      {/*    <Card>*/}
      {/*      <CardMedia component="img" height="300" image={place.image || '/placeholder.jpg'} alt={place.title || ''} />*/}
      {/*      <CardContent>*/}
      {/*        <Typography variant="h4">{place.title}</Typography>*/}
      {/*        <Typography variant="body1" sx={{ mt: 2 }}>*/}
      {/*          {place.description}*/}
      {/*        </Typography>*/}

      {/*        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>*/}
      {/*          <Button variant="outlined" startIcon={<ShareIcon />}>*/}
      {/*            Поделиться*/}
      {/*          </Button>*/}
      {/*        </Box>*/}
      {/*      </CardContent>*/}
      {/*    </Card>*/}
      {/*  </Grid>*/}
      {/*</Grid>*/}

      <Projects title="Проекты центра" filter={filter} projects={projects} refetch={refetch} withoutIdea />
    </Box>
  );
};

export default PlacesPage;
