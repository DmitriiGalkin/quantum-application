import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { fetchConversations } from '../requests';
import type { Conversation } from '@shared/types';

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await fetchConversations();
        setConversations(data);
      } catch (error) {
        console.error('Ошибка загрузки чатов:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  if (loading) {
    return (
      <Grid container sx={{ justifyContent: 'center' }}>
        <Typography variant="h6">Загрузка чатов...</Typography>
      </Grid>
    );
  }

  return (
    <Grid container sx={{ padding: 3 }}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          Мои чаты
        </Typography>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <List>
          {conversations.map((conversation) => (
            <ListItemButton key={conversation.id}>
              <ListItemAvatar>
                <Avatar />
              </ListItemAvatar>
              <ListItemText
                primary={`Чат ${conversation.id}`}
                secondary="Последнее сообщение"
              />
            </ListItemButton>
          ))}
        </List>
      </Grid>
    </Grid>
  );
};

export default ChatPage;
