import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

import { AppLayout } from './components/AppLayout.tsx';

import NotFound from './components/NotFound.tsx';
import ProjectsRedirect from './pages/ProjectsRedirect.tsx';

const IdeasPage = lazy(() => import('./pages/IdeasPage.tsx'));
const IdeaPage = lazy(() => import('./pages/IdeaPage.tsx'));
const ProjectPage = lazy(() => import('./pages/ProjectPage.tsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.tsx'));
const TeacherProjectsPage = lazy(() => import('./pages/teacher/TeacherProjectsPage.tsx'));
const UserIdeasPage = lazy(() => import('./pages/user/UserIdeasPage.tsx'));
const UserProjectsPage = lazy(() => import('./pages/user/UserProjectsPage.tsx'));
const TeacherMeetsPage = lazy(() => import('./pages/teacher/TeacherMeetsPage.tsx'));
const TeacherIdeasPage = lazy(() => import('./pages/teacher/TeacherIdeasPage.tsx'));
const UserMeetsPage = lazy(() => import('./pages/user/UserMeetsPage.tsx'));
const PlaceTeachersPage = lazy(() => import('./pages/place/PlaceTeachersPage.tsx'));
const PlaceProjectsPage = lazy(() => import('./pages/place/PlaceProjectsPage.tsx'));
const PlaceMeetsPage = lazy(() => import('./pages/place/PlaceMeetsPage.tsx'));
const PlaceDashboardPage = lazy(() => import('./pages/place/PlaceDashboardPage.tsx'));
const TeacherDashboardPage = lazy(() => import('./pages/teacher/TeacherDashboardPage.tsx'));
const MissionPage = lazy(() => import('./pages/MissionPage.tsx'));
const AboutPage = lazy(() => import('./pages/AboutPage.tsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.tsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.tsx'));
const LandingPlacePage = lazy(() => import('./pages/landing/LandingPlacePage.tsx').then(module => ({ default: module.LandingPlacePage })));
const LandingTeacherPage = lazy(() => import('./pages/landing/LandingTeacherPage.tsx').then(module => ({ default: module.LandingTeacherPage })));
const PaymentSuccessPage = lazy(() => import('./pages/payment/PaymentSuccessPage.tsx'));
const PaymentFailPage = lazy(() => import('./pages/payment/PaymentFailPage.tsx'));
const LandingParentPage = lazy(() => import('./pages/landing/LandingParentPage.tsx').then(module => ({ default: module.LandingParentPage })));
const PlaceInvitePage = lazy(() => import('./pages/place/PlaceInvitePage.tsx'));
const TeacherUserIdeasPage = lazy(() => import('./pages/teacher/TeacherUserIdeasPage.tsx'));
const TeachersPage = lazy(() => import('./pages/TeachersPage.tsx'));
const ChatPage = lazy(() => import('./pages/ChatPage.tsx'));
const UserHomePage = lazy(() => import('./pages/user/UserHomePage.tsx'));
const PlaceUsersPage = lazy(() => import('./pages/place/PlaceUsersPage.tsx'));
const PlaceLocationsPage = lazy(() => import('./pages/place/PlaceLocationsPage.tsx'));
const PlacesPage = lazy(() => import('./pages/PlacesPage.tsx'));
const RentalsPage = lazy(() => import('./pages/RentalsPage.tsx'));
const CraftSchoolProgramPage = lazy(() => import('./pages/CraftSchoolProgramPage.tsx'));

function Routers() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<ProjectsPage />} />
        <Route path="ideas" element={<IdeasPage />} />
        <Route path="craft-school-program" element={<CraftSchoolProgramPage />} />
        <Route path="users/:id" element={<div>UserPage</div>} />
        <Route path="idea/:id" element={<IdeaPage />} />
        <Route path="projects" element={<ProjectsRedirect />} />
        <Route path="project/:id" element={<ProjectPage />} />
        <Route path="teachers/:id" element={<TeachersPage />} />
        <Route path="places/:id" element={<PlacesPage />} />
        <Route path="chats" element={<ChatPage />} />
        <Route path="chats/:id" element={<ChatPage />} />

        <Route path="user">
          <Route index element={<UserHomePage />} />
          <Route path="ideas" element={<UserIdeasPage />} />
          <Route path="projects" element={<UserProjectsPage />} />
          <Route path="meets" element={<UserMeetsPage />} />
        </Route>

        <Route path="teacher">
          <Route index element={<TeacherDashboardPage />} />
          <Route path="projects" element={<TeacherProjectsPage />} />
          <Route path="meets" element={<TeacherMeetsPage />} />
          <Route path="rentals" element={<RentalsPage />} />
          <Route path="ideas" element={<TeacherIdeasPage />} />
          <Route path="userIdeas" element={<TeacherUserIdeasPage />} />
        </Route>

        <Route path="place">
          <Route index element={<PlaceDashboardPage />} />
          <Route path="teachers" element={<PlaceTeachersPage />} />
          <Route path="locations" element={<PlaceLocationsPage />} />
          <Route path="rentals" element={<RentalsPage centre />} />
          <Route path="projects" element={<PlaceProjectsPage />} />
          <Route path="users" element={<PlaceUsersPage />} />
          <Route path="meets" element={<PlaceMeetsPage />} />
          <Route path="invite" element={<PlaceInvitePage />} />
        </Route>

        <Route path="payment">
          <Route path="success" element={<PaymentSuccessPage />} />
          <Route path="fail" element={<PaymentFailPage />} />
        </Route>
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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Routers;
