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

function Filter({ filters, setView, setSort, setWhen, withOutLocation, withOutWhen, projects, compactViews }: FilterProps & { withOutLocation?: boolean; withOutWhen?: boolean; projects?: boolean; compactViews?: boolean }) {
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
    ...(compactViews ? [] : [{ value: 'group', icon: <LightbulbIcon /> }]),
    ...(projects ? [{ value: 'table', icon: <TableRowsIcon /> }] : []),
  ];

  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
      {(filters.view === 'module' || filters.view === 'table') && (
        <TextField
          select
          label="Сортировка"
          size="small"
          value={filters.sort}
          onChange={e => setSort(e.target.value as Sort)}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#fff', // текст

              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.5)', // обычный бордер
              },
              '&:hover fieldset': {
                borderColor: '#fff',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#fff', // фокус
              },
            },

            '& .MuiInputLabel-root': {
              color: 'rgba(255,255,255,0.7)', // label
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#fff',
            },

            '& .MuiSelect-icon': {
              color: '#fff',
            },
          }}
          color="secondary"
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
          <ToggleButtonGroup value={filters.when} exclusive onChange={(_, val) => setWhen(val)} size="small">
            {whenOptions.map(opt => (
              <ToggleButton key={opt.value} value={opt.value}>
                {opt.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
        <ToggleButtonGroup
          value={filters.view}
          exclusive
          onChange={(_, nextView: View | null) => {
            if (nextView) setView(nextView);
          }}
          size="small"
        >
          {viewOptions.map(opt => (
            <ToggleButton key={opt.value} value={opt.value} aria-label={opt.value === 'table' ? 'Таблица' : opt.value} title={opt.value === 'table' ? 'Таблица' : undefined}>
              {opt.icon}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  );
}
export default Filter;
