import Box from '@mui/material/Box';
import { type IdeaDto, type ProjectFullDto } from 'types';
import ProjectGrids from "./ProjectGrids";
import { Button, Card, CardContent, CardMedia, Stack, Typography } from '@mui/material';
import { groupProjectsByIdea } from '../../../utils/helper.ts';

type Props = {
  projects: ProjectFullDto[];
  withoutIdea?: boolean;
  refetch?: any;
};

function ProjectGroups({ projects, refetch, withoutIdea }: Props) {
  const projectsWithIdeas = projects.filter((project): project is ProjectFullDto & { idea: IdeaDto } => project.idea !== null);
  const groupes = groupProjectsByIdea(projectsWithIdeas);

  if (!groupes.length) return null;

  return (
    <Stack spacing={2}>
      {groupes.map(({ idea, projects }) => {
        if (!idea) return null;

        return (
          <Card
            key={idea.id}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              mb: 2,
              border: projects.length === 1 ? '1px solid rgba(255,182,40,0.3)' : undefined,
            }}
          >
            {/* IDEA HEADER */}
            <Box sx={{ display: 'flex' }}>
              <CardMedia
                component="img"
                image={idea.image || `/bg.jpeg`}
                alt={idea.title}
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />

              <CardContent>
                <Stack sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {idea.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} gutterBottom>
                      {idea.description}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
                    {projects.length === 0 ? (
                      <Button variant="contained" size="small">
                        Создать проект
                      </Button>
                    ) : (
                      <Button variant="outlined" size="small">
                        + Проект
                      </Button>
                    )}

                    <Button size="small" href={`/idea/${idea.id}`}>
                      Подробнее
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Box>

            {/* PROJECTS */}
            <Box sx={{ p: 2 }}>
              <ProjectGrids projects={projects} refetch={refetch} withoutIdea={withoutIdea} />
            </Box>
          </Card>
        );
      })}
    </Stack>
  );
}

export default ProjectGroups;
