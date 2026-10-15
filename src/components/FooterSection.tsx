import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useId, useState } from 'react';
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
  const contentId = useId();

  return (
    <Box>
      <Button
        fullWidth
        aria-expanded={open}
        aria-controls={contentId}
        endIcon={open ? <RemoveIcon /> : <AddIcon />}
        onClick={() => setOpen(value => !value)}
        sx={{
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'space-between',
          color: 'text.primary', px: 0,
        }}
      >
        {title}
      </Button>
      <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>{title}</Typography>

      <Box
        sx={{
          display: { xs: open ? 'block' : 'none', md: 'block' },
        }}
        id={contentId}
      >
        <Box sx={{ minHeight: 0, overflow: 'hidden' }}>
          <FooterLinks links={links} />
        </Box>
      </Box>
    </Box>
  );
}
