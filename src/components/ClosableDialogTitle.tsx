import type { ReactNode } from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  children: ReactNode;
  onClose: () => void;
  disabled?: boolean;
}

export default function ClosableDialogTitle({ children, onClose, disabled = false }: Props) {
  return <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1 }}>
    <Box component="span" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{children}</Box>
    <IconButton aria-label="Закрыть диалог" onClick={onClose} disabled={disabled} sx={{ flexShrink: 0 }}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>;
}
