import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import type { Project } from '../types.ts';
import AutoAwesome from '@mui/icons-material/AutoAwesome';

type ProjectCardProps = {
  project: Project;
  generateImageHandler?: () => void;
  isGeneratingImage?: boolean;
};

function ProjectCard({ project, generateImageHandler, isGeneratingImage }: ProjectCardProps) {
  return (
    <Card
      component="article"
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        cursor: project.id ? 'pointer' : 'default', // Убираем курсор, если ссылки нет
      }}
      onClick={() => project.id && (window.location.href = `/project/${project.id}`)}
    >
      {/* Родительский контейнер для позиционирования иконки */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Полупрозрачный фон для читаемости
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
            boxShadow: 3,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          {/* Кнопка с иконкой в правом верхнем углу */}
          {isGeneratingImage && (
            <Typography className="blink" color="text.secondary" sx={{ paddingLeft: 2 }}>
              Генерирую...
            </Typography>
          )}
          {generateImageHandler && (
            <IconButton
              aria-label="Сгенерировать обложку"
              // Здесь будет обработчик клика на генерацию
              onClick={e => {
                e.stopPropagation();
                generateImageHandler();
              }}
            >
              <AutoAwesome fontSize="large" />
            </IconButton>
          )}
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 800 }} gutterBottom>
              {project.passportId}
          </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800 }} gutterBottom>
          {project.title}
        </Typography>
        <Typography color="text.secondary">{project.description}</Typography>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
