import { Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage'
import ChatPage from './ChatPage';
import CreateProjectPage from './CreateProjectPage';
import ProjectPage from './ProjectPage';
import EditProjectPage from './EditProjectPage';
import PlaceSelectPage from './PlaceSelectPage';
import NotFoundPage from './NotFoundPage';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/project/create" element={<CreateProjectPage />} />
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/project/:id/edit" element={<EditProjectPage />} />
        <Route path="/project/:id/edit/place" element={<PlaceSelectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
}

export default App;
