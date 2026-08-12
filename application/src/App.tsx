import { Route, Routes } from 'react-router-dom';
import './App.css';

import { AppLayout } from './AppLayout.tsx';

import IdeasPage from './pages/idea/IdeasPage.tsx';
import ChatPageOld from './pages/ChatPageOld.tsx';
import IdeaPage from './pages/idea/IdeaPage.tsx';
import ProjectPage from './pages/project/ProjectPage.tsx';
import TeacherProjectsPage from './pages/teacher/TeacherProjectsPage.tsx';
import UserIdeasPage from './pages/user/UserIdeasPage.tsx';
import UserProjectsPage from './pages/user/UserProjectsPage.tsx';
import NotFound from './shared/ui/NotFound.tsx';
import TeacherMeetsPage from './pages/teacher/TeacherMeetsPage.tsx';
import TeacherIdeasPage from './pages/teacher/TeacherIdeasPage.tsx';
import UserMeetsPage from './pages/user/UserMeetsPage.tsx';
import PlaceTeachersPage from './pages/place/PlaceTeachersPage.tsx';
import PlaceProjectsPage from './pages/place/PlaceProjectsPage.tsx';
import PlaceMeetsPage from './pages/place/PlaceMeetsPage.tsx';
import PlaceDashboardPage from './pages/place/PlaceDashboardPage.tsx';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage.tsx';
import MissionPage from './pages/MissionPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import PrivacyPage from './pages/PrivacyPage.tsx';
import TermsPage from './pages/TermsPage.tsx';
import { LandingPlacePage } from './pages/landing/LandingPlacePage.tsx';
import { LandingTeacherPage } from './pages/landing/LandingTeacherPage.tsx';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage.tsx';
import PaymentFailPage from './pages/payment/PaymentFailPage.tsx';
import { LandingParentPage } from './pages/landing/LandingParentPage.tsx';
import PlaceInvitePage from './pages/place/PlaceInvitePage.tsx';
import TeacherUserIdeasPage from './pages/teacher/TeacherUserIdeasPage.tsx';
import TeachersPage from './pages/TeachersPage.tsx';
import ChatPage from './pages/ChatPage.tsx';
import UserHomePage from './pages/user/UserHomePage.tsx';
import PlaceUsersPage from './pages/place/PlaceUsersPage.tsx';
import PlaceLocationsPage from './pages/place/PlaceLocationsPage.tsx';

function App() {
  return (
    <Routes>
      {/* Общедоступная часть */}
      <Route element={<AppLayout />}>
        <Route index element={<IdeasPage />} />
        <Route path="chat" element={<ChatPageOld />} />
        <Route path="chatOld/:id" element={<ChatPageOld />} />
        <Route path="users/:id" element={<div>UserPage</div>} />
        <Route path="idea/:id" element={<IdeaPage />} />
        <Route path="project/:id" element={<ProjectPage />} />
        <Route path="teachers/:id" element={<TeachersPage />} />
        <Route path="places/:id" element={<div />} />
        <Route path="chats" element={<ChatPage />} />
      </Route>

      <Route element={<AppLayout withoutPaddings />}>
        <Route path="landing/parent" element={<LandingParentPage />} />
        <Route path="landing/teacher" element={<LandingTeacherPage />} />
        <Route path="landing/place" element={<LandingPlacePage />} />
        <Route path="mission" element={<MissionPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
      </Route>

      {/* Ученик */}
      <Route path="user" element={<AppLayout />}>
        <Route index element={<UserHomePage />} />
        <Route path="ideas" element={<UserIdeasPage />} />
        <Route path="projects" element={<UserProjectsPage />} />
        <Route path="meets" element={<UserMeetsPage />} />
      </Route>

      {/* Учитель */}
      <Route path="teacher" element={<AppLayout />}>
        <Route index element={<TeacherDashboardPage />} />
        <Route path="projects" element={<TeacherProjectsPage />} />
        <Route path="meets" element={<TeacherMeetsPage />} />
        <Route path="ideas" element={<TeacherIdeasPage />} />
        <Route path="userIdeas" element={<TeacherUserIdeasPage />} />
      </Route>

      {/* Центр */}
      <Route path="place" element={<AppLayout />}>
        <Route index element={<PlaceDashboardPage />} />
        <Route path="teachers" element={<PlaceTeachersPage />} />
        <Route path="locations" element={<PlaceLocationsPage />} />
        <Route path="projects" element={<PlaceProjectsPage />} />
        <Route path="users" element={<PlaceUsersPage />} />
        <Route path="meets" element={<PlaceMeetsPage />} />
        <Route path="invite" element={<PlaceInvitePage />} />
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
