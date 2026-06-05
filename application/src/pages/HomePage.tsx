import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import '../App.css';
import Header from '../components/Header.tsx';
import { MapComponent } from '../components/MeetMap.tsx';


function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Header/>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper
          component="section"
          elevation={1}
          sx={{
            mb: 4,
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            overflow: 'hidden',
          }}
          aria-labelledby="auth-section-title"
        >
          <MapComponent lat={55.75} lng={37.62} zoom={12} />
        </Paper>
      </Container>
    </Box>
  );
}

export default HomePage;
