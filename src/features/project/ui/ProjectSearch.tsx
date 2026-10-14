import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

export default function ProjectSearch({ initialQuery, example, onSearch }: {
  initialQuery: string;
  example?: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [hint, setHint] = useState('');
  const [stopped, setStopped] = useState(false);
  useEffect(() => {
    if (!example || stopped || value || focused || globalThis.window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const text = example.slice(0, 60);
    let length = 0;
    const timer = globalThis.window.setInterval(() => {
      length++;
      setHint(text.slice(0, length));
      if (length >= text.length) {
        globalThis.window.clearInterval(timer);
        setStopped(true);
      }
    }, 45);
    return () => globalThis.window.clearInterval(timer);
  }, [example, focused, stopped, value]);
  return <Box component="form" role="search" onSubmit={event => { event.preventDefault(); onSearch(value.trim()); }}
    sx={{ display: 'flex', gap: 1, width: '100%', maxWidth: 900, mx: 'auto', bgcolor: 'background.paper', borderRadius: 2, p: 1 }}>
    <TextField fullWidth label="Поиск проектов" value={value} onChange={event => setValue(event.target.value)}
      onFocus={() => { setFocused(true); setStopped(true); }} onBlur={() => setFocused(false)}
      placeholder={focused ? 'Что интересно ребёнку?' : (stopped ? example?.slice(0, 60) : hint) || 'Название или описание проекта'}
      slotProps={{ htmlInput: { maxLength: 200 } }} />
    <Button type="submit" variant="contained">Найти</Button>
  </Box>;
}
