import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchLike, fetchUnlike } from '../requests.ts';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';

type ChatBubbleProps = {
  isLiked: boolean;
  ideaId: number;
  userId: number;
};

export default function Like({ isLiked, ideaId, userId }: ChatBubbleProps) {
  const [liked, setLiked] = useState(isLiked);
  const mutationLike = useMutation({
    mutationFn: fetchLike,
  });
  const mutationUnlike = useMutation({
    mutationFn: fetchUnlike,
  });

  const handleLike = () => {
    if (!liked) {
      mutationLike.mutate({ ideaId, userId });
    } else {
      mutationUnlike.mutate({ ideaId, userId });
    }
  };

  return (
    <IconButton
      onClick={e => {
        e.stopPropagation();
        setLiked(!liked);
        handleLike();
      }}
      sx={{ color: 'white' }}
    >
      {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    </IconButton>
  );
}
