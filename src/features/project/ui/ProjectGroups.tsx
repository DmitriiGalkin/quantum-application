import { type ProjectDto } from 'entities';
import ProjectGrids from './ProjectGrids';
import { Grid, Stack } from '@mui/material';
import { groupProjectsByIdea } from '../../../utils/helper.ts';
import IdeaCard from '../../idea/ui/IdeaCard.tsx';

type Props = {
  projects: ProjectDto[];
  withoutIdea?: boolean;
  refetch?: any;
};

function ProjectGroups({ projects, refetch, withoutIdea }: Props) {
  const projectsWithIdeas = projects.filter((project) => project.idea !== null);
  const groupes = groupProjectsByIdea(projectsWithIdeas);

  if (!groupes.length) return null;

  return (
    <Stack spacing={2}>
      {groupes.map(({ idea, projects }) => {
        if (!idea) return null;

        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <IdeaCard idea={idea} />
            </Grid>

            <Grid size={{ xs: 12, sm: 9 }}>
              <ProjectGrids projects={projects} refetch={refetch} withoutIdea={withoutIdea} />
            </Grid>
          </Grid>
        );
      })}
    </Stack>
  );
}

export default ProjectGroups;
