import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { uploadIdeaPhoto } from '../requests.ts';
import { photoFileError } from '../shared/lib/idea-photos.ts';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  onBusyChange?: (busy: boolean) => void;
  label: string;
  alt: string;
  variant?: 'avatar' | 'cover';
  disabled?: boolean;
}

export default function ImageUploadField({ value, onChange, onBusyChange, label, alt,
  variant = 'cover', disabled = false }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const busy = disabled || uploading;
  const upload = async (file?: File) => {
    if (!file) return;
    const validationError = photoFileError(file);
    if (validationError) { setError(validationError); return; }
    setError('');
    setUploading(true);
    onBusyChange?.(true);
    try {
      const { url } = await uploadIdeaPhoto(file);
      onChange(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить изображение');
    } finally {
      setUploading(false);
      onBusyChange?.(false);
    }
  };

  return <Stack spacing={1.5}>
    <Typography variant="subtitle2">{label}</Typography>
    {value ? <Box component="img" src={value} alt={alt} sx={{ display: 'block', width: variant === 'avatar' ? 96 : '100%',
      maxWidth: variant === 'avatar' ? 96 : 280, height: variant === 'avatar' ? 96 : 160,
      objectFit: 'cover', borderRadius: variant === 'avatar' ? '50%' : 2, bgcolor: 'action.hover' }} />
      : <Typography variant="body2" color="text.secondary">Изображение пока не добавлено.</Typography>}
    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
      <Button component="label" variant="outlined" disabled={busy}>{value ? 'Заменить изображение' : 'Загрузить изображение'}
        <input hidden type="file" accept="image/jpeg,image/png,image/webp" disabled={busy}
          onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} />
      </Button>
      {value && <Button disabled={busy} onClick={() => { setError(''); onChange(''); }}>Удалить изображение</Button>}
    </Stack>
    <Typography variant="caption" color="text.secondary">JPEG, PNG или WebP, до 10 МиБ.</Typography>
    {uploading && <Typography role="status">Загрузка изображения…</Typography>}
    {error && <Alert severity="error">{error}</Alert>}
  </Stack>;
}
