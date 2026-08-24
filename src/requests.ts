import {
  type Conversation,
  type CreateIdea,
  type CreateIdeaUser,
  type CreateLocation,
  type CreateMeet,
  type CreateMeetUser,
  type CreatePlace,
  type CreateProject,
  type CreateProjectUser,
  type DeleteIdeaUser,
  type DeleteMeetUser,
  type GetIdeasQuery,
  type GetProjectsQuery,
  type IdeaExtendedDto,
  type IdeaFullDto,
  type LocationDto,
  type MeetDto,
  type MeetStatus,
  type Message,
  type PassportExtendedDto,
  type PaymentCreateDto,
  type PaymentCreateResponseDto,
  type PaymentDto,
  type PlaceDashboardDto,
  type PlaceDto,
  type ProjectDto,
  type StartConversationResponse,
  type TeacherDashboardDto,
  type TeacherDto,
  type TeacherPublicDto,
  type UpdateMeet,
  type UserDashboardDto,
  type UserDto,
} from 'entities';
import { del, get, post, put, toQuery } from './utils/api.ts';
import type { PlaceFormValues } from './features/place/PlaceForm.tsx';

export const fetchIdeas = (params: GetIdeasQuery) => get<IdeaExtendedDto[]>(`/ideas${toQuery(params)}`);
export const fetchProjects = (params: GetProjectsQuery) => get<ProjectDto[]>(`/projects${toQuery(params)}`);
export const fetchIdea = (id: string, params: GetIdeasQuery) => get<IdeaFullDto>(`/idea/${id}${toQuery(params)}`);
export const fetchCreateIdea = (params: CreateIdea) => post<number>('/idea', params);
export const fetchUserIdeas = () => get<IdeaExtendedDto[]>(`/user/ideas`);
export const fetchTeacherIdeas = () => get<IdeaExtendedDto[]>('/teacher/ideas');
export const generateImage = (ideaId: number) => post<void>(`/idea/${ideaId}/generateImage`, {});
export const fetchLike = (params: CreateIdeaUser) => post<void>('/ideaUser', params);
export const fetchUnlike = (params: DeleteIdeaUser) => del<void>(`/ideaUser?userId=${params.userId}&ideaId=${params.ideaId}`);

export const fetchProject = (id: string) => get<ProjectDto>(`/project/${id}`);
export const fetchCreateProject = (params: CreateProject) => post<number>('/project', params);
export const fetchUpdateProject = (id: number, params: CreateProject) => post<number>(`/project/${id}/update`, params);
export const fetchUserProjects = () => get<ProjectDto[]>(`/user/projects`);
export const fetchPassportProjects = () => get<ProjectDto[]>('/passport/projects');
export const fetchCreateProjectUser = (params: CreateProjectUser) => post<void>('/projectUser', params);
export const fetchProjectLeave = (id: number) => del<void>(`/project/${id}/leave`);

export const fetchMeets = () => get<MeetDto[]>(`/user/meets`);
export const fetchCreateMeet = (params: CreateMeet) => post<void>('/meet', params);
export const fetchUpdateMeet = (id: number, params: UpdateMeet) => put<void>(`/meet/${id}`, params);
export const fetchUpdateMeetStatus = (id: number, params: { status: MeetStatus }) => put<void>(`/meet/${id}/status`, params);
export const fetchDeleteMeet = (id: number) => del<void>(`/meet/${id}`);
export const fetchCreateMeetUser = (params: CreateMeetUser) => post<void>('/meetUser', params);
export const fetchDeleteMeetUser = ({ userId, meetId }: DeleteMeetUser) => del<void>(`/meetUser?userId=${userId}&meetId=${meetId}`);
export const fetchTeacherMeets = () => get<MeetDto[]>('/teacher/meets');

export const fetchPlace = (id: number) => get<PlaceDto>(`/place/${id}`);
export const fetchPlaces = () => get<PlaceDto[]>('/places');
export const fetchCreatePlace = (params: CreatePlace) => post<number>('/place', params);
export const fetchUpdatePlace = (params: PlaceFormValues) => put<void>(`/place`, params);
export const fetchAddTeacher = (passportId: number) => post<void>('/place/teachers', { passportId });
export const fetchAddTeacher2 = (params: { passportId: number; placeId: number }) => post<number>(`/place/${params.placeId}/teacher`, params);
export const fetchCreateLocation = (params: CreateLocation) => post<number>('/place/location', params);
export const fetchPlaceDashboard = () => get<PlaceDashboardDto>(`/place/dashboard`);
export const fetchPlaceTeachers = () => get<TeacherDto[]>(`/place/teachers`);
export const fetchPlaceProjects = () => get<ProjectDto[]>(`/place/projects`);
export const fetchPlaceMeets = () => get<MeetDto[]>(`/place/meets`);
export const fetchPlaceUsers = () => get<UserDto[]>(`/place/users`);
export const fetchPlaceLocations = () => get<LocationDto[]>(`/place/locations`);
export const fetchRemoveTeacher = (placeId: number, passportId: number) => del<void>(`/place/${placeId}/teacher/${passportId}`);
export const fetchLeavePlace = (id: number) => del<void>(`/place/${id}/leave`);

export const fetchPassport = () => get<PassportExtendedDto>('/passport');
export const fetchCreateUser = (params: { title: string; description?: string }) => post<number>('/user', params);

export const fetchPayment = (id: number) => get<PaymentDto>(`/payment/${id}`);
export const fetchCreatePayment = (params: PaymentCreateDto) => post<PaymentCreateResponseDto>('/payments', params);

export const fetchUser = (id: number) => get<any>(`/user/${id}`);
export const fetchUserDashboard = () => get<UserDashboardDto>(`/user/dashboard`);

export const fetchTeacher = (id: number) => get<TeacherPublicDto>(`/teachers/${id}`);
export const fetchTeacherDashboard = () => get<TeacherDashboardDto>(`/teacher/dashboard`);

// Conversation methods
export const fetchConversations = () => get<Conversation[]>('/conversation');
export const fetchStartChat = (passportId: number) => post<StartConversationResponse>('/conversation/start', { passportId });
export const fetchConversation = (id: number) => get<Conversation>(`/conversation/${id}`);

// Message methods
export const fetchCreateMessage = (conversationId: number, content: string) => post<Message>(`/conversation/${conversationId}/messages`, { content });
export const fetchUpdateMessage = (id: number, content: string) => put<void>(`/message2s/${id}`, { content });
export const fetchDeleteMessage = (id: number) => del<void>(`/message2s/${id}`);
