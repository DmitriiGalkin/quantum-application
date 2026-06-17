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
    <Box sx={{ minHeight: '100vh' }}>
      <Header />

      <Stack direction="row" spacing={2}>
        <Box sx={{ width: '20%', position: 'sticky', top: '100px', display: { xs: 'none', md: 'block' } }}>
          <Menu />
        </Box>
        <Stack sx={{ width: '80%' }}>{children}</Stack>
      </Stack>

      <Footer />
    </Box>
  );
}

export default Page;
