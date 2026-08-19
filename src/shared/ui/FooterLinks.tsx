import { Link, Stack } from "@mui/material";

export function FooterLinks({
  links,
}: {
  links: {
    label: string;
    href: string;
  }[];
}) {
  return (
    <Stack
      spacing={1}
      sx={{
        mt: {
          xs: 0,
          md: 1.5,
        },
        pb: {
          xs: 2,
          md: 0,
        },
      }}
    >
      {links.map(link => (
        <Link key={link.href} href={link.href} variant="body2" color="text.secondary" underline="hover">
          {link.label}
        </Link>
      ))}
    </Stack>
  );
}
