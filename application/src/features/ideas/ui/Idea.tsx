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
            <Typography className="blink" color="text.secondary" sx={{ paddingLeft: 1 }}>
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
          <Typography
            component="h1"
            variant="h3"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
            }}
          >
            {idea.title}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            {idea.description}
          </Typography>

          <Typography gutterBottom align="right" sx={{ marginLeft: 'auto', pr: 1 }} variant="body1" color="textDisabled">
            {idea.user?.title}, {idea.user?.age} лет
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ p: 2 }}>
        <Stack direction="row" spacing={2}>
          <Button variant="contained">Создать проект</Button>
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
