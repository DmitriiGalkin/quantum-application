import { type ProjectDto } from 'entities';
import ProjectGrids from './ProjectGrids';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { groupProjectsByIdea } from '../../../utils/helper.ts';
import IdeaCard from '../../idea/ui/IdeaCard.tsx';

type Props = {
  projects: ProjectDto[];
  withoutIdea?: boolean;
  refetch?: () => void;
};

function ProjectGroups({ projects, refetch, withoutIdea }: Props) {
  const projectsWithIdeas = projects.filter((project) => project.idea !== null);
  const groupes = groupProjectsByIdea(projectsWithIdeas);

  const withoutIdeas = projects.filter(project => !project.idea);

  return (
    <Stack spacing={2}>
      {groupes.map(({ idea, projects }) => {
        if (!idea) return null;

        return (
          <Grid key={idea.id} container spacing={2}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <IdeaCard idea={idea} />
            </Grid>

            <Grid size={{ xs: 12, sm: 9 }}>
              <ProjectGrids projects={projects} refetch={refetch} withoutIdea={withoutIdea} />
            </Grid>
          </Grid>
        );
      })}
      {!!withoutIdeas.length && <ProjectGrids projects={withoutIdeas} refetch={refetch} />}
    </Stack>
  );
}

export default ProjectGroups;
