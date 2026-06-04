import {  type FormEvent, type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SaveIcon from '@mui/icons-material/Save';

export interface ProjectFormValues {
  title: string;
  description: string;
}

interface ProjectFormProps {
  initialValues: ProjectFormValues;
  submitButtonText: string;
  submittingButtonText: string;
  placeSelectPath: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  placeInfo?: ReactNode;
  extraContent?: ReactNode;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
}

function ProjectForm({
  initialValues,
  submitButtonText,
  submittingButtonText,
  placeSelectPath,
  isSubmitting = false,
  submitError = null,
  placeInfo,
  extraContent,
  onSubmit,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      title,
      description,
    });
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {submitError && <Alert severity="error">{submitError}</Alert>}

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={2.5}>
              <TextField
                label="Название проекта"
                type="text"
                value={title}
                onChange={event => setTitle(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Описание"
                multiline
                rows={6}
                value={description}
                onChange={event => setDescription(event.target.value)}
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Typography component="h2" variant="h5" sx={{ fontWeight: 900 }}>
                Место
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  component={Link}
                  to={placeSelectPath}
                  variant="contained"
                  startIcon={<LocationOnIcon />}
                >
                  Выбрать на карте
                </Button>

                <Button type="button" variant="outlined">
                  Перекресток
                </Button>
              </Stack>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'grey.100',
                }}
              >
                {placeInfo || (
                  <Typography color="text.secondary">
                    Место пока можно будет выбрать позже. Сейчас создаём базовую карточку проекта.
                  </Typography>
                )}
              </Paper>
            </Stack>
          </CardContent>
        </Card>

        {extraContent}

        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          disabled={isSubmitting}
          sx={{
            alignSelf: { xs: 'stretch', sm: 'flex-end' },
            px: 4,
            py: 1.25,
            borderRadius: 3,
            fontWeight: 800,
          }}
        >
          {isSubmitting ? submittingButtonText : submitButtonText}
        </Button>
      </Stack>
    </Box>
  );
}

export default ProjectForm;
