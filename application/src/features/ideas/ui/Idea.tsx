import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateImage } from '../../../requests.ts';
import IconButton from '@mui/material/IconButton';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Like from './Like.tsx';
import { Button, CardActions } from '@mui/material';
import Share from '../../../shared/ui/Share.tsx';
import { Author } from '../../../shared/ui/Author.tsx';

function Idea({ idea }: { idea: any}) {
  const queryClient = useQueryClient();

  const generateImageMutation = useMutation({
    mutationFn: generateImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', idea.id] });
    },
  });

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <CardMedia
          component="img"
          height="360"
          image={idea.image || `/bg.jpeg`}
          alt={idea.title || 'Проект'}
          sx={{
            objectFit: 'cover',
            height: {
              xs: 220,
              sm: 360,
            },
          }}
        />
        {/* Блок с кнопкой генерации */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 28,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
            boxShadow: 3,
            borderRadius: '24px',
            padding: '1px',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          {generateImageMutation.isPending && (
            <Typography className="blink" sx={{ color: 'text.secondary',  paddingLeft: 1 }}>
              Генерирую...
            </Typography>
          )}
          <IconButton
            aria-label="Сгенерировать обложку"
            onClick={e => {
              e.stopPropagation();
              generateImageMutation.mutate(idea.id);
            }}
          >
            <AutoAwesome fontSize="large" />
          </IconButton>
        </Box>
      </Box>
      <CardContent>
        <Stack spacing={1}>
          <Typography component="h1" variant="h6">
            {idea.title}
          </Typography>

          <Typography
            sx={{
              mt: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              color: 'text.secondary',
            }}
          >
            {idea.description}
          </Typography>

          <Author user={idea.user} />
        </Stack>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
          <Stack>
            <Typography variant="caption" gutterBottom sx={{ color: 'text.secondary' }}>
              Для преподавателей
            </Typography>{' '}
            <Button variant="outlined">Создать свой проект</Button>
          </Stack>
          <Stack direction="row">
            <Like isLiked={idea.isLiked} ideaId={idea.id} />
            <Share title={idea.title} description={idea.description || ''} />
          </Stack>
        </Stack>
      </CardActions>
    </Card>
  );
}

export default Idea;
