import { Box, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';

export interface ThirdPartyServicesSectionProps {
  id: string;
  title?: string;
  description?: string;
  items: string[];
  footer?: string;
}

export function Section({
  id,
  title,
  description,
  items,
  footer,
}: ThirdPartyServicesSectionProps) {
  return (
    <Box id={id}>
      <Stack spacing={2}>
        {description && <Typography variant="h5">{title}</Typography>}

        {description && <Typography variant="body1">{description}</Typography>}

        <List dense disablePadding>
          {items.map(item => (
            <ListItem key={item}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>

        <Typography variant="body2" color="text.secondary">
          {footer}
        </Typography>
      </Stack>
    </Box>
  );
}
