import { Typography } from '@mui/material'; // Добавлен импорт

type Props = {
  text?: string
};

function Title({ text }: Props) {
  if (!text) return null;

  return (
    <Typography variant="h4" sx={{ color: 'white' }}>
      {text}
    </Typography>
  );
}

export default Title;
