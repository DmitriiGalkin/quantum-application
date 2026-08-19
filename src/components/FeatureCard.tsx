// FeatureCard.tsx
import type { ReactNode } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      {icon}

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, mt: 2 }}>
        {title}
      </Typography>

      <Typography color="text.secondary">{description}</Typography>
    </CardContent>
  </Card>
);
