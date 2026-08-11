import Box from '@mui/material/Box';
import { IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from "react";
import { FooterLinks } from './FooterLinks.tsx';

type FooterSectionProps = {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
};

export function FooterSection({ title, links }: FooterSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Stack
        direction="row"
        onClick={() => setOpen(value => !value)}
        sx={{
          minHeight: { xs: 30, md: 'auto' },
          cursor: { xs: 'pointer', md: 'default' },
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2">{title}</Typography>

        <IconButton size="small" sx={{ display: { xs: 'flex', md: 'none' } }}>
          {open ? <RemoveIcon /> : <AddIcon />}
        </IconButton>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: {
            xs: open ? '1fr' : '0fr',
            md: '1fr',
          },
          transition: 'grid-template-rows 200ms ease',
        }}
      >
        <Box sx={{ minHeight: 0, overflow: 'hidden' }}>
          <FooterLinks links={links} />
        </Box>
      </Box>
    </Box>
  );
}
