import { Route, Routes } from 'react-router-dom';
import './App.css';

import { AppLayout } from './AppLayout.tsx';

import IdeasPage from './pages/idea/IdeasPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import IdeaPage from './pages/idea/IdeaPage.tsx';
import ProjectPage from './pages/project/ProjectPage.tsx';

import ProjectEditPage from './pages/project/ProjectEditPage.tsx';
import TeacherProjectsPage from './areas/teacher/TeacherProjectsPage.tsx';

import UserIdeasPage from './areas/user/UserIdeasPage.tsx';
import UserProjectsPage from './areas/user/UserProjectsPage.tsx';

import NotFound from './shared/ui/NotFound.tsx';
import TeacherMeetsPage from './areas/teacher/TeacherMeetsPage.tsx';
import TeacherIdeasPage from './areas/teacher/TeacherIdeasPage.tsx';
import UserMeetsPage from './areas/user/UserMeetsPage.tsx';
import TeacherProjectCreatePage from './areas/teacher/TeacherProjectCreatePage.tsx';
import PlaceTeachersPage from './areas/place/PlaceTeachersPage.tsx';
import PlaceProjectsPage from './areas/place/PlaceProjectsPage.tsx';
import PlaceMeetsPage from './areas/place/PlaceMeetsPage.tsx';
import PlaceDashboardPage from './areas/place/PlaceDashboardPage.tsx';
import TeacherDashboardPage from './areas/teacher/TeacherDashboardPage.tsx';
import MeetCreatePage from './pages/meet/MeetCreatePage.tsx';
import MeetEditPage from './pages/meet/MeetEditPage.tsx';
import CreatePlacePage from './areas/place/CreatePlacePage.tsx';
import MissionPage from './pages/MissionPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import PrivacyPage from './pages/PrivacyPage.tsx';
import TermsPage from './pages/TermsPage.tsx';
import { LandingPlacePage } from './pages/landing/LandingPlacePage.tsx';
import { LandingTeacherPage } from './pages/landing/LandingTeacherPage.tsx';
import PaymentSuccessPage from './pages/PaymentSuccessPage.tsx';
import PaymentFailPage from './pages/PaymentFailPage.tsx';

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
        <Route path="project/:id/edit" element={<ProjectEditPage />} />
        <Route path="project/:id/meets/create" element={<MeetCreatePage />} />
        <Route path="project/:id/meets/:meetId/edit" element={<MeetEditPage />} />
      </Route>

      <Route element={<AppLayout withoutPaddings />}>
        <Route path="landing/teacher" element={<LandingTeacherPage />} />
        <Route path="landing/place" element={<LandingPlacePage />} />
        <Route path="mission" element={<MissionPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
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
        <Route index element={<TeacherDashboardPage />} />
        <Route path="projects" element={<TeacherProjectsPage />} />
        <Route path="projects/create" element={<TeacherProjectCreatePage />} />
        <Route path="meets" element={<TeacherMeetsPage />} />
        <Route path="ideas" element={<TeacherIdeasPage />} />
      </Route>
      {/* Центр */}
      <Route path="place" element={<AppLayout />}>
        <Route index element={<PlaceDashboardPage />} />
        <Route path="create" element={<CreatePlacePage />} />
        <Route path="teachers" element={<PlaceTeachersPage />} />
        <Route path="projects" element={<PlaceProjectsPage />} />
        <Route path="meets" element={<PlaceMeetsPage />} />
      </Route>

      <Route path="payment" element={<AppLayout />}>
        <Route path="success" element={<PaymentSuccessPage />} />
        <Route path="fail" element={<PaymentFailPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
