import { Route, Routes } from 'react-router-dom';
import './App.css';

import { AppLayout } from './AppLayout.tsx';

import IdeasPage from './pages/IdeasPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import IdeaPage from './pages/IdeaPage.tsx';
import ProjectPage from './pages/ProjectPage.tsx';

import EditProjectPage from './areas/teacher/EditProjectPage.tsx';
import PassportProjectsPage from './areas/teacher/PassportProjectsPage.tsx';

import UserIdeasPage from './areas/user/UserIdeasPage.tsx';
import UserProjectsPage from './areas/user/UserProjectsPage.tsx';

import NotFound from './shared/ui/NotFound.tsx';
import TeacherMeetsPage from './areas/teacher/TeacherMeetsPage.tsx';
import TeacherIdeasPage from './areas/teacher/TeacherIdeasPage.tsx';
import UserMeetsPage from './areas/user/UserMeetsPage.tsx';
import PassportProjectCreatePage from "./areas/teacher/PassportProjectCreatePage.tsx";

function App() {
  return (
    <Routes>
      {/* Общедоступная часть */}
      <Route element={<AppLayout />}>
        <Route index element={<IdeasPage />} />

        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:id" element={<ChatPage />} />

        <Route path="idea/:id" element={<IdeaPage />} />

        <Route path="project/:id" element={<ProjectPage />} />
        <Route path="project/:id/edit" element={<EditProjectPage />} />
      </Route>

      {/* Ученик */}
      <Route path="user/:id" element={<AppLayout />}>
        <Route index element={<UserIdeasPage />} />

        <Route path="ideas" element={<UserIdeasPage />} />
        <Route path="projects" element={<UserProjectsPage />} />

        <Route path="meets" element={<UserMeetsPage />} />
      </Route>

      {/* Учитель */}
      <Route path="teacher" element={<AppLayout />}>
        <Route index element={<div>Дашборд учителя</div>} />

        <Route path="projects" element={<PassportProjectsPage />} />
        <Route path="projects/create" element={<PassportProjectCreatePage />} />
        <Route path="meets" element={<TeacherMeetsPage />} />

        <Route path="ideas" element={<TeacherIdeasPage />} />
      </Route>

      {/* Центр */}
      <Route path="place" element={<AppLayout />}>
        <Route index element={<div>Дашборд центра</div>} />

        {/* MVP */}
        <Route path="teachers" element={<div>Учителя</div>} />
        <Route path="projects" element={<div>Проекты центра</div>} />
        <Route path="meets" element={<div>Расписание</div>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
