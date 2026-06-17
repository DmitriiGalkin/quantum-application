import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CommentIcon from '@mui/icons-material/Comment';

import type { ProjectFullDto } from '@shared/types';
import { Avatar, IconButton, ListItem, ListItemAvatar, ListItemText } from '@mui/material';

type ProjectListItemProps = {
  project: ProjectFullDto;
  withoutPassport?: boolean;
};

function ProjectListItem({ project, withoutPassport }: ProjectListItemProps) {
  return (
    <>
      <ListItem
        alignItems="flex-start"
        secondaryAction={
          <IconButton edge="end" aria-label="comments" href={`/chat?target=meet&projectId=${project.id}`}>
            <CommentIcon />
          </IconButton>
        }
        disablePadding
      >
        {!withoutPassport && (
          <ListItemAvatar>
            <Avatar alt={project?.passport?.title} src={project?.passport?.image || ''} />
          </ListItemAvatar>
        )}
        <ListItemText
          sx={{
            flex: '0 0 300px',
            overflow: 'hidden',
          }}
          primary={project?.place?.title}
          secondary={
            <>
              <Typography component="span" variant="body2" sx={{ color: 'text.primary', display: 'inline' }}>
                {project?.place?.address}
              </Typography>
            </>
          }
        />
        {/*<ListItemText*/}
        {/*  sx={{*/}
        {/*    flex: '0 0 150px',*/}
        {/*    overflow: 'hidden',*/}
        {/*  }}*/}
        {/*  primary="Read only"*/}
        {/*  secondary={<Rating name="read-only" value={2} readOnly />}*/}
        {/*/>*/}
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', py: 1 }}>
          {project.meets?.map(meet => (
            <ListItemText
              primary={new Date(meet.startedAt).toLocaleDateString('ru-RU')}
              secondary={new Date(meet.startedAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          ))}
        </Box>
      </ListItem>
    </>
  );
  //{meet.price ? `${meet.price} ₽` : 'Free'}
}

export default ProjectListItem;
