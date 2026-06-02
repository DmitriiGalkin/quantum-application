import { Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './home/HomePage.tsx'
import ChatPage from './chat/ChatPage.tsx';
import CreateProjectPage from './CreateProjectPage';
import IdeaPage from './idea/IdeaPage.tsx';
import ProjectPage from './project/ProjectPage.tsx';
import EditProjectPage from './EditProjectPage';
import PlaceSelectPage from './PlaceSelectPage';
import NotFoundPage from './NotFoundPage';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/idea/:id" element={<IdeaPage />} />
        <Route path="/project/create" element={<CreateProjectPage />} />
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/project/:id/edit" element={<EditProjectPage />} />
        <Route path="/project/:id/edit/place" element={<PlaceSelectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
}

export default App;
