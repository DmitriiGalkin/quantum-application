import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import type { IdeaExtendedDto } from '@shared/types';
import { CardActionArea } from '@mui/material';
import Like from './Like.tsx';
import { useNavigate } from 'react-router-dom';
import { Author } from '../../../shared/ui/Author.tsx';

type IdeaCardProps = {
  idea: IdeaExtendedDto;
  onSelect?: () => void;
};

function IdeaCard({ idea }: IdeaCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      elevation={1}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        overflow: 'hidden',
      }}
    >
      <CardActionArea onClick={() => navigate(`/idea/${idea.id}`)}>
        <CardMedia component="img" height="120" image={idea.image || `/bg.jpeg`} sx={{ objectFit: 'cover' }} />

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom noWrap>
            {idea.title}
          </Typography>

          <Typography
            sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              color: 'text.secondary',
            }}
          >
            {idea.description}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ justifyContent: 'space-between', pr: 2 }}>
        <Like ideaId={idea.id} isLiked={idea.isLiked} likesCount={idea.userCount} />
        <Author user={idea.user} />
      </CardActions>
    </Card>
  );
}

export default IdeaCard;
