import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export interface IdeaFormValues {
  title: string;
  description: string;
}

interface Props {
  values: IdeaFormValues;
  loading?: boolean;
  submitLabel?: string;
  onChange: (values: IdeaFormValues) => void;
  onSubmit: () => void;
}

export default function IdeaForm({ values, loading = false, submitLabel = 'Сохранить', onChange, onSubmit }: Props) {
  return (
    <Stack spacing={2}>
      <TextField
        label="Название"
        value={values.title}
        onChange={e =>
          onChange({
            ...values,
            title: e.target.value,
          })
        }
      />

      <TextField
        label="Описание"
        multiline
        rows={4}
        value={values.description}
        onChange={e =>
          onChange({
            ...values,
            description: e.target.value,
          })
        }
      />

      <Button variant="contained" disabled={loading || !values.title.trim()} onClick={onSubmit}>
        {loading ? 'Сохранение...' : submitLabel}
      </Button>
    </Stack>
  );
}
