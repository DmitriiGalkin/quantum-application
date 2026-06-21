import { Route, Routes } from 'react-router-dom';
import './App.css';
import IdeasPage from './pages/IdeasPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import IdeaPage from './pages/IdeaPage.tsx';
import ProjectPage from './pages/ProjectPage.tsx';
import EditProjectPage from './pages/EditProjectPage.tsx';
import NotFound from './shared/ui/NotFound.tsx';
import UserIdeasPage from './pages/UserIdeasPage.tsx';
import UserProjectsPage from './pages/UserProjectsPage.tsx';
import PassportProjectsPage from './pages/PassportProjectsPage.tsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<IdeasPage />} />
      <Route path="/user/:id/ideas" element={<UserIdeasPage />} />
      <Route path="/user/:id/projects" element={<UserProjectsPage />} />
      <Route path="/passport/projects" element={<PassportProjectsPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/chat/:id" element={<ChatPage />} />
      <Route path="/idea/:id" element={<IdeaPage />} />
      <Route path="/project/:id" element={<ProjectPage />} />
      <Route path="/project/:id/edit" element={<EditProjectPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
