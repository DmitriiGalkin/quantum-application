import Stack from '@mui/material/Stack';
import type { ProjectDto } from 'entities';
import Filter from '../../idea/ui/Filter.tsx';
import ProjectGrids from './ProjectGrids.tsx';
import type { FilterProps } from '../../idea/hooks/useFilters.ts';
import Title from 'components/Title.tsx';
import ProjectGroups from './ProjectGroups.tsx'; // Добавлен импорт
import ProjectTable from './ProjectTable.tsx';
import Typography from '@mui/material/Typography';

type Props = {
  title?: string;
  filter: FilterProps;
  projects: ProjectDto[];
  withoutIdea?: boolean;
  refetch?: () => void;
  catalog?: boolean;
  preserveOrder?: boolean;
};

function Projects({ title, filter, projects, refetch, withoutIdea, catalog, preserveOrder }: Props) {
  const sortedProjects = preserveOrder ? projects : [...projects].sort((a, b) => b.meets.length - a.meets.length);

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <Title text={title} />

        {/* Если сужающих фильтров нет и проектов нет, то фильты не рисуем */}
        {!(filter.filters.when === undefined && !projects.length) && (
          <Filter projects withOutLocation={!catalog} withOutWhen={!catalog} filters={filter.filters} setView={filter.setView} setSort={filter.setSort} setWhen={filter.setWhen} />
        )}
      </Stack>

      {filter.filters.view === 'map' && <div>Карта</div>}

      {filter.filters.view === 'module' && !!projects.length && <ProjectGrids projects={sortedProjects} refetch={refetch} />}

      {filter.filters.view === 'group' && <ProjectGroups projects={sortedProjects} refetch={refetch} withoutIdea={withoutIdea} />}
      {filter.filters.view === 'table' && <ProjectTable projects={sortedProjects} />}
      {!projects.length && <Typography color="text.secondary">Проектов пока нет.</Typography>}
    </Stack>
  );
}

export default Projects;
