import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import type { IdeaDto } from 'entities';
import CardActionArea from '@mui/material/CardActionArea';
import { Link } from 'react-router-dom';

interface IdeaCardData {
  id: number;
  title: string;
  description: string;
  image: string | null;
}

type IdeaCardProps = {
  idea: IdeaDto | IdeaCardData;
  onSelect?: () => void;
};

function IdeaCard({ idea }: IdeaCardProps) {
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
      <CardActionArea component={Link} to={`/idea/${idea.id}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
        <CardMedia component="img" alt={idea.title} image={idea.image || `/bg.jpeg`} sx={{ height: { xs: 240, sm: 280 }, objectFit: 'cover' }} />

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

      {/*<CardActions sx={{ justifyContent: 'space-between', pr: 2 }}>*/}
      {/*  <Like ideaId={idea.id} isLiked={idea.isLiked} likesCount={idea.userCount} />*/}
      {/*  <Author user={idea.user} />*/}
      {/*</CardActions>*/}
    </Card>
  );
}

export default IdeaCard;
