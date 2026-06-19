import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchLike, fetchUnlike } from '../requests.ts';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useAuth } from '../providers/AuthProvider.tsx';

type ChatBubbleProps = {
  isLiked?: boolean;
  ideaId: number;
};

export default function Like({ isLiked, ideaId }: ChatBubbleProps) {
  const { user, authHandler } = useAuth();
  const [liked, setLiked] = useState(isLiked);
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
        mutationLike.mutate({ ideaId, userId: user.id });
      } else {
        setLiked(false);
        mutationUnlike.mutate({ ideaId, userId: user.i });
      }
    } else {
      authHandler();
    }
  };

  return (
    <Tooltip title="В избранное">
      <IconButton
        onClick={e => {
          e.stopPropagation();
          handleLike();
        }}
      >
        {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );
}
