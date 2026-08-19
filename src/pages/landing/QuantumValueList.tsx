import { Stack, Typography } from '@mui/material';

type Role = 'guest' | 'parent' | 'teacher' | 'center';

export interface QuantumValue {
  title: string;
  roles: Role[];
  description: string;
}

interface Props {
  role: Role;
  values: QuantumValue[];
}

export function QuantumValueList({ role, values }: Props) {
  return (
    <Stack spacing={3}>
      {values
        .filter(item => item.roles.includes(role))
        .map(item => (
          <Stack key={item.title} spacing={0.5}>
            <Typography variant="h6">{item.title}</Typography>

            <Typography color="text.secondary">{item.description}</Typography>
          </Stack>
        ))}
    </Stack>
  );
}
