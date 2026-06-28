import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchLike, fetchUnlike } from '../../../requests.ts';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';

type ChatBubbleProps = {
  isLiked?: boolean;
  ideaId: number;
  likesCount?: number;
};

export default function Like({ isLiked, ideaId, likesCount }: ChatBubbleProps) {
  const { user, authHandler } = useAuth();
  const [liked, setLiked] = useState(isLiked);
  const [count, setCount] = useState<number>(likesCount || 0);

  const mutationLike = useMutation({
    mutationFn: fetchLike,
  });
  const mutationUnlike = useMutation({
    mutationFn: fetchUnlike,
  });

  const handleLike = () => {
    if (user) {
      if (!liked) {
        setLiked(true);
        setCount(prev => prev + 1);
        mutationLike.mutate({ ideaId, userId: user.id });
      } else {
        setLiked(false);
        setCount(prev => prev - 1);
        mutationUnlike.mutate({ ideaId, userId: user.id });
      }
    } else {
      authHandler();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <Tooltip title="В избранное">
        <IconButton
          onClick={_ => {
            handleLike();
          }}
        >
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Tooltip>
      {Boolean(count) && <Typography variant="body1">{count}</Typography>}
    </Box>
  );
}
