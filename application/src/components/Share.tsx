import ShareIcon from '@mui/icons-material/Share';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

type ShareProps = {
  title: string;
  description?: string;
};

export default function Share({ title, description }: ShareProps) {
  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title,
        text: description ?? '',
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <Tooltip title="Поделиться">
      <IconButton
        onClick={e => {
          e.stopPropagation();
          handleShare();
        }}
      >
        <ShareIcon />
      </IconButton>
    </Tooltip>
  );
}
