import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import '../App.css';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProjects } from '../requests.ts';
import Page from '../components/Page.tsx';
import ProjectCard from '../components/ProjectCard.tsx';

function UserProjectsPage() {
  const { id } = useParams();
  const userId = id ? Number(id) : undefined;

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    refetch,
  } = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchUserProjects(userId!),
  });

  return (
    <Page isLoading={isProjectsLoading}>
      <Box component="section">
        {isProjectsError && <Alert severity="error">Не удалось загрузить проекты.</Alert>}

        {!isProjectsLoading && !isProjectsError && Boolean(projects.length) && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {projects.map(project => (
              <ProjectCard project={project} />
              // <Card sx={{ display: 'flex' }}>
              //   <Box sx={{ width: 300 }}>
              //     <CardMedia
              //       component="img"
              //       sx={{
              //         width: 300,
              //         height: 120,
              //         objectFit: 'cover',
              //         flexShrink: 0,
              //       }}
              //       image={idea.image || `/bg.jpeg`}
              //       alt={idea.title || 'Идея'}
              //     />
              //     <CardContent sx={{ flexGrow: 1 }}>
              //       <Typography variant="h5">{idea.title}</Typography>
              //       <Typography>{idea.description}</Typography>
              //     </CardContent>
              //   </Box>
              //   <CardContent sx={{ flexGrow: 1 }}>
              //     <List>
              //       {meets?.map((meet, index) => (
              //         <>
              //           {index !== 0 && <Divider />}
              //           <MeetListItem meet={meet} refetch={refetch} />
              //         </>
              //       ))}
              //     </List>
              //   </CardContent>
              // </Card>
            ))}
          </Box>
        )}
      </Box>
    </Page>
  );
}

export default UserProjectsPage;
