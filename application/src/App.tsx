import { Route, Routes } from 'react-router-dom';
import './App.css';
import IdeasPage from './pages/IdeasPage.tsx'
import HomePage from './pages/HomePage.tsx'
import ProjectsPage from './pages/ProjectsPage.tsx'
import ChatPage from './pages/ChatPage.tsx';
import CreateProjectPage from './pages/CreateProjectPage.tsx';
import IdeaPage from './pages/IdeaPage.tsx';
import ProjectPage from './pages/ProjectPage.tsx';
import EditProjectPage from './pages/EditProjectPage.tsx';
import PlaceSelectPage from './pages/PlaceSelectPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/ideas" element={<IdeasPage />} />

          <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/idea/:id" element={<IdeaPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/project/create" element={<CreateProjectPage />} />
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/project/:id/edit" element={<EditProjectPage />} />
        <Route path="/project/:id/edit/place" element={<PlaceSelectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
}

export default App;
