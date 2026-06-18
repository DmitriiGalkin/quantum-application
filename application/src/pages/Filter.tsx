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
      <TextField select size="small" value={filters.sort} onChange={e => setSort(e.target.value as Sort)}>
        {sortOptions.map(opt => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <Stack direction="row" spacing={1}>
        <ToggleButtonGroup value={filters.when} exclusive onChange={(_, val) => setWhen(val)} size="small">
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
