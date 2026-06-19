import Stack from '@mui/material/Stack';
import { MenuItem, TextField, Typography } from '@mui/material';
import type { Sort, View } from '@shared/types';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MapIcon from '@mui/icons-material/Map';
import { useEffect } from 'react';

function Filter({ filters, setView, setSort, setWhen, setLocation, isHydrated }: any) {
  const sortOptions = [
    { value: 'nearby', label: 'Поблизости' },
    { value: 'popular', label: 'Популярные' },
    { value: 'new', label: 'Новые' },
  ];
  const whenOptions = [
    { value: 'today', label: 'Сегодня' },
    { value: 'tomorrow', label: 'Завтра' },
  ];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async position => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  }, []);

  if (!isHydrated) return null;

  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }} spacing={1}>
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

      <Stack direction="row" spacing={1}>
        <ToggleButtonGroup
          value={filters.when}
          exclusive
          onChange={(_, val) => setWhen(val)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: '#fff', // иконки
              borderColor: 'rgba(255,255,255,0.5)',

              '&.Mui-selected': {
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.2)',
              },

              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            },
          }}
        >
          {whenOptions.map(opt => (
            <ToggleButton key={opt.value} value={opt.value}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <ToggleButtonGroup
          value={filters.view}
          exclusive
          onChange={(_, nextView: string) => {
            setView(nextView as View);
          }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: '#fff', // иконки
              borderColor: 'rgba(255,255,255,0.5)',

              '&.Mui-selected': {
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.2)',
              },

              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            },
          }}
        >
          <ToggleButton value="module" aria-label="module">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="map" aria-label="map">
            <MapIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  );
}
export default Filter;
