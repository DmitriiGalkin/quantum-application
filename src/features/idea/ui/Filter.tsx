import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import type { Sort, View } from 'entities';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MapIcon from '@mui/icons-material/Map';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TableRowsIcon from '@mui/icons-material/TableRows';
import type { FilterProps } from '../hooks/useFilters.ts';

function Filter({ filters, setView, setSort, setWhen, withOutLocation, withOutWhen, projects, compactViews, withoutGroups }: FilterProps & { withOutLocation?: boolean; withOutWhen?: boolean; projects?: boolean; compactViews?: boolean; withoutGroups?: boolean }) {
  const sortOptions = [
    ...(withOutLocation ? [] : [{ value: 'nearby', label: 'Поблизости' }]),
    { value: 'popular', label: 'Популярные' },
    { value: 'new', label: 'Новые' },
  ];
  const whenOptions = [
    { value: 'today', label: 'Сегодня' },
    { value: 'tomorrow', label: 'Завтра' },
  ];
  const viewOptions = [
    { value: 'module', icon: <ViewModuleIcon /> },
    ...(withOutLocation || compactViews ? [] : [{ value: 'map', icon: <MapIcon /> }]),
    ...(compactViews || withoutGroups ? [] : [{ value: 'group', icon: <LightbulbIcon /> }]),
    ...(projects ? [{ value: 'table', icon: <TableRowsIcon /> }] : []),
  ];
  const changeView = (_: React.MouseEvent<HTMLElement>, nextView: View | null) => {
    if (nextView) setView(nextView);
  };
  const viewButtons = (options: typeof viewOptions) => options.map(opt => (
    <ToggleButton key={opt.value} value={opt.value} sx={opt.value === 'table' && projects ? { display: { xs: 'none', sm: 'inline-flex' } } : undefined}
      aria-label={opt.value === 'map' && !projects ? 'Центры на карте' : { module: 'Карточки', table: 'Список', map: 'Карта', group: 'Группы' }[opt.value]}
      title={{ module: 'Карточки', table: 'Список', map: 'Карта', group: 'Группы' }[opt.value]}>
      {opt.icon}
    </ToggleButton>
  ));

  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
      {(filters.view === 'module' || filters.view === 'table') && (
        <TextField
          select
          label="Сортировка"
          size="small"
          value={filters.sort}
          onChange={e => setSort(e.target.value as Sort)}
          variant="outlined"
        >
          {sortOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {!withOutWhen && (
          <ToggleButtonGroup value={filters.when} exclusive onChange={(_, val) => setWhen(val)} size="small" aria-label="Дата встречи">
            {whenOptions.map(opt => (
              <ToggleButton key={opt.value} value={opt.value} aria-label={opt.label}>
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
        {projects && filters.view === 'table' && <ToggleButtonGroup value="module" exclusive aria-label="Вид списка"
          onChange={changeView} size="small" sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
          {viewButtons(viewOptions.filter(opt => opt.value !== 'table'))}
        </ToggleButtonGroup>}
        <ToggleButtonGroup value={filters.view} exclusive aria-label="Вид списка" onChange={changeView} size="small"
          sx={{ display: { xs: projects && filters.view === 'table' ? 'none' : 'inline-flex', sm: 'inline-flex' } }}>
          {viewButtons(viewOptions)}
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  );
}
export default Filter;
