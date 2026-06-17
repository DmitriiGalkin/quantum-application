import type { MeetDto, ProjectDto } from '@shared/types';
import { Avatar, AvatarGroup, IconButton, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';

type MeetListItemProps = {
  meet: MeetDto;
};

function MeetListItem({ meet }: MeetListItemProps) {
  return (
    <>
      <ListItem alignItems="flex-start" disablePadding>
        <ListItemAvatar>
          <AvatarGroup>
            {meet.users?.map(user => (
              <Avatar alt={user.title} src={user.image || ''} sx={{ width: 32, height: 32 }} />
            ))}
          </AvatarGroup>
        </ListItemAvatar>
        <ListItemText
          primary={new Date(meet.startedAt).toLocaleDateString('ru-RU')}
          secondary={new Date(meet.startedAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        />
        <ListItemButton component="a" href="#simple-list" onClick={() => console.log('onClick')}>
          <ListItemText primary="Участвовать" />
        </ListItemButton>
      </ListItem>
    </>
  );
}

export default MeetListItem;
