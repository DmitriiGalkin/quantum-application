import Stack from '@mui/material/Stack';
import { type ProjectExtendedDto, type ProjectFullDto } from 'dto';
import Filter from '../../idea/ui/Filter.tsx';
import ProjectGrids from './ProjectGrids.tsx';
import type { FilterProps } from '../../idea/hooks/useFilters.ts';
import Title from '../../../shared/ui/Title.tsx';
import ProjectGroups from './ProjectGroups.tsx'; // Добавлен импорт

type Props = {
  title?: string;
  filter: FilterProps;
  projects: ProjectExtendedDto[];
  withoutIdea?: boolean;
  refetch?: any;
};

function Projects({ title, filter, projects, refetch, withoutIdea }: Props) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Title text={title} />

        {/* Если сужающих фильтров нет и проектов нет, то фильты не рисуем */}
        {!(filter.filters.when === undefined && !projects.length) && (
            <Filter
              withOutLocation
              withOutWhen
              filters={filter.filters}
              setView={filter.setView}
              setSort={filter.setSort}
              setWhen={filter.setWhen}
            />
        )}
      </Stack>

      {filter.filters.view === 'map' && <div>Карта</div>}

      {filter.filters.view === 'module' && !!projects.length && <ProjectGrids projects={projects} refetch={refetch} withoutIdea={withoutIdea} />}

      {filter.filters.view === 'group' && <ProjectGroups projects={projects as ProjectFullDto[]} refetch={refetch} />}
    </Stack>
  );
}

export default Projects;
