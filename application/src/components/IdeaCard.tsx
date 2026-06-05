import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import { useState } from "react";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import type { ExtendedIdea } from '../requests.ts';

type IdeaCardProps = {
  idea: ExtendedIdea;
};

function IdeaCard({ idea }: IdeaCardProps) {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(124);
    return (
      <Card
        component="article"
        elevation={1}
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
      >
        <CardMedia component="img" height="90" image={idea.image || `/bg.jpeg`} alt={idea.title || 'Идея'} sx={{ objectFit: 'cover' }} />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom noWrap>
            {idea.title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
            }}
            gutterBottom
          >
            {idea.description}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <IconButton
              onClick={e => {
                e.stopPropagation();
                setLiked(!liked);
                setLikesCount(prev => (liked ? prev - 1 : prev + 1));
              }}
              color={liked ? 'error' : 'default'}
              sx={{ transition: 'all 0.2s ease-in-out' }}
            >
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body1">{likesCount.toLocaleString()}</Typography>
          </Box>
          <Typography sx={{ marginLeft: 'auto', pr: 1 }} variant="body1" color="textDisabled">
            {idea.user.title}, {idea.user.age} лет
          </Typography>
        </CardActions>
      </Card>
    );
}

export default IdeaCard;
