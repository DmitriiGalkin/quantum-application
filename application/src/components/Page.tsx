import Box from '@mui/material/Box';
import '../App.css';
import Header from '../components/Header.tsx';
import Stack from '@mui/material/Stack';
import Footer from './Footer.tsx';
import Menu from '../components/Menu.tsx';

interface Props {
  children: React.ReactNode;
}
function Page({ children }: Props) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header />

      <Box sx={{ flex: 1, width: '100%', mx: 'auto', pr: 3 }}>
        <Stack direction="row" spacing={3}>
          {/* Sidebar */}
          <Box
            sx={{
              width: { md: 280 },
              flexShrink: 0,
              display: { xs: 'none', md: 'block' },
              position: 'sticky',
              top: 100,
              height: 'fit-content', // 🔥 важно для sticky
            }}
          >
            <Menu />
          </Box>

          {/* Content */}
          <Box sx={{ flexGrow: 1, minWidth: 0, pt: 2 }}>{children}</Box>
        </Stack>
      </Box>

      <Footer />
    </Box>
  );
}

export default Page;
