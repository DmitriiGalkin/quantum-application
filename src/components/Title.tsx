import Typography from '@mui/material/Typography'; // Добавлен импорт

type Props = {
  text?: string
};

function Title({ text }: Props) {
  if (!text) return null;

  return (
    <Typography variant="h4" sx={{ color: 'text.primary' }}>
      {text}
    </Typography>
  );
}

export default Title;
