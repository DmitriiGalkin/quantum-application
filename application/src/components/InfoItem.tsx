import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Определяем тип для иконки. React.ComponentType<{}> означает "любой React-компонент без пропсов"
type IconComponent = React.ComponentType<any>;

interface InfoItemProps {
  icon: IconComponent;
  value: string;
}

// Компонент принимает иконку, название и значение
// sx применяется к корневому Stack для кастомизации
const InfoItem = ({ icon: Icon, value }: InfoItemProps) => {
  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        minWidth: 80, // Базовая ширина
        alignItems: 'center',
      }}
    >
      <Icon color="primary" />
      <Box>
        <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
      </Box>
    </Stack>
  );
};

export default InfoItem;
