import Box from '@mui/material/Box';
import { type ProjectDto } from 'entities';
import ProjectCard from './ProjectCard.tsx'; // Добавлен импорт

type Props = {
  projects: ProjectDto[];
  withoutIdea?: boolean;
  refetch?: () => void;
  variant?: 'standard' | 'catalog' | 'compact';
};

function ProjectGrids({ projects, refetch, withoutIdea, variant = 'standard' }: Props) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      {projects.map(project => <ProjectCard key={project.id} project={project} refetch={refetch} withoutIdea={withoutIdea} variant={variant} />)}
    </Box>
  );
}

export default ProjectGrids;
