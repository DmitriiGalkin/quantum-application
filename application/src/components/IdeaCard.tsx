import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { Idea } from '../types';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import { useState } from "react";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

type IdeaCardProps = {
  idea: Idea;
  generateImageHandler?: () => void;
  isGeneratingImage?: boolean;
};

function IdeaCard({ idea, generateImageHandler, isGeneratingImage }: IdeaCardProps) {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(124);

    return (
    <Card
      component="article"
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        cursor: idea.id ? 'pointer' : 'default', // Убираем курсор, если ссылки нет
      }}
      onClick={() => idea.id && (window.location.href = `/idea/${idea.id}`)}
    >
      {/* Родительский контейнер для позиционирования иконки */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        <CardMedia
          component="img"
          height="90"
          image={idea.image || `/bg.jpeg`}
          alt={idea.title || 'Идея'}
          sx={{ objectFit: 'cover' }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Полупрозрачный фон для читаемости
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
            boxShadow: 3,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          {isGeneratingImage && (
            <Typography className="blink" color="text.secondary" sx={{ paddingLeft: 2 }}>
              Генерирую...
            </Typography>
          )}
          {generateImageHandler && (
            <IconButton
              aria-label="Сгенерировать обложку"
              onClick={e => {
                e.stopPropagation();
                generateImageHandler();
              }}
            >
              <AutoAwesome fontSize="large" />
            </IconButton>
          )}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>
          {idea.title}
        </Typography>
        <Typography color="text.secondary">{idea.description}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                  onClick={(e) => {
                      e.stopPropagation();
                      setLiked(!liked);
                      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
                  }}
                  color={liked ? 'error' : 'default'}
                  sx={{ transition: 'all 0.2s ease-in-out' }}
              >
                  {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="body1">
                  {likesCount.toLocaleString()}
              </Typography>
          </Box>
      </CardContent>
    </Card>
  );
}

export default IdeaCard;
