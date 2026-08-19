import Stack from '@mui/material/Stack';
import { MenuItem, TextField } from '@mui/material';
import type { Sort, View } from 'types';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MapIcon from '@mui/icons-material/Map';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

function Filter({ filters, setView, setSort, setWhen, withOutLocation, withOutWhen }: any) {
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
    ...(withOutLocation ? [] : [{ value: 'map', icon: <MapIcon /> }]),
    { value: 'group', icon: <LightbulbIcon /> },
  ];

  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }} spacing={1}>
      {filters.view === 'module2' && (
        <TextField
          select
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

      <Stack direction="row" spacing={1}>
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
          onChange={(_, nextView: string) => {
            setView(nextView as View);
          }}
          size="small"
        >
          {viewOptions.map(opt => (
            <ToggleButton value={opt.value} aria-label={opt.value}>
              {opt.icon}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  );
}
export default Filter;
