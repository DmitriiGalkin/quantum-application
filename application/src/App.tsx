import { Route, Routes } from 'react-router-dom';
import './App.css';
import { lazy, Suspense } from 'react';
import LoadingPage from './LoadingPage.tsx';

// Ленивый импорт компонентов
const HomePage = lazy(() => import('./HomePage'));
const ChatPage = lazy(() => import('./ChatPage'));
const CreateProjectPage = lazy(() => import('./CreateProjectPage'));
const ProjectPage = lazy(() => import('./ProjectPage'));
const EditProjectPage = lazy(() => import('./EditProjectPage'));
const PlaceSelectPage = lazy(() => import('./PlaceSelectPage'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));

function App() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/project/create" element={<CreateProjectPage />} />
        <Route path="/project/:id" element={<ProjectPage />} />
        <Route path="/project/:id/edit" element={<EditProjectPage />} />
        <Route path="/project/:id/edit/place" element={<PlaceSelectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
